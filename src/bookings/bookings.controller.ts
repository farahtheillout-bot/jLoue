import { Controller, Post, Body, Param, Patch, Get, ParseIntPipe } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get(':id')
  getBooking(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.getBookingById(id);
  }

  @Post()
  create(@Body() dto: any) {
    return this.bookingsService.createBooking(dto);
  }

  @Patch(':id/confirm')
  confirm(
    @Param('id', ParseIntPipe) id: number,
    @Body('actorUserId') actorUserId: number,
  ) {
    return this.bookingsService.confirmBooking(id, actorUserId);
  }
}
