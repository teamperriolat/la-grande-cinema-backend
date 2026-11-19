import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovieDto, CreateScreeningDto } from './admin.controller';
import { ReservationStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  createMovie(dto: CreateMovieDto) {
    return this.prisma.movie.create({ data: dto });
  }

  async createScreening(dto: CreateScreeningDto) {
    if (!(await this.prisma.movie.findUnique({ where: { id: dto.movieId } }))) {
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

  listReservations() {
    return this.prisma.reservation.findMany({
      include: {
        user: { select: { email: true } },
        screening: { include: { movie: true } },
        seats: { include: { seat: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateReservation(id: string, status: ReservationStatus) {
    if (!(await this.prisma.reservation.findUnique({ where: { id } }))) {
      throw new NotFoundException('Réservation introuvable');
    }
    return this.prisma.$transaction(async (tx) => {
      if (status === ReservationStatus.CANCELLED) {
        await tx.reservationSeat.deleteMany({ where: { reservationId: id } });
      }
      return tx.reservation.update({ where: { id }, data: { status } });
    });
  }

  async analytics() {
    const screenings = await this.prisma.screening.findMany({
      include: {
        movie: { select: { title: true } },
        seats: { include: { reservationSeats: true } },
      },
      orderBy: { startsAt: 'asc' },
    });
    return screenings.map((screening) => {
      const capacity = screening.seats.length;
      const occupied = screening.seats.filter((seat) => seat.reservationSeats.length > 0).length;
      return {
        screeningId: screening.id,
        movieTitle: screening.movie.title,
        startsAt: screening.startsAt,
        capacity,
        occupied,
        occupancyRate: capacity ? Math.round((occupied / capacity) * 10000) / 100 : 0,
        forecastAttendance: Math.round(capacity * screening.expectedRatio),
      };
    });
  }
}
