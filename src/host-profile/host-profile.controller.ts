import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { HostProfileService } from './host-profile.service';
import { CreateHostProfileDto } from './dto/create-host-profile.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('HostProfile')
@Controller('host-profiles')
export class HostProfileController {
  constructor(private readonly service: HostProfileService) {}

@ApiBody({ type: CreateHostProfileDto })
@Post()
create(@Body() dto: CreateHostProfileDto) {
  return this.service.create(dto);
}

  @Get(':userId')
  getByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.getByUserId(userId);
  }
}