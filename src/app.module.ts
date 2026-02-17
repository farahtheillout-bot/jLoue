import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BookingsModule } from './bookings/bookings.module';
import { HostProfileModule } from './host-profile/host-profile.module';

@Module({
  imports: [PrismaModule, BookingsModule, HostProfileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}