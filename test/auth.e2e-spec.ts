import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

describe('Auth HTTP integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest
              .fn()
              .mockResolvedValue({ accessToken: 'test-token', user: { role: 'USER' } }),
          },
        },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => app.close());

  it('POST /auth/login retourne le jeton et le rôle', async () => {
    await request(app.getHttpServer() as Server)
      .post('/auth/login')
      .send({ email: 'user@demo.cinema', password: 'DemoUser123!' })
      .expect(201)
      .expect({ accessToken: 'test-token', user: { role: 'USER' } });
  });
});
