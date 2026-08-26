/**
 * data/ 폴더 사진 → tb_jangsu_img 연동
 *
 * 파일명: {관리번호}_{1|2|3|4}.(png|jpg|jpeg)
 *   _1 근경 / _2 원경 / _3 항공 / _4 지적
 *
 * 관리번호는 col_a 또는 fpop_key 로 조회한다.
 */
const fs = require('fs');
const path = require('path');
const pg = require('../models/db.js');
const { SLOT_LABELS } = require('./jangsu_img_order');

const BACK_ROOT = path.resolve(__dirname, '../..');
const REPO_ROOT = path.resolve(BACK_ROOT, '..');
const DEFAULT_DATA_DIR = path.resolve(REPO_ROOT, 'data');

const NAME_RE = /^(.+)_([1-4])\.(png|jpe?g)$/i;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function dataPaths(dataDir = DEFAULT_DATA_DIR) {
  const root = path.resolve(dataDir);
  return {
    root,
    done: path.join(root, 'done'),
    error: path.join(root, 'error'),
  };
}

function parsePhotoName(fileName) {
  const m = String(fileName || '').trim().match(NAME_RE);
  if (!m) return null;
  return {
    manageNo: m[1],
    slot: Number(m[2]),
    ext: m[3].toLowerCase() === 'jpeg' ? 'jpg' : m[3].toLowerCase(),
    label: SLOT_LABELS[Number(m[2])] || String(m[2]),
  };
}

async function findParcel(client, manageNo) {
  const sql = `
    SELECT fpop_key, col_a, grp_id
    FROM public.field
    WHERE TRIM(COALESCE(col_a, '')) = $1
       OR TRIM(COALESCE(fpop_key, '')) = $1
    LIMIT 2
  `;
  const { rows } = await client.query(sql, [manageNo]);
  return rows;
}

async function listSlotRows(client, fpopKey, slot) {
  const sql = `
    SELECT fpop_key, img_path, img_name
    FROM jangsucrops.tb_jangsu_img
    WHERE fpop_key = $1
      AND img_name ~* $2
  `;
  const { rows } = await client.query(sql, [fpopKey, `_${slot}\\.(jpe?g|png)$`]);
  return rows;
}

