import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
@ApiTags('catalog')
@Controller()
export class CatalogController {
  constructor(private readonly prisma: PrismaService) {}
  @Get('movies') movies() {
    return this.prisma.movie.findMany({
      include: {
        screenings: { where: { startsAt: { gte: new Date() } }, orderBy: { startsAt: 'asc' } },
      },
    });
  }
  @Get('screenings/:id/seats') async seats(@Param('id') id: string) {
    const result = await this.prisma.screening.findUnique({
      where: { id },
      include: {
        movie: true,
        seats: { include: { reservationSeats: true }, orderBy: { label: 'asc' } },
      },
    });
    if (!result) throw new NotFoundException('Séance introuvable');
    return {
      ...result,
      seats: result.seats.map(({ reservationSeats, ...seat }) => ({
        ...seat,
        available: !reservationSeats.length,
      })),
    };
  }
}
