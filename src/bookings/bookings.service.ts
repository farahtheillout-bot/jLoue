import { Injectable, BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(dto: {
    listingId: number;
    renterId: number;
    startDate: Date;
    endDate: Date;
  }) {
    const { listingId, renterId } = dto;
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (!(endDate > startDate)) {
      throw new BadRequestException('endDate must be > startDate');
    }

    return this.prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({
        where: { id: listingId },
        select: { id: true, ownerId: true, basePrice: true, status: true },
      });

      if (!listing) throw new NotFoundException('Listing not found');
      if (listing.status !== 'PUBLISHED') throw new BadRequestException('Listing not bookable');

      // 1) host cannot book own listing
      if (listing.ownerId === renterId) {
        throw new ForbiddenException('Host cannot book own listing');
      }

      // 2) overlap check (PENDING + CONFIRMED)
      const overlap = await tx.booking.findFirst({
        where: {
          listingId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        },
        select: { id: true },
      });

      if (overlap) {
        throw new ConflictException('Dates overlap');
      }

      // 3) totalPrice calc (centimes)
      const msPerDay = 24 * 60 * 60 * 1000;
      const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay);
      if (nights <= 0) throw new BadRequestException('Invalid date range');

      const totalPrice = nights * listing.basePrice;

      // 4) status starts as PENDING
      return tx.booking.create({
        data: {
          listingId,
          renterId,
          startDate,
          endDate,
          totalPrice,
          status: 'PENDING',
        },
      });
    });
  }

  async confirmBooking(bookingId: number, actorUserId: number) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        select: {
          id: true,
          status: true,
          listingId: true,
          startDate: true,
          endDate: true,
          listing: { select: { ownerId: true } },
        },
      });

      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.status !== 'PENDING') throw new BadRequestException('Only PENDING can be confirmed');

      // seul le host (owner) confirme
      if (booking.listing.ownerId !== actorUserId) {
        throw new ForbiddenException('Only host can confirm');
      }

      // re-check overlap (au moment de confirmer)
      const overlap = await tx.booking.findFirst({
        where: {
          listingId: booking.listingId,
          status: { in: ['CONFIRMED'] }, // CONFIRMED bloque sûr
          startDate: { lt: booking.endDate },
          endDate: { gt: booking.startDate },
          NOT: { id: booking.id },
        },
        select: { id: true },
      });

      if (overlap) throw new ConflictException('Dates overlap');

      return tx.booking.update({
        where: { id: booking.id },
        data: { status: 'CONFIRMED' },
      });
    });
  }
}