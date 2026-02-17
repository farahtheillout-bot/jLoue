import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { HostProfileService } from './host-profile.service';

@Controller('host-profiles')
export class HostProfileController {
  constructor(private readonly service: HostProfileService) {}

  @Post()
  create(@Body() dto: { userId: number; displayName: string; phone?: string; addressLine1?: string; city?: string; country?: string }) {
    return this.service.create(dto);
  }

  @Get(':userId')
  getByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.getByUserId(userId);
  }
}
