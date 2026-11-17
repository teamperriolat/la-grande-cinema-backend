import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReservationsModule } from './reservations/reservations.module';
@Module({ imports: [PrismaModule, AuthModule, CatalogModule, ReservationsModule] })
export class AppModule {}
