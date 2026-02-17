import { Module } from '@nestjs/common';
import { HostProfileService } from './host-profile.service';
import { HostProfileController } from './host-profile.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HostProfileController],
  providers: [HostProfileService],
})
export class HostProfileModule {}