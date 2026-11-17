import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovieDto, CreateScreeningDto } from './admin.controller';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  createMovie(dto: CreateMovieDto) {
    return this.prisma.movie.create({ data: dto });
  }

  async createScreening(dto: CreateScreeningDto) {
    if (!await this.prisma.movie.findUnique({ where: { id: dto.movieId } })) {
      throw new NotFoundException('Film introuvable');
    }
    return this.prisma.screening.create({
      data: {
        movieId: dto.movieId,
        startsAt: new Date(dto.startsAt),
        room: dto.room,
        priceCents: dto.priceCents,
        expectedRatio: dto.expectedRatio ?? 0.6,
        seats: {
          create: Array.from({ length: dto.seatCount }, (_, index) => ({
            label: `${String.fromCharCode(65 + Math.floor(index / 10))}${(index % 10) + 1}`,
          })),
        },
      },
      include: { movie: true, seats: true },
    });
  }
}
