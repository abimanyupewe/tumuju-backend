import { PrismaClient } from '@prisma/client';
import { MALANG_ROUTES_SNAPSHOT } from '../src/modules/routes/infrastructure/datasources/malang-routes-dataset.js';
import { MALANG_STOPS_SNAPSHOT } from '../src/modules/stops/infrastructure/datasources/malang-stops-dataset.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding TUMUJU Malang Raya transport data...');

  // 1. Seed Operators
  const operators = [
    {
      id: 'op-kai-commuter',
      name: 'PT Kereta Api Indonesia (Persero) - KAI Commuter',
      mode: 'train',
      source: 'dishub_kai',
    },
    {
      id: 'op-dishub-malang',
      name: 'Dinas Perhubungan Kota Malang',
      mode: 'bus',
      source: 'dishub_malang',
    },
    {
      id: 'op-paguyuban-angkot',
      name: 'Paguyuban Mikrolet Kota Malang',
      mode: 'angkot',
      source: 'dishub_malang',
    },
  ];

  for (const op of operators) {
    await prisma.transportOperator.upsert({
      where: { id: op.id },
      create: op,
      update: op,
    });
  }
  console.log(`✓ Seeded ${operators.length} transport operators.`);

  // 2. Seed Stops
  for (const stop of MALANG_STOPS_SNAPSHOT) {
    await prisma.transportStop.upsert({
      where: { id: stop.id },
      create: {
        id: stop.id,
        name: stop.name,
        code: stop.code,
        latitude: stop.latitude,
        longitude: stop.longitude,
        stopType: stop.stopType,
        source: stop.source,
        sourceId: stop.sourceId,
        license: stop.license,
        verifiedAt: stop.verifiedAt,
      },
      update: {
        name: stop.name,
        code: stop.code,
        latitude: stop.latitude,
        longitude: stop.longitude,
        stopType: stop.stopType,
        source: stop.source,
        sourceId: stop.sourceId,
        license: stop.license,
        verifiedAt: stop.verifiedAt,
      },
    });
  }
  console.log(`✓ Seeded ${MALANG_STOPS_SNAPSHOT.length} transport stops.`);

  // 3. Seed Routes and RouteStops
  for (const r of MALANG_ROUTES_SNAPSHOT) {
    await prisma.transportRoute.upsert({
      where: { id: r.id },
      create: {
        id: r.id,
        operatorId: r.operatorId,
        routeCode: r.routeCode,
        name: r.name,
        mode: r.mode,
        source: r.source,
        status: r.status,
      },
      update: {
        operatorId: r.operatorId,
        routeCode: r.routeCode,
        name: r.name,
        mode: r.mode,
        source: r.source,
        status: r.status,
      },
    });

    for (const rs of r.stops) {
      await prisma.routeStop.upsert({
        where: {
          routeId_stopId_direction: {
            routeId: r.id,
            stopId: rs.stopId,
            direction: rs.direction,
          },
        },
        create: {
          id: rs.id,
          routeId: r.id,
          stopId: rs.stopId,
          stopSequence: rs.stopSequence,
          direction: rs.direction,
        },
        update: {
          stopSequence: rs.stopSequence,
          direction: rs.direction,
        },
      });
    }
  }
  console.log(
    `✓ Seeded ${MALANG_ROUTES_SNAPSHOT.length} routes with stop sequences.`,
  );
  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
