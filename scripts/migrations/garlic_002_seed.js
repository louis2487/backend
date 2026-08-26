/**
 * Seed garlic_a from garlic_seed_geojson.json (parsed Shapefile).
 * Usage: node scripts/migrations/garlic_002_seed.js
 */
const fs = require('fs');
const path = require('path');
const pg = require('../../app/models/db.js');

const seedPath = path.join(__dirname, 'garlic_seed_geojson.json');

function esc(v) {
  if (v == null) return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}

function ringToWkt(ring) {
  return ring.map(([lon, lat]) => `${lon} ${lat}`).join(', ');
}

function coordsToMultiPolygonWkt(coords) {
  // coords: array of rings (first = exterior). Shapefile may have one polygon.
  if (!coords || !coords.length) return null;
  const polys = coords.map((ring) => `((${ringToWkt(ring)}))`);
  return `MULTIPOLYGON(${polys.join(',')})`;
}

async function main() {
  const raw = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const client = await pg.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      fs.readFileSync(path.join(__dirname, 'garlic_001_schema.sql'), 'utf8')
    );

    let n = 0;
    for (const row of raw) {
      const a = row.attrs || {};
      const id = String(a.ID || a.id || '').trim();
      if (!id) continue;
      const wkt = coordsToMultiPolygonWkt(row.coords);
      if (!wkt) continue;

      const sql = `
        INSERT INTO garlic_a (
          id, uid, pnu, stdg_cd, stdg_addr, clsf_nm, clsf_cd, ldcg_cd, sb_pnu,
          area, source_nm, flight_ymd, attrs, geom, geo_center
        ) VALUES (
          ${esc(id)},
          ${esc(a.UID)},
          ${esc(a.PNU)},
          ${esc(a.STDG_CD)},
          ${esc(a.STDG_ADDR)},
          ${esc(a.CLSF_NM)},
          ${esc(a.CLSF_CD)},
          ${esc(a.LDCG_CD)},
          ${esc(a.SB_PNU)},
          ${a.AREA == null ? 'NULL' : Number(a.AREA)},
          ${esc(a.SOURCE_NM)},
          ${esc(a.FLIGHT_YMD)},
          ${esc(JSON.stringify(a))}::jsonb,
          ST_Multi(ST_SetSRID(ST_GeomFromText('${wkt}'), 4326)),
          ST_PointOnSurface(ST_SetSRID(ST_GeomFromText('${wkt}'), 4326))
        )
        ON CONFLICT (id) DO UPDATE SET
          uid = EXCLUDED.uid,
          pnu = EXCLUDED.pnu,
          stdg_addr = EXCLUDED.stdg_addr,
          clsf_nm = EXCLUDED.clsf_nm,
          area = EXCLUDED.area,
          attrs = EXCLUDED.attrs,
          geom = EXCLUDED.geom,
          geo_center = EXCLUDED.geo_center;
      `;
      await client.query(sql);
      n += 1;
    }

    await client.query('COMMIT');
    console.log(`garlic_a seeded: ${n} parcels`);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('garlic seed failed:', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pg.end();
  }
}

main();