function resolveStoredFile(imgPath, imgName) {
  const rel = String(imgPath || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');
  const candidates = [
    path.resolve(BACK_ROOT, rel, imgName),
    path.resolve(process.cwd(), rel, imgName),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

async function removeSlotImages(client, fpopKey, slot) {
  const rows = await listSlotRows(client, fpopKey, slot);
  for (const row of rows) {
    const filePath = resolveStoredFile(row.img_path, row.img_name);
    if (filePath) {
      try {
        fs.unlinkSync(filePath);
      } catch (_) {}
    }
  }
  await client.query(
    `
      DELETE FROM jangsucrops.tb_jangsu_img
      WHERE fpop_key = $1
        AND img_name ~* $2
    `,
    [fpopKey, `_${slot}\\.(jpe?g|png)$`]
  );
  return rows.length;
}

function moveTo(src, destDir, fileName) {
  ensureDir(destDir);
  let dest = path.join(destDir, fileName);
  if (fs.existsSync(dest)) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const parsed = path.parse(fileName);
    dest = path.join(destDir, `${parsed.name}_${stamp}${parsed.ext}`);
  }
  fs.renameSync(src, dest);
  return dest;
}

async function importOneFile(filePath, opts = {}) {
  const dataDir = opts.dataDir || DEFAULT_DATA_DIR;
  const paths = dataPaths(dataDir);
  const fileName = path.basename(filePath);
  const parsed = parsePhotoName(fileName);

  if (!parsed) {
    const dest = moveTo(filePath, paths.error, fileName);
    return { ok: false, fileName, reason: '파일명 규칙 불일치 ({관리번호}_1~4.png|jpg)', dest };
  }

  const client = await pg.connect();
  try {
    const parcels = await findParcel(client, parsed.manageNo);
    if (!parcels.length) {
      const dest = moveTo(filePath, paths.error, fileName);
      return {
        ok: false,
        fileName,
        reason: `관리번호 미일치: ${parsed.manageNo}`,
        dest,
      };
    }
    if (parcels.length > 1) {
      const dest = moveTo(filePath, paths.error, fileName);
      return {
        ok: false,
        fileName,
        reason: `관리번호 중복(${parcels.length}건): ${parsed.manageNo}`,
        dest,
      };
    }

    const parcel = parcels[0];
    const fpopKey = String(parcel.fpop_key).trim();
    const grpId = String(parcel.grp_id || 'import').trim() || 'import';
    const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const relPath = `uploads/img/${day}/${grpId}`.replace(/\\/g, '/');
    const absDir = path.resolve(BACK_ROOT, relPath);
    ensureDir(absDir);

    const storedName = `${fpopKey}_${parsed.slot}.${parsed.ext}`;
    const destFile = path.join(absDir, storedName);

    await client.query('BEGIN');
    await removeSlotImages(client, fpopKey, parsed.slot);
    fs.copyFileSync(filePath, destFile);
    await client.query(
      `
        INSERT INTO jangsucrops.tb_jangsu_img (fpop_key, img_path, img_name)
        VALUES ($1, $2, $3)
      `,
      [fpopKey, relPath, storedName]
    );
    await client.query('COMMIT');

    const donePath = moveTo(filePath, paths.done, fileName);
    return {
      ok: true,
      fileName,
      manageNo: parsed.manageNo,
      fpopKey,
      slot: parsed.slot,
      label: parsed.label,
      img_path: relPath,
      img_name: storedName,
      dest: donePath,
    };
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {}
    let dest = null;
    try {
      if (fs.existsSync(filePath)) dest = moveTo(filePath, paths.error, fileName);
    } catch (_) {}
    return {
      ok: false,
      fileName,
      reason: err.message || String(err),
      dest,
    };
  } finally {
    client.release();
  }
}

function listPendingFiles(dataDir = DEFAULT_DATA_DIR) {
  const { root } = dataPaths(dataDir);
  ensureDir(root);
  ensureDir(path.join(root, 'done'));
  ensureDir(path.join(root, 'error'));
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root)
    .filter((name) => {
      const full = path.join(root, name);
      if (!fs.statSync(full).isFile()) return false;
      return NAME_RE.test(name);
    })
    .map((name) => path.join(root, name));
}

async function importAll(opts = {}) {
  const dataDir = opts.dataDir || DEFAULT_DATA_DIR;
  const files = listPendingFiles(dataDir);
  const results = [];
  for (const file of files) {
    results.push(await importOneFile(file, { dataDir }));
  }
  return results;
}

function waitFileStable(filePath, { checks = 3, intervalMs = 200 } = {}) {
  return new Promise((resolve) => {
    let last = -1;
    let stable = 0;
    const tick = () => {
      try {
        if (!fs.existsSync(filePath)) return resolve(false);
        const size = fs.statSync(filePath).size;
        if (size > 0 && size === last) {
          stable += 1;
          if (stable >= checks) return resolve(true);
        } else {
          stable = 0;
          last = size;
        }
      } catch (_) {
        return resolve(false);
      }
      setTimeout(tick, intervalMs);
    };
    tick();
  });
}

function startWatch(opts = {}) {
  const dataDir = opts.dataDir || DEFAULT_DATA_DIR;
  const paths = dataPaths(dataDir);
  ensureDir(paths.root);
  ensureDir(paths.done);
  ensureDir(paths.error);

  const pending = new Set();
  let busy = false;

  const queue = async (filePath) => {
    pending.add(filePath);
    if (busy) return;
    busy = true;
    while (pending.size) {
      const next = pending.values().next().value;
      pending.delete(next);
      if (!fs.existsSync(next)) continue;
      const ok = await waitFileStable(next);
      if (!ok) continue;
      const result = await importOneFile(next, { dataDir });
      const tag = result.ok ? 'OK' : 'FAIL';
      console.log(
        `[data-photo] ${tag}`,
        result.fileName,
        result.ok
          ? `${result.label}(_${result.slot}) → ${result.fpopKey}`
          : result.reason
      );
    }
    busy = false;
  };

  const watcher = fs.watch(paths.root, (eventType, fileName) => {
    if (!fileName || !NAME_RE.test(fileName)) return;
    const full = path.join(paths.root, fileName);
    setTimeout(() => queue(full), 100);
  });

  console.log(`[data-photo] watch: ${paths.root}`);
  console.log('[data-photo] 규칙: {관리번호}_1~4.png|jpg|jpeg  (1근경 2원경 3항공 4지적)');

  // 시작 시 기존 파일 1회 처리
  importAll({ dataDir }).then((results) => {
    for (const r of results) {
      const tag = r.ok ? 'OK' : 'FAIL';
      console.log(
        `[data-photo] ${tag}`,
        r.fileName,
        r.ok ? `${r.label}(_${r.slot}) → ${r.fpopKey}` : r.reason
      );
    }
  });

  return watcher;
}

module.exports = {
  DEFAULT_DATA_DIR,
  BACK_ROOT,
  REPO_ROOT,
  NAME_RE,
  SLOT_LABELS,
  parsePhotoName,
  dataPaths,
  importOneFile,
  importAll,
  startWatch,
  listPendingFiles,
};
