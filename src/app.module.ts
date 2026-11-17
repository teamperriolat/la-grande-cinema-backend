import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReservationsModule } from './reservations/reservations.module';
import { AdminModule } from './admin/admin.module';
@Module({ imports: [PrismaModule, AuthModule, CatalogModule, ReservationsModule, AdminModule] })
export class AppModule {}
