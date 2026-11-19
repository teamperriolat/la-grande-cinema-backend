import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from './guards';

describe('RolesGuard', () => {
  const context = (role: Role) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { role } }) }),
    }) as unknown as ExecutionContext;

  it('autorise ADMIN sur une route ADMIN', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([Role.ADMIN]),
    } as unknown as Reflector;
    expect(new RolesGuard(reflector).canActivate(context(Role.ADMIN))).toBe(true);
  });

  it('autorise une route sans restriction de rôle', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    expect(new RolesGuard(reflector).canActivate(context(Role.USER))).toBe(true);
  });

  it('refuse USER sur une route ADMIN', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([Role.ADMIN]),
    } as unknown as Reflector;
    expect(new RolesGuard(reflector).canActivate(context(Role.USER))).toBe(false);
  });
});
