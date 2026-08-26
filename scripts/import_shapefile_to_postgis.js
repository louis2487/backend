/**
 * 쉐이프파일 → tb_jangsu_info INSERT SQL 생성기
 *
 * 사용:
 *   cd back
 *   npm install shapefile
 *   node scripts/import_shapefile_to_postgis.js "C:\path\최종-조사대상필지.shp" --limit 5
 *
 * 옵션:
 *   --limit N        N건만 출력 (기본 5)
 *   --pnu-prefix X   PNU 앞자리 필터 (예: 45720=장수군, 45740=순창군)
 *   --output FILE    SQL 파일 경로 (기본: scripts/out_test_parcels.sql)
 *   --source-srid N  원본 좌표계 (기본 5186, .prj 없을 때)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function parseArgs(argv) {
  const opts = {
    shpPath: null,
    limit: 5,
    pnuPrefix: null,
    output: path.join(__dirname, 'out_test_parcels.sql'),
    sourceSrid: 5186,
  };
  const rest = argv.slice(2);
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === '--limit') opts.limit = parseInt(rest[++i], 10);
    else if (a === '--pnu-prefix') opts.pnuPrefix = rest[++i];
    else if (a === '--output') opts.output = rest[++i];
    else if (a === '--source-srid') opts.sourceSrid = parseInt(rest[++i], 10);
    else if (!a.startsWith('--')) opts.shpPath = a;
  }
  return opts;
}

function escSql(val) {
  if (val === null || val === undefined) return 'NULL';
  return `'${String(val).replace(/'/g, "''")}'`;
}

function ringToWkt(ring) {
  const pts = ring.map(([x, y]) => `${x} ${y}`).join(', ');
  return `(${pts})`;
}

function geomToWkt(geometry) {
  if (!geometry) return null;
  const { type, coordinates } = geometry;
  if (type === 'Polygon') {
    const rings = coordinates.map(ringToWkt).join(', ');
    return `POLYGON(${rings})`;
  }
  if (type === 'MultiPolygon') {
    const polys = coordinates
      .map((poly) => `(${poly.map(ringToWkt).join(', ')})`)
      .join(', ');
    return `MULTIPOLYGON(${polys})`;
  }
  return null;
}

function pickProps(props) {
  const lower = {};
  Object.keys(props || {}).forEach((k) => {
    lower[k.toLowerCase()] = props[k];
  });
  return {
    pnu: (lower.pnu || '').toString().trim(),
    jibun: (lower.jibun || '').toString().trim(),
    sgg_oid: (lower.sgg_oid || '').toString().trim(),
    col_adm_se: (lower.col_adm_se || '').toString().trim(),
  };
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.shpPath) {
    console.error('사용법: node scripts/import_shapefile_to_postgis.js <shp경로> [--limit 5] [--pnu-prefix 45720]');
    process.exit(1);
  }

  let shapefile;
  try {
    shapefile = require('shapefile');
  } catch (_) {
    console.error('shapefile 패키지가 없습니다. back 폴더에서 npm install shapefile 실행하세요.');
    process.exit(1);
  }

  const base = opts.shpPath.replace(/\.shp$/i, '');
  const source = await shapefile.open(base + '.shp', base + '.dbf', { encoding: 'EUC-KR' });

  const lines = [];
  lines.push('-- 자동 생성: import_shapefile_to_postgis.js');
  lines.push('CREATE EXTENSION IF NOT EXISTS postgis;');
  lines.push('');

  let seq = 100001;
  let count = 0;

  while (count < opts.limit) {
    const result = await source.read();
    if (result.done) break;

    const props = pickProps(result.value.properties);
    if (opts.pnuPrefix && !props.pnu.startsWith(opts.pnuPrefix)) continue;

    const wkt = geomToWkt(result.value.geometry);
    if (!wkt) continue;

    const fpopKey = `TEST-${props.pnu || crypto.randomUUID()}`;
    const grpId = props.col_adm_se || 'TEST_GRP';
    const geomExpr =
      opts.sourceSrid === 4326
        ? `ST_SetSRID(ST_GeomFromText('${wkt}'), 4326)`
        : `ST_Transform(ST_SetSRID(ST_GeomFromText('${wkt}'), ${opts.sourceSrid}), 4326)`;

    lines.push(`INSERT INTO tb_jangsu_info (`);
    lines.push(`  csft_seq, grp_id, fpop_key, pnu, addr, geom, geo_center,`);
    lines.push(`  reg_date, mod_date, inspection_flag, write_data`);
    lines.push(`) VALUES (`);
    lines.push(`  ${seq}, ${escSql(grpId)}, ${escSql(fpopKey)}, ${escSql(props.pnu || null)}, ${escSql(props.jibun || null)},`);
    lines.push(`  ${geomExpr},`);
    lines.push(`  ST_Centroid(${geomExpr}),`);
    lines.push(`  TO_CHAR(NOW(), 'YYYYMMDDHH24MISS'), TO_CHAR(NOW(), 'YYYYMMDDHH24MISS'), 'N', 'N'`);
    lines.push(`);`);
    lines.push('');

    seq += 1;
    count += 1;
  }

  if (count === 0) {
    console.error('조건에 맞는 필지가 없습니다. --pnu-prefix 를 확인하세요.');
    process.exit(1);
  }

  fs.writeFileSync(opts.output, lines.join('\n'), 'utf8');
  console.log(`SQL ${count}건 생성: ${opts.output}`);
  console.log('DB에서 실행 후 getBoundsList API로 확인하세요.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
