import { JwtPayload, JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('retourne le contenu validé du jeton', () => {
    const strategy = new JwtStrategy();
    const payload: JwtPayload = {
      sub: 'user-1',
      email: 'user@demo.cinema',
      role: 'USER',
    };

    expect(strategy.validate(payload)).toBe(payload);
  });
});
