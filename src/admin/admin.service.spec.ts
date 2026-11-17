import { NotFoundException } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { AdminService } from './admin.service';

describe('AdminService reservations', () => {
  const tx = { reservationSeat: { deleteMany: jest.fn() }, reservation: { update: jest.fn() } };
  const prisma = {
    reservation: { findMany: jest.fn(), findUnique: jest.fn() },
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
  };
  const service = new AdminService(prisma as never);
  beforeEach(() => jest.clearAllMocks());

  it('libère les sièges lors de l’annulation', async () => {
    prisma.reservation.findUnique.mockResolvedValue({ id: 'r1' });
    tx.reservation.update.mockResolvedValue({ id: 'r1', status: ReservationStatus.CANCELLED });
    await service.updateReservation('r1', ReservationStatus.CANCELLED);
    expect(tx.reservationSeat.deleteMany).toHaveBeenCalledWith({ where: { reservationId: 'r1' } });
  });

  it('retourne 404 pour une réservation inconnue', async () => {
    prisma.reservation.findUnique.mockResolvedValue(null);
    await expect(service.updateReservation('missing', ReservationStatus.USED)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('calcule le taux de remplissage et la fréquentation estimée', async () => {
    (prisma as any).screening = {
      findMany: jest.fn().mockResolvedValue([{
        id: 's1', startsAt: new Date(), expectedRatio: 0.6, movie: { title: 'Film' },
        seats: [{ reservationSeats: [{}] }, { reservationSeats: [] }],
      }]),
    };
    await expect(service.analytics()).resolves.toEqual([expect.objectContaining({ capacity: 2, occupied: 1, occupancyRate: 50, forecastAttendance: 1 })]);
  });
});
