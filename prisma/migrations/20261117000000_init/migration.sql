CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "ReservationStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'USED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Movie" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "durationMin" INTEGER NOT NULL,
  "posterUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Screening" (
  "id" TEXT NOT NULL,
  "movieId" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "room" TEXT NOT NULL,
  "priceCents" INTEGER NOT NULL,
  "expectedRatio" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Screening_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Seat" (
  "id" TEXT NOT NULL,
  "screeningId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Reservation" (
  "id" TEXT NOT NULL,
  "ticketCode" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "screeningId" TEXT NOT NULL,
  "totalCents" INTEGER NOT NULL,
  "status" "ReservationStatus" NOT NULL DEFAULT 'CONFIRMED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReservationSeat" (
  "reservationId" TEXT NOT NULL,
  "seatId" TEXT NOT NULL,
  CONSTRAINT "ReservationSeat_pkey" PRIMARY KEY ("reservationId", "seatId")
);

CREATE UNIQUE INDEX "Seat_screeningId_label_key" ON "Seat"("screeningId", "label");
CREATE UNIQUE INDEX "Reservation_ticketCode_key" ON "Reservation"("ticketCode");
CREATE UNIQUE INDEX "ReservationSeat_seatId_key" ON "ReservationSeat"("seatId");
ALTER TABLE "Screening" ADD CONSTRAINT "Screening_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_screeningId_fkey" FOREIGN KEY ("screeningId") REFERENCES "Screening"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_screeningId_fkey" FOREIGN KEY ("screeningId") REFERENCES "Screening"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReservationSeat" ADD CONSTRAINT "ReservationSeat_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReservationSeat" ADD CONSTRAINT "ReservationSeat_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
