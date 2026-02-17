import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HostProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: {
    userId: number;
    displayName: string;
    phone?: string;
    addressLine1?: string;
    city?: string;
    country?: string;
  }) {
    if (!dto.displayName?.trim()) throw new BadRequestException('displayName is required');

    // user must exist
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');

    // prevent duplicates
    const existing = await this.prisma.hostProfile.findUnique({
      where: { userId: dto.userId },
      select: { id: true },
    });
    if (existing) throw new ConflictException('HostProfile already exists for this user');

    return this.prisma.hostProfile.create({
      data: {
        userId: dto.userId,
        displayName: dto.displayName.trim(),
        phone: dto.phone,
        addressLine1: dto.addressLine1,
        city: dto.city,
        country: dto.country,
      },
    });
  }

  async getByUserId(userId: number) {
    const hp = await this.prisma.hostProfile.findUnique({
      where: { userId },
    });
    if (!hp) throw new NotFoundException('HostProfile not found');
    return hp;
  }
}


