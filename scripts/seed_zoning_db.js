/**
 * 같은 Postgres(jangsucropsdb)의 zb_* 테이블에 스키마·시드·레이어 도형을 넣는다.
 *   node scripts/seed_zoning_db.js
 */
const fs = require('fs');
const path = require('path');
const pg = require('pg');
const dbConfig = require('../app/config/db.config.js');
const { buildOverlays } = require('../app/models/zoning.overlays.js');

const MIGRATIONS = [
  'zoning_001_schema.sql',
  'zoning_001_seed.sql',
  'zoning_002_auth_package.sql',
  'zoning_003_layer_overlays.sql',
];

async function connect() {
  const hosts = [dbConfig.HOST, process.env.ZONING_DB_HOST, '182.213.27.207', '127.0.0.1'].filter(
    (h, i, arr) => h && arr.indexOf(h) === i,
  );
  let lastErr;
  for (const host of hosts) {
    const pool = new pg.Pool({
      host,
      user: dbConfig.USER,
      password: dbConfig.PASSWORD,
      database: dbConfig.DB,
      port: Number(process.env.ZONING_DB_PORT || dbConfig.PORT),
      connectionTimeoutMillis: 8000,
      options: '-c search_path=public,jangsucrops',
    });
    try {
      const client = await pool.connect();
      console.log(`connected ${host}:${dbConfig.PORT}/${dbConfig.DB}`);
      return { pool, client };
    } catch (err) {
      lastErr = err;
      console.warn(`fail ${host}: ${err.message}`);
      await pool.end().catch(() => {});
    }
  }
  throw lastErr;
}

async function run() {
  const { pool, client } = await connect();
  try {
    for (const file of MIGRATIONS) {
      const sql = fs.readFileSync(path.join(__dirname, 'migrations', file), 'utf8');
      console.log(`RUN ${file}`);
      await client.query(sql);
    }

    const overlays = buildOverlays();
    const catalogs = await client.query('SELECT id, side, tree FROM zb_layer_catalog');
    for (const row of catalogs.rows) {
      const tree = typeof row.tree === 'string' ? JSON.parse(row.tree) : row.tree;
      const mark = (id) => {
        for (const n of tree) {
          if (n.id === id) {
            n.visible = true;
            for (const c of n.children || []) c.visible = true;
          }
        }
      };
      mark('bf_theme');
      mark('af_theme');
      mark('bf_cad');
      mark('af_cad');
      mark('inv');
      mark('basemap');
      for (const n of tree) {
        if (n.id === 'basemap') {
          for (const c of n.children || []) {
            if (c.id === 'SAT') {
              c.visible = false;
              c.label = '항공영상(위성)';
            }
          }
        }
        if (n.id === 'bf_cad' || n.id === 'af_cad') {
          for (const c of n.children || []) {
            c.label = String(c.label || '').replace(/브이월드/, '샘플');
          }
        }
      }
      const overlay = overlays[row.side] || overlays.before;
      await client.query(
        'UPDATE zb_layer_catalog SET tree = $2::jsonb, overlays = $3::jsonb WHERE id = $1',
        [row.id, JSON.stringify(tree), JSON.stringify(overlay)],
      );
    }

    const counts = await client.query(`
      SELECT
        (SELECT count(*) FROM zb_inspection_target) AS targets,
        (SELECT count(*) FROM zb_feature) AS features,
        (SELECT count(*) FROM zb_parcel) AS parcels,
        (SELECT count(*) FROM zb_layer_catalog) AS catalogs
    `);
    const overlayCheck = await client.query(
      `SELECT side, jsonb_array_length(COALESCE(overlays->'cadastral', '[]'::jsonb)) AS cad,
              jsonb_array_length(COALESCE(overlays->'theme', '[]'::jsonb)) AS theme
       FROM zb_layer_catalog ORDER BY side`,
    );
    console.log('counts', counts.rows[0]);
    console.log('overlays', overlayCheck.rows);
    console.log('OK');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
