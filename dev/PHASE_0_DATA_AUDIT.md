# Phase 0 — Data Audit

**Status:** complete — the route planner is deferred; the low-risk MVP scope is approved.

## Decision

Do not build route-search logic or scheduled-arrival responses until an
authorised transport dataset exists. The API may later report
`data_unavailable`; it must never invent a route or timetable.

The approved MVP is a **map and transport-point explorer** using OpenStreetMap
(OSM) data. OSM does not require permission from each operator, but its ODbL
licence requires visible attribution and may require share-alike when a derived
database is publicly distributed.

## Evidence

- [Dishub Kota Malang](https://dishub.malangkota.go.id/rute-angkutan-kota-malang/)
  publishes angkot route descriptions, including active routes. This is useful
  as a reference, but it is not a machine-readable stop or timetable feed.
- [Satu Data Kota Malang](https://data.malangkota.go.id/) is the official open
  data portal and exposes a CKAN catalogue. A public dataset covering the
  required route-planner fields was not identified in this audit.
- A planner-ready dataset should follow the [GTFS static model](https://developers.google.com/transit/gtfs?hl=id): stops, routes, trips, stop times,
  and service calendar data.
- [OpenStreetMap data](https://www.openstreetmap.org/copyright/attribution-guide)
  is reusable under ODbL with attribution. Its public geocoder and tile servers
  have separate usage limits, so they are not treated as an unlimited backend
  data source.

## Approved Data Use

- Use OSM map data for the map, searchable places, and mapped transport points.
- Store a small, dated Malang-area snapshot in the backend; cache it rather
  than querying a public OSM service for every app request.
- Show `© OpenStreetMap contributors` linked to the OSM copyright page on every
  map and state that transport points may be incomplete or outdated.
- Allow geocoding only after an explicit user search submission. The public
  Nominatim service forbids client-side autocomplete and limits use to one
  request per second.
- Do not publish a timetable, estimated arrival, route recommendation, or
  realtime vehicle location. Those require a separately verified source.

## Deferred Dataset

Obtain a written permission or reusable licence and one versioned source with:

1. `stops`: stable ID, name, latitude, longitude, type, and verification date.
2. `routes` and ordered stop sequences for each direction.
3. `trips`, departure/arrival times, operating calendar, and exceptions. If
   schedules are unavailable, explicitly approve a route-directory-only MVP.
4. Source URL, owner, licence, retrieval time, and data-contact person.

## Next Actions

1. Ask Dishub Kota Malang and relevant operators for a GTFS/CSV export or
   written permission to use their data.
2. Select one small, currently operating corridor as the pilot.
3. Validate every field above against a real journey; record missing fields.
4. Approve one of the gates below before Phase 1.

| Gate | Outcome |
| --- | --- |
| Valid route, stop, and schedule dataset | Add the transport-data schema and planner API. |
| Valid routes but no schedules or stop coordinates | Keep the map/transport-point explorer; do not imply journeys are available. |
| No reusable source | Keep OSM-only features; do not scrape or infer operational data. |
