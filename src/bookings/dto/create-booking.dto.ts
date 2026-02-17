import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty()
  listingId: number;

  @ApiProperty()
  renterId: number;

  @ApiProperty({ example: '2026-02-18T10:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2026-02-18T12:00:00.000Z' })
  endDate: Date;
}