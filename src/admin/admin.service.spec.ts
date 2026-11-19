import { NotFoundException } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  const tx = {
    reservationSeat: { deleteMany: jest.fn() },
    reservation: { update: jest.fn() },
  };
  const prisma = {
    movie: { create: jest.fn(), findUnique: jest.fn() },
    screening: { create: jest.fn(), findMany: jest.fn() },
    reservation: { findMany: jest.fn(), findUnique: jest.fn() },
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
  };
  const service = new AdminService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('crée un film', async () => {
    const dto = { title: 'Film', description: 'Description', durationMin: 95 };
    prisma.movie.create.mockResolvedValue({ id: 'movie-1', ...dto });

    await expect(service.createMovie(dto)).resolves.toEqual({ id: 'movie-1', ...dto });
    expect(prisma.movie.create).toHaveBeenCalledWith({ data: dto });
  });

  it('crée une séance et ses places par rangées', async () => {
    prisma.movie.findUnique.mockResolvedValue({ id: 'movie-1' });
    prisma.screening.create.mockResolvedValue({ id: 'screening-1' });

    await service.createScreening({
      movieId: 'movie-1',
      startsAt: '2026-11-20T18:00:00.000Z',
      room: 'Salle 1',
      priceCents: 1200,
      seatCount: 12,
    });

    const call = prisma.screening.create.mock.calls[0][0];
    expect(call.data.expectedRatio).toBe(0.6);
    expect(call.data.seats.create).toHaveLength(12);
    expect(call.data.seats.create[0]).toEqual({ label: 'A1' });
    expect(call.data.seats.create[10]).toEqual({ label: 'B1' });
  });

  it('refuse de créer une séance pour un film inconnu', async () => {
    prisma.movie.findUnique.mockResolvedValue(null);

    await expect(
      service.createScreening({
        movieId: 'missing',
        startsAt: '2026-11-20T18:00:00.000Z',
        room: 'Salle 1',
        priceCents: 1200,
        seatCount: 10,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('liste les réservations récentes', async () => {
    prisma.reservation.findMany.mockResolvedValue([{ id: 'reservation-1' }]);

    await expect(service.listReservations()).resolves.toEqual([{ id: 'reservation-1' }]);
    expect(prisma.reservation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
    );
  });

  it('libère les sièges lors de l’annulation', async () => {
    prisma.reservation.findUnique.mockResolvedValue({ id: 'r1' });
    tx.reservation.update.mockResolvedValue({
      id: 'r1',
      status: ReservationStatus.CANCELLED,
    });

    await service.updateReservation('r1', ReservationStatus.CANCELLED);

    expect(tx.reservationSeat.deleteMany).toHaveBeenCalledWith({
      where: { reservationId: 'r1' },
    });
  });

  it('conserve les sièges lorsque le billet est utilisé', async () => {
    prisma.reservation.findUnique.mockResolvedValue({ id: 'r1' });
    tx.reservation.update.mockResolvedValue({ id: 'r1', status: ReservationStatus.USED });

    await service.updateReservation('r1', ReservationStatus.USED);

    expect(tx.reservationSeat.deleteMany).not.toHaveBeenCalled();
    expect(tx.reservation.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { status: ReservationStatus.USED },
    });
  });

  it('retourne 404 pour une réservation inconnue', async () => {
    prisma.reservation.findUnique.mockResolvedValue(null);

    await expect(
      service.updateReservation('missing', ReservationStatus.USED),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('calcule le remplissage et la fréquentation estimée', async () => {
    prisma.screening.findMany.mockResolvedValue([
      {
        id: 's1',
        startsAt: new Date(),
        expectedRatio: 0.6,
        movie: { title: 'Film' },
        seats: [{ reservationSeats: [{}] }, { reservationSeats: [] }],
      },
      {
        id: 's2',
        startsAt: new Date(),
        expectedRatio: 0.5,
        movie: { title: 'Salle vide' },
        seats: [],
      },
    ]);

    await expect(service.analytics()).resolves.toEqual([
      expect.objectContaining({
        capacity: 2,
        occupied: 1,
        occupancyRate: 50,
        forecastAttendance: 1,
      }),
      expect.objectContaining({ capacity: 0, occupied: 0, occupancyRate: 0 }),
    ]);
  });
});
