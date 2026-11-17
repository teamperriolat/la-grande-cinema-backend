# Le Grand Cinéma — Backend

API minimale de réservation de cinéma avec NestJS, TypeScript, Prisma et PostgreSQL.

Fonctions : JWT (`USER`/`ADMIN`), films et séances, sièges disponibles, réservation atomique, billet numérique, administration, remplissage et prévision simple. Swagger est disponible sur `/docs`.

## Lancer localement

```bash
cp .env.example .env
npm ci
npx prisma db push
npm run seed
npm run start:dev
```

Comptes de démonstration locaux uniquement :

- `user@demo.cinema` / `DemoUser123!` (`USER`)
- `admin@demo.cinema` / `DemoAdmin123!` (`ADMIN`)

Changez ou supprimez ces comptes avant toute exposition réelle.

## Vérifications

```bash
npm run lint
npm test
npm run test:e2e
npm run test:cov
npm run build
```

Les tests isolent Prisma et ne nécessitent pas de base locale. Docker n’est pas disponible sur la machine de développement actuelle ; la configuration fournie doit donc être validée sur une machine équipée de Docker.
