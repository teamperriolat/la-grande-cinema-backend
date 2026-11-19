import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({ compare: jest.fn() }));

describe('AuthService', () => {
  const prisma = {
    user: { findUnique: jest.fn() },
  };
  const jwt = {
    signAsync: jest.fn(),
  };
  const service = new AuthService(prisma as never, jwt as unknown as JwtService);
  const compare = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>;

  beforeEach(() => jest.clearAllMocks());

  it('retourne un jeton et le profil pour des identifiants valides', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@demo.cinema',
      passwordHash: 'hash',
      role: Role.USER,
    });
    compare.mockResolvedValue(true as never);
    jwt.signAsync.mockResolvedValue('signed-token');

    await expect(
      service.login({ email: 'user@demo.cinema', password: 'DemoUser123!' }),
    ).resolves.toEqual({
      accessToken: 'signed-token',
      user: { id: 'user-1', email: 'user@demo.cinema', role: Role.USER },
    });
    expect(jwt.signAsync).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'user@demo.cinema',
      role: Role.USER,
    });
  });

  it('refuse un utilisateur inconnu', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@demo.cinema', password: 'DemoUser123!' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(compare).not.toHaveBeenCalled();
  });

  it('refuse un mot de passe incorrect', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@demo.cinema',
      passwordHash: 'hash',
      role: Role.USER,
    });
    compare.mockResolvedValue(false as never);

    await expect(
      service.login({ email: 'user@demo.cinema', password: 'Incorrect123!' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
