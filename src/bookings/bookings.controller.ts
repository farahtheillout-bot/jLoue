import { Controller, Post, Body, Param, Patch } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() dto: any) {
    return this.bookingsService.createBooking(dto);
  }

  @Patch(':id/confirm')
  confirm(
    @Param('id') id: string,
    @Body('actorUserId') actorUserId: number,
  ) {
    return this.bookingsService.confirmBooking(Number(id), actorUserId);
  }
}
