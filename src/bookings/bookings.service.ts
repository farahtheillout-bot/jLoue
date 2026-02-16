import { Injectable, BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}


  @Cron(CronExpression.EVERY_MINUTE)
async cancelExpiredPendingBookings() {
  const now = new Date();

  const res = await this.prisma.booking.updateMany({
    where: {
      status: 'PENDING',
      expiresAt: { lte: now },
    },
    data: {
      status: 'CANCELLED',
      expiresAt: null,
    },
  });

  if (res.count > 0) {
    console.log(`🧹 Cancelled ${res.count} expired PENDING booking(s)`);
  }
}
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
        select: {
  id: true,
  ownerId: true,
  basePrice: true,
  status: true,
  bookingUnit: true,
  minDuration: true,
  maxDuration: true,
  checkInHour: true, 
},

      });

      if (!listing) throw new NotFoundException('Listing not found');
      if (listing.status !== 'PUBLISHED') throw new BadRequestException('Listing not bookable');

      // STRICT alignment validation
if (listing.bookingUnit === 'DAY' || listing.bookingUnit === 'WEEK') {
  const checkInHour = listing.checkInHour;

  if (
    startDate.getHours() !== checkInHour ||
    endDate.getHours() !== checkInHour ||
    startDate.getMinutes() !== 0 ||
    endDate.getMinutes() !== 0 ||
    startDate.getSeconds() !== 0 ||
    endDate.getSeconds() !== 0
  ) {
    throw new BadRequestException(
      `Bookings must align to ${checkInHour}:00 exactly`
    );
  }
}

if (listing.bookingUnit === 'HOUR') {
  if (
    startDate.getMinutes() !== 0 ||
    endDate.getMinutes() !== 0 ||
    startDate.getSeconds() !== 0 ||
    endDate.getSeconds() !== 0
  ) {
    throw new BadRequestException(
      'Hourly bookings must start and end on the hour'
    );
  }
}

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
      const ms = endDate.getTime() - startDate.getTime();
if (ms <= 0) throw new BadRequestException('Invalid date range');

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MS_PER_WEEK = 7 * MS_PER_DAY;

let durationUnits: number;

switch (listing.bookingUnit) {
  case 'HOUR':
    durationUnits = Math.ceil(ms / MS_PER_HOUR);
    break;
  case 'DAY':
    durationUnits = Math.ceil(ms / MS_PER_DAY);
    break;
  case 'WEEK':
    durationUnits = Math.ceil(ms / MS_PER_WEEK);
    break;
  default:
    throw new BadRequestException('Unsupported booking unit');
}

if (durationUnits < listing.minDuration) {
  throw new BadRequestException(`Minimum duration is ${listing.minDuration} ${listing.bookingUnit}(s)`);
}

if (listing.maxDuration != null && durationUnits > listing.maxDuration) {
  throw new BadRequestException(`Maximum duration is ${listing.maxDuration} ${listing.bookingUnit}(s)`);
}

const totalPrice = durationUnits * listing.basePrice;

      // 4) status starts as PENDING
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

return tx.booking.create({
  data: {
    listingId,
    renterId,
    startDate,
    endDate,
    totalPrice,
    status: 'PENDING',
    expiresAt,
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
          expiresAt: true,
          listing: { select: { ownerId: true } },
        },
      });

      if (!booking) throw new NotFoundException('Booking not found');
if (booking.status !== 'PENDING') throw new BadRequestException('Only PENDING can be confirmed');

if (booking.expiresAt && booking.expiresAt < new Date()) {
  throw new BadRequestException('Booking expired');
}

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