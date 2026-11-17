import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/guards';
import { AdminService } from './admin.service';

export class CreateMovieDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsInt() @Min(1) durationMin: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() posterUrl?: string;
}

export class CreateScreeningDto {
  @ApiProperty() @IsString() movieId: string;
  @ApiProperty() @IsDateString() startsAt: string;
  @ApiProperty() @IsString() room: string;
  @ApiProperty() @IsInt() @Min(0) priceCents: number;
  @ApiProperty({ minimum: 1, maximum: 200 }) @IsInt() @Min(1) @Max(200) seatCount: number;
  @ApiProperty({ required: false, minimum: 0, maximum: 1 }) @IsOptional() @IsNumber() @Min(0) @Max(1) expectedRatio?: number;
}

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Post('movies') createMovie(@Body() dto: CreateMovieDto) { return this.admin.createMovie(dto); }
  @Post('screenings') createScreening(@Body() dto: CreateScreeningDto) { return this.admin.createScreening(dto); }
}
