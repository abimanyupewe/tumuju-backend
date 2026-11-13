# TUMUJU Backend

[![NestJS](https://img.shields.io/badge/NestJS-12-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-runtime-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![OXLint](https://img.shields.io/badge/OXLint-checked-3B82F6)](https://oxc.rs/docs/guide/usage/linter.html)
[![Prettier](https://img.shields.io/badge/Prettier-formatted-F7B93E?logo=prettier&logoColor=black)](https://prettier.io/)
[![OpenStreetMap](https://img.shields.io/badge/Map_data-OpenStreetMap-7EBC6F?logo=openstreetmap&logoColor=white)](https://www.openstreetmap.org/copyright)
[![License](https://img.shields.io/badge/License-UNLICENSED-lightgrey)](#license)

Backend REST API untuk TUMUJU, aplikasi Android perencana perjalanan transportasi umum di Malang Raya. Repository ini saat ini berisi fondasi NestJS. Fitur transportasi akan memakai data OpenStreetMap yang berlisensi terbuka untuk peta dan titik transportasi, bukan jadwal atau rekomendasi perjalanan yang belum terverifikasi.

## Status

Fase 0 selesai. MVP awal dibatasi pada peta, pencarian lokasi, dan titik transportasi yang tersedia di OpenStreetMap. Trip planner, jadwal, estimasi kedatangan, dan data realtime ditunda hingga tersedia data operator yang dapat digunakan secara sah. Keputusan dan batasannya tercatat di [audit Fase 0](dev/PHASE_0_DATA_AUDIT.md).

## Stack

| Area | Teknologi |
| --- | --- |
| Runtime | Node.js |
| Framework | NestJS 12 |
| Bahasa | TypeScript 6 |
| Pengujian | Vitest dan Supertest |
| Lint | OXLint |
| Format | Prettier |
| Observability | NestJS Observe |
| Data peta MVP | OpenStreetMap, ODbL |

## Menjalankan proyek

Prasyarat: Node.js dan npm.

```bash
npm install
npm run start:dev
```

Server berjalan pada `http://localhost:3000` secara default. Atur port lain melalui `PORT`.

```bash
PORT=3001 npm run start:dev
```

Untuk build dan menjalankan hasil build:

```bash
npm run build
npm run start:prod
```

## Perintah yang tersedia

| Perintah | Kegunaan |
| --- | --- |
| `npm run start` | Menjalankan server NestJS. |
| `npm run start:dev` | Menjalankan server dengan watch mode. |
| `npm run build` | Mengompilasi TypeScript ke `dist/`. |
| `npm run lint` | Memeriksa kode TypeScript dengan OXLint. |
| `npm run format` | Memformat `src/` dan `test/` dengan Prettier. |
| `npm run test` | Menjalankan unit test. |
| `npm run test:e2e` | Menjalankan end-to-end test. |
| `npm run test:cov` | Menjalankan test dengan laporan cakupan. |

## API saat ini (Fase 1)

Prefix global: `/api/v1`
Dokumentasi interaktif Swagger: `http://localhost:3000/api/docs`

| Method | Path | Kegunaan | Parameter / Query |
| --- | --- | --- | --- |
| `GET` | `/api/v1/health` | Diagnostic & health readiness status | - |
| `GET` | `/api/v1/stops` | Pencarian halte, stasiun, terminal dengan paginasi & filter | `query`, `type`, `page`, `limit` |
| `GET` | `/api/v1/stops/nearby` | Pencarian stop terdekat (Haversine Distance) | `lat`, `lng`, `radius`, `limit` |
| `GET` | `/api/v1/stops/:id` | Detail lengkap titik transportasi | `id` |
| `GET` | `/api/v1/routes` | Daftar rute publik terverifikasi (KAI, Bus, Angkot) | `mode` |
| `GET` | `/api/v1/routes/:id` | Detail rute dan urutan titik pemberhentian (stops) | `id` |

```bash
# Contoh pengujian endpoint
curl http://localhost:3000/api/v1/health
curl "http://localhost:3000/api/v1/stops?query=Kotabaru"
curl "http://localhost:3000/api/v1/stops/nearby?lat=-7.982563&lng=112.630761&radius=3000"
curl http://localhost:3000/api/v1/routes
```

## Struktur proyek (Clean Architecture)

```text
src/
  common/                 Komponen lintas modul (Filters, Interceptors, Errors, Utils)
    errors/               Domain error classes (AppError)
    filters/              Global exception filter (standard error JSON)
    interceptors/         Request context, request-id, response-time tracker
    result/               Functional Result/Either pattern
    utils/                Geospatial utility (Haversine formula & bounding box)
  config/                 Typed configuration module & environment loader
  infrastructure/
    database/             PrismaService database connector
  modules/
    health/               Health & system readiness module
    stops/                Fitur Transport Stops (Domain, Application, Infrastructure, Presentation)
    routes/               Fitur Transport Routes (Domain, Application, Infrastructure, Presentation)
  main.ts                 Bootstrap server, Swagger, global pipes & filters
prisma/
  schema.prisma           PostgreSQL/Neon Prisma schema
  seed.ts                 Database seeder snapshot Malang Raya
test/
  app.e2e-spec.ts         Pengujian HTTP end-to-end lengkap
```

## Konfigurasi dan data

Simpan rahasia hanya di `.env`, yang sudah diabaikan Git. NestJS Observe membaca `OBSERVE_APP_KEY` dan `OBSERVE_APP_SECRET`; hubungkan aplikasi dengan:

```bash
npx @nestjs/observe link
```

Jangan menyimpan API key pada aplikasi Flutter. Untuk data OpenStreetMap, tampilkan atribusi `© OpenStreetMap contributors`, patuhi ODbL, cache hasil yang digunakan, dan jangan memakai layanan publik sebagai backend tanpa batas.

## Verifikasi sebelum pull request

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

Gunakan commit Conventional Commits, misalnya `feat: add stop search endpoint` atau `fix: validate invalid coordinates`. Pull request perlu menjelaskan perubahan API, perubahan environment, cara pengujian, dan dampak pada aplikasi Flutter.

## License

Repository ini bersifat private dan berlisensi `UNLICENSED`. Jangan mendistribusikan ulang kode atau data tanpa persetujuan pemilik dan tanpa memeriksa lisensi sumber data.
