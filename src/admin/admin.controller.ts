import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ReservationStatus, Role } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/guards';
import { AdminService } from './admin.service';

export class CreateMovieDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsInt() @Min(1) durationMin: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() posterUrl?: string;
}

export class UpdateMovieDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() title?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) durationMin?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() posterUrl?: string;
}

export class CreateScreeningDto {
  @ApiProperty() @IsString() movieId: string;
  @ApiProperty() @IsDateString() startsAt: string;
  @ApiProperty() @IsString() room: string;
  @ApiProperty() @IsInt() @Min(0) priceCents: number;
  @ApiProperty({ minimum: 1, maximum: 200 }) @IsInt() @Min(1) @Max(200) seatCount: number;
  @ApiProperty({ required: false, minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  expectedRatio?: number;
}

export class UpdateScreeningDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() movieId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() startsAt?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() room?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(0) priceCents?: number;
  @ApiProperty({ required: false, minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  expectedRatio?: number;
}

export class UpdateReservationDto {
  @ApiProperty({ enum: ReservationStatus })
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Post('movies') createMovie(@Body() dto: CreateMovieDto) {
    return this.admin.createMovie(dto);
  }
  @Patch('movies/:id') updateMovie(@Param('id') id: string, @Body() dto: UpdateMovieDto) {
    return this.admin.updateMovie(id, dto);
  }
  @Delete('movies/:id') deleteMovie(@Param('id') id: string) {
    return this.admin.deleteMovie(id);
  }
  @Post('screenings') createScreening(@Body() dto: CreateScreeningDto) {
    return this.admin.createScreening(dto);
  }
  @Patch('screenings/:id')
  updateScreening(@Param('id') id: string, @Body() dto: UpdateScreeningDto) {
    return this.admin.updateScreening(id, dto);
  }
  @Delete('screenings/:id') deleteScreening(@Param('id') id: string) {
    return this.admin.deleteScreening(id);
  }
  @Get('reservations') reservations() {
    return this.admin.listReservations();
  }
  @Patch('reservations/:id') updateReservation(
    @Param('id') id: string,
    @Body() dto: UpdateReservationDto,
  ) {
    return this.admin.updateReservation(id, dto.status);
  }
  @Get('analytics') analytics() {
    return this.admin.analytics();
  }
}
