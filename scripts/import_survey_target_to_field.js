/**
 * 공유재산_조사대상.shp → public.field 전량 교체
 *
 *   node scripts/import_survey_target_to_field.js --dry-run
 *   node scripts/import_survey_target_to_field.js
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const shapefile = require('shapefile');
const proj4 = require('proj4');
const dbConfig = require('../app/config/db.config');

proj4.defs(
  'EPSG:5186',
  '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs'
);

const FIELD_MAP = {
  지번: 'col_b',
  도로명: 'col_f',
  용도지역: 'col_h',
  공부지목: 'col_d',
  실면적: 'col_g',
  기준년도: 'col_q',
  재산기준가: 'col_r',
  개별공시지: 'col_s',
  표준지공시: 'col_t',
  재산구분: 'col_u',
  회계구분: 'col_v',
  재산관리관: 'col_w',
  분임관리관: 'col_x',
  위임관리관: 'col_y',
  재산번호: 'col_z',
  공유지분: 'col_aa',
  공유인수: 'col_ab',
  소유일자: 'col_o',
  소유원인: 'col_p',
  취득일자: 'col_ad',
  취득부서: 'col_j',
  취득방법: 'col_i',
  취득가액: 'col_c',
  국토계획법: 'col_ae',
  기타_법령_: 'col_af',
  대부여부: 'col_ag',
  피대부자수: 'col_ap',
  적합여부: 'col_ah',
  사용자명: 'col_ai',
  대부용도: 'col_ax',
  대부면적: 'col_at',
  사용시작일: 'col_al',
  사용종료일: 'col_am',
  대부료: 'col_an',
  대부시설물: 'col_au',
  공부면적: 'col_e',
  note: 'col_bg',
  현장조사: 'col_ak',
};

function parseArgs(argv) {
  const opts = {
    shpPath: null,
    dryRun: false,
    host: process.env.DB_HOST || process.env.PGHOST || '182.213.27.207',
  };
  const rest = argv.slice(2);
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--shp') opts.shpPath = rest[++i];
    else if (a === '--host') opts.host = rest[++i];
    else if (!a.startsWith('--')) opts.shpPath = a;
  }
  return opts;
}

function resolveShp(explicit) {
  if (explicit) return explicit;
  const dir = path.join(process.env.USERPROFILE || '', 'Desktop', '공유재산', '실제 데이터');
  if (!fs.existsSync(dir)) throw new Error(`기본 경로 없음: ${dir}`);
  const shp = fs.readdirSync(dir).find((f) => /\.shp$/i.test(f) && !/\.xml$/i.test(f));
  if (!shp) throw new Error(`shp 없음: ${dir}`);
  return path.join(dir, shp);
}

function toText(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s || s === '자료없음') return null;
  return s;
}

function toYn(v) {
  const s = toText(v);
  if (!s) return null;
  const u = s.toUpperCase();
  if (u === 'Y' || u === 'N') return u;
  if (s.includes('대부') && !s.includes('미대부')) return 'Y';
  if (s.includes('미대부')) return 'N';
  if (s === '적합' || s === '가능') return 'Y';
  if (s === '부적합' || s === '불가') return 'N';
  return s;
}

function toIntArea(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

function ringToWkt(ring) {
  const pts = ring.map(([x, y]) => {
    const [lng, lat] = proj4('EPSG:5186', 'EPSG:4326', [x, y]);
    return `${lng} ${lat}`;
  });
  if (pts[0] !== pts[pts.length - 1]) pts.push(pts[0]);
  return `(${pts.join(', ')})`;
}

function geomToWkt4326(geometry) {
  if (!geometry) return null;
  const { type, coordinates } = geometry;
  if (type === 'Polygon') return `POLYGON(${coordinates.map(ringToWkt).join(', ')})`;
  if (type === 'MultiPolygon') {
    const polys = coordinates.map((poly) => `(${poly.map(ringToWkt).join(', ')})`).join(', ');
    return `MULTIPOLYGON(${polys})`;
  }
  return null;
}

function grpId(props, pnu) {
  const sgg = toText(props['시군']);
  if (sgg) return sgg;
  if (pnu && pnu.length >= 5) return pnu.slice(0, 5);
  return '조사대상';
}

function buildRow(props, geometry, seq) {
  const pnu = toText(props.PNU || props.pnu);
  if (!pnu) return null;
  const wkt = geomToWkt4326(geometry);
  if (!wkt) return null;
  const jibun = toText(props['지번']);
  const road = toText(props['도로명']);
  const jimok = toText(props['공부지목']);
  const area =
    toIntArea(props['실면적']) || toIntArea(props['공부면적']) || toIntArea(props['취득면적']);
  const jaesanNo = toText(props['재산번호']);
  const name = toText(props['재산명']);
  const note = toText(props.note);
  const survey = toText(props['현장조사']);
  const cols = {
    csft_seq: seq,
    fpop_key: pnu,
    grp_id: grpId(props, pnu),
    pnu,
    addr: road || jibun || pnu,
    land_area: area,
    av_area: area,
    fm_land_cd: jimok ? jimok.slice(0, 50) : null,
    crop_nm: name,
    memo: ['survey-target', jaesanNo ? `재산번호=${jaesanNo}` : null, survey, note]
      .filter(Boolean)
      .join('|')
      .slice(0, 500),
    write_data: 'N',
    col_a: pnu,
    wkt,
  };
  for (const [src, col] of Object.entries(FIELD_MAP)) {
    let val = props[src];
    if (col === 'col_ag' || col === 'col_ah') val = toYn(val);
    else val = toText(val);
    cols[col] = val;
  }
  return cols;
}

async function main() {
  const opts = parseArgs(process.argv);
  const shpPath = resolveShp(opts.shpPath);
  const dbfPath = shpPath.replace(/\.shp$/i, '.dbf');
  console.log('공유재산_조사대상 → public.field (전량 교체)');
  console.log(`shp: ${shpPath}`);
  console.log(`mode: ${opts.dryRun ? 'DRY-RUN' : 'APPLY'}`);

  const source = await shapefile.open(shpPath, dbfPath, { encoding: 'EUC-KR' });
  const rows = [];
  const usedKeys = new Map();
  let seq = 100000;
  let skipped = 0;
  while (true) {
    const result = await source.read();
    if (result.done) break;
    seq += 1;
    const row = buildRow(result.value.properties || {}, result.value.geometry, seq);
    if (!row) {
      skipped += 1;
      continue;
    }
    const n = (usedKeys.get(row.fpop_key) || 0) + 1;
    usedKeys.set(row.fpop_key, n);
    if (n > 1) row.fpop_key = `${row.pnu}-${n}`;
    rows.push(row);
  }
  console.log(`parsed: ${rows.length}, skipped: ${skipped}`);
  if (!rows.length) process.exit(1);
  if (opts.dryRun) {
    console.log('sample', {
      pnu: rows[0].pnu,
      grp_id: rows[0].grp_id,
      addr: rows[0].addr,
      col_ak: rows[0].col_ak,
      col_bg: rows[0].col_bg,
      wkt_head: rows[0].wkt.slice(0, 70),
    });
    return;
  }

  const pool = new Pool({
    host: opts.host,
    port: dbConfig.PORT,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
    options: '-c search_path=public,jangsucrops',
  });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET client_encoding TO 'UTF8'");
    const before = await client.query('SELECT COUNT(*)::int AS c FROM public.field');
    console.log(`field before: ${before.rows[0].c}`);
    await client.query('DELETE FROM public.tb_jangus_zone');
    await client.query('DELETE FROM public.field');
    console.log('deleted all field + zone');

    const insertSql = `
      INSERT INTO public.field (
        csft_seq, fpop_key, grp_id, pnu, addr,
        land_area, av_area, gis_area, fm_land_cd, crop_nm, memo,
        geom, geo_center, reg_date, mod_date, write_data,
        col_a, col_b, col_c, col_d, col_e, col_f, col_g, col_h, col_i, col_j,
        col_o, col_p, col_q, col_r, col_s, col_t, col_u, col_v, col_w, col_x, col_y, col_z,
        col_aa, col_ab, col_ad, col_ae, col_af, col_ag, col_ah, col_ai,
        col_al, col_am, col_an, col_ap, col_at, col_au, col_ax, col_bg, col_ak
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        ROUND(ST_Area(ST_MakeValid(ST_SetSRID(ST_GeomFromText($8), 4326))::geography)::numeric, 0)::int,
        $9,$10,$11,
        ST_MakeValid(ST_SetSRID(ST_GeomFromText($8), 4326)),
        ST_PointOnSurface(ST_MakeValid(ST_SetSRID(ST_GeomFromText($8), 4326))),
        TO_CHAR(NOW(), 'YYYYMMDDHH24MISS'),
        TO_CHAR(NOW(), 'YYYYMMDDHH24MISS'),
        $12,
        $13,$14,$15,$16,$17,$18,$19,$20,$21,$22,
        $23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,
        $35,$36,$37,$38,$39,$40,$41,$42,
        $43,$44,$45,$46,$47,$48,$49,$50,$51
      )
    `;
    let inserted = 0;
    for (const r of rows) {
      await client.query(insertSql, [
        r.csft_seq, r.fpop_key, r.grp_id, r.pnu, r.addr,
        r.land_area, r.av_area, r.wkt, r.fm_land_cd, r.crop_nm, r.memo, r.write_data,
        r.col_a, r.col_b, r.col_c, r.col_d, r.col_e, r.col_f, r.col_g, r.col_h, r.col_i, r.col_j,
        r.col_o, r.col_p, r.col_q, r.col_r, r.col_s, r.col_t, r.col_u, r.col_v, r.col_w, r.col_x, r.col_y, r.col_z,
        r.col_aa, r.col_ab, r.col_ad, r.col_ae, r.col_af, r.col_ag, r.col_ah, r.col_ai,
        r.col_al, r.col_am, r.col_an, r.col_ap, r.col_at, r.col_au, r.col_ax, r.col_bg, r.col_ak,
      ]);
      inserted += 1;
      if (inserted % 500 === 0) console.log(`  inserted ${inserted}/${rows.length}`);
    }
    await client.query('COMMIT');
    console.log(`field committed: ${inserted}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[오류] field 적재 실패:', err.message);
    client.release();
    await pool.end();
    process.exit(1);
  }

  try {
    await client.query('BEGIN');
    await client.query(`
      INSERT INTO public.tb_jangus_zone (grp_id, geom, end_flag)
      SELECT grp_id, ST_ConvexHull(ST_Collect(geom))::geometry(Polygon, 4326), 'N'
      FROM public.field
      WHERE geom IS NOT NULL
      GROUP BY grp_id
    `);
    await client.query('COMMIT');
    console.log('zone rebuilt');
  } catch (err) {
    await client.query('ROLLBACK');
    console.warn('[경고] zone 스킵:', err.message);
  }

  const after = await client.query(`
    SELECT COUNT(*)::int AS total,
      ROUND(ST_XMin(ST_Extent(geom))::numeric, 5) AS minx,
      ROUND(ST_YMin(ST_Extent(geom))::numeric, 5) AS miny,
      ROUND(ST_XMax(ST_Extent(geom))::numeric, 5) AS maxx,
      ROUND(ST_YMax(ST_Extent(geom))::numeric, 5) AS maxy
    FROM public.field
  `);
  const s = after.rows[0];
  console.log(`done. total=${s.total} bbox=${s.minx},${s.miny} ~ ${s.maxx},${s.maxy}`);
  client.release();
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
