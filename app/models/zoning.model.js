/**
 * Zoning inspection domain model.
 * Isolated from jangsu — only zb_* tables (or in-memory seed).
 *
 * Env:
 *   ZONING_USE_MEMORY=1  → force memory store
 *   (default) try DB; if zb_* missing, fall back to memory
 */

const pg = require('./db.js');
const logger = require('../config/winston');
const { createStore } = require('./zoning.memory');
const { buildOverlays, emptyGeoms } = require('./zoning.overlays');

const memory = createStore();
let mode = null; // 'memory' | 'db'

async function query(sql, params = []) {
  const client = await pg.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

async function resolveMode() {
  if (mode) return mode;
  if (process.env.ZONING_USE_MEMORY === '1') {
    mode = 'memory';
    logger.info('[zoning] using memory store (ZONING_USE_MEMORY=1)');
    return mode;
  }
  try {
    await query('SELECT 1 FROM zb_inspection_target LIMIT 1');
    mode = 'db';
    logger.info('[zoning] using Postgres zb_* tables');
  } catch (err) {
    mode = 'memory';
    logger.warn(`[zoning] zb_* unavailable (${err.message}); using memory seed`);
  }
  return mode;
}

function mapParcel(row) {
  return {
    id: row.id,
    pnu: row.pnu,
    jibunBefore: row.jibun_before ?? row.jibunBefore ?? null,
    jibunAfter: row.jibun_after ?? row.jibunAfter ?? null,
    ownerTypeBefore: row.owner_type_before ?? row.ownerTypeBefore ?? null,
    ownerTypeAfter: row.owner_type_after ?? row.ownerTypeAfter ?? null,
    geomAreaBefore: row.geom_area_before ?? row.geomAreaBefore ?? null,
    geomAreaAfter: row.geom_area_after ?? row.geomAreaAfter ?? null,
    inclusionAreaBefore: row.inclusion_area_before ?? row.inclusionAreaBefore ?? null,
    inclusionAreaAfter: row.inclusion_area_after ?? row.inclusionAreaAfter ?? null,
    changeType: row.change_type ?? row.changeType ?? 'unchanged',
  };
}

function mapFeatureRow(row, parcels) {
  return {
    id: row.id,
    name: row.name,
    errorCount: row.error_count,
    completed: row.completed,
    noticeNo: row.notice_no,
    noticeDate: row.notice_date,
    location: row.location,
    noticeArea: Number(row.notice_area),
    source: row.source,
    actualArea: Number(row.actual_area),
    centroid: { lat: Number(row.centroid_lat), lng: Number(row.centroid_lng) },
    polygon: typeof row.polygon === 'string' ? JSON.parse(row.polygon) : (row.polygon || []),
    errors: typeof row.errors === 'string' ? JSON.parse(row.errors) : (row.errors || []),
    maintenances: typeof row.maintenances === 'string' ? JSON.parse(row.maintenances) : (row.maintenances || []),
    parcels: (parcels || []).map(mapParcel),
  };
}

const Zoning = {};

Zoning.listTargets = async (result) => {
  try {
    if ((await resolveMode()) === 'memory') {
      result(null, { code: 1, msg: 'ok', result: memory.listTargets() });
      return;
    }
    const rows = await query(
      'SELECT id, name, sido, sigungu, theme FROM zb_inspection_target ORDER BY id'
    );
    result(null, { code: 1, msg: 'ok', result: rows });
  } catch (err) {
    logger.error(err);
    result(err, null);
  }
};

Zoning.listFeatures = async (targetId, result) => {
  try {
    if ((await resolveMode()) === 'memory') {
      result(null, { code: 1, msg: 'ok', result: memory.listFeatures(targetId) });
      return;
    }
    const rows = await query(
      `SELECT f.*, COALESCE(r.completed, f.completed) AS completed
       FROM zb_feature f
       LEFT JOIN zb_inspection_result r ON r.feature_id = f.id
       WHERE f.target_id = $1
       ORDER BY f.id`,
      [targetId]
    );
    const out = [];
    for (const row of rows) {
      const parcels = await query(
        'SELECT * FROM zb_parcel WHERE feature_id = $1 ORDER BY id',
        [row.id]
      );
      out.push(mapFeatureRow(row, parcels));
    }
    result(null, { code: 1, msg: 'ok', result: out });
  } catch (err) {
    logger.error(err);
    result(err, null);
  }
};

Zoning.listParcels = async (featureId, result) => {
  try {
    if ((await resolveMode()) === 'memory') {
      result(null, { code: 1, msg: 'ok', result: memory.listParcels(featureId) });
      return;
    }
    const rows = await query(
      'SELECT * FROM zb_parcel WHERE feature_id = $1 ORDER BY id',
      [featureId]
    );
    result(null, { code: 1, msg: 'ok', result: rows.map(mapParcel) });
  } catch (err) {
    logger.error(err);
    result(err, null);
  }
};

Zoning.getGosi = async (featureId, type, result) => {
  try {
    if ((await resolveMode()) === 'memory') {
      const doc = memory.getGosi(featureId, type || 'text');
      if (!doc) {
        result(null, { code: 0, msg: 'not found', result: null });
        return;
      }
      result(null, { code: 1, msg: 'ok', result: doc });
      return;
    }
    const isDrawing = type === 'drawing';
    const rows = await query(
      `SELECT notice_no, title, gosi_date, body, is_drawing, file_path
       FROM zb_gosi WHERE feature_id = $1 AND is_drawing = $2 LIMIT 1`,
      [featureId, isDrawing]
    );
    if (!rows.length) {
      result(null, { code: 0, msg: 'not found', result: null });
      return;
    }
    const r = rows[0];
    result(null, {
      code: 1,
      msg: 'ok',
      result: {
        noticeNo: r.notice_no,
        title: r.title,
        date: r.gosi_date,
        body: r.body,
        isDrawing: r.is_drawing,
        filePath: r.file_path || null,
      },
    });
  } catch (err) {
    logger.error(err);
    result(err, null);
  }
};

Zoning.getLayers = async (result) => {
  try {
    const generated = buildOverlays();
    if ((await resolveMode()) === 'memory') {
      result(null, { code: 1, msg: 'ok', result: { ...memory.getLayers(), geoms: generated } });
      return;
    }
    let rows;
    try {
      rows = await query('SELECT side, tree, overlays FROM zb_layer_catalog');
    } catch {
      rows = await query('SELECT side, tree FROM zb_layer_catalog');
    }
    const out = { before: [], after: [], geoms: { before: emptyGeoms(), after: emptyGeoms() } };
    for (const r of rows) {
      out[r.side] = typeof r.tree === 'string' ? JSON.parse(r.tree) : r.tree;
      const ov = typeof r.overlays === 'string' ? JSON.parse(r.overlays) : r.overlays;
      if (ov && (ov.cadastral || ov.theme)) {
        out.geoms[r.side] = {
          cadastral: ov.cadastral || [],
          theme: ov.theme || [],
        };
      } else {
        out.geoms[r.side] = generated[r.side];
      }
    }
    if (!out.before.length && !out.after.length) {
      result(null, { code: 1, msg: 'ok', result: { ...memory.getLayers(), geoms: generated } });
      return;
    }
    if (!out.geoms.before.cadastral.length) out.geoms.before = generated.before;
    if (!out.geoms.after.cadastral.length) out.geoms.after = generated.after;
    result(null, { code: 1, msg: 'ok', result: out });
  } catch (err) {
    logger.error(err);
    result(err, null);
  }
};

Zoning.getResult = async (featureId, result) => {
  try {
    if ((await resolveMode()) === 'memory') {
      result(null, { code: 1, msg: 'ok', result: memory.getResult(featureId) });
      return;
    }
    const rows = await query(
      'SELECT feature_id, verdict, opinion, completed, user_id, updated_at FROM zb_inspection_result WHERE feature_id = $1',
      [featureId]
    );
    if (!rows.length) {
      result(null, { code: 1, msg: 'ok', result: null });
      return;
    }
    const r = rows[0];
    result(null, {
      code: 1,
      msg: 'ok',
      result: {
        featureId: r.feature_id,
        verdict: r.verdict,
        opinion: r.opinion,
        completed: r.completed,
        userId: r.user_id,
        updatedAt: r.updated_at,
      },
    });
  } catch (err) {
    logger.error(err);
    result(err, null);
  }
};

Zoning.saveResult = async (featureId, body, result) => {
  try {
    const payload = {
      verdict: body.verdict,
      opinion: body.opinion || '',
      completed: body.completed,
      userId: body.userId || null,
    };
    if ((await resolveMode()) === 'memory') {
      result(null, { code: 1, msg: 'ok', result: memory.saveResult(featureId, payload) });
      return;
    }
    const completed =
      payload.verdict !== 'rework' && (payload.completed === undefined ? true : !!payload.completed);
    await query(
      `INSERT INTO zb_inspection_result (feature_id, verdict, opinion, completed, user_id, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (feature_id) DO UPDATE SET
         verdict = EXCLUDED.verdict,
         opinion = EXCLUDED.opinion,
         completed = EXCLUDED.completed,
         user_id = EXCLUDED.user_id,
         updated_at = NOW()`,
      [featureId, payload.verdict, payload.opinion, completed, payload.userId]
    );
    await query('UPDATE zb_feature SET completed = $2 WHERE id = $1', [featureId, completed]);
    result(null, {
      code: 1,
      msg: 'ok',
      result: {
        featureId,
        verdict: payload.verdict,
        opinion: payload.opinion,
        completed,
        userId: payload.userId,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    logger.error(err);
    result(err, null);
  }
};

Zoning.listMarkers = async (featureId, result) => {
  try {
    if ((await resolveMode()) === 'memory') {
      result(null, { code: 1, msg: 'ok', result: memory.listMarkers(featureId) });
      return;
    }
    const rows = await query(
      'SELECT id, feature_id, tool, points, created_at FROM zb_marker WHERE feature_id = $1 ORDER BY created_at',
      [featureId]
    );
    result(null, {
      code: 1,
      msg: 'ok',
      result: rows.map((r) => ({
        id: r.id,
        featureId: r.feature_id,
        tool: r.tool,
        points: typeof r.points === 'string' ? JSON.parse(r.points) : r.points,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    logger.error(err);
    result(err, null);
  }
};

Zoning.addMarker = async (featureId, body, result) => {
  try {
    if ((await resolveMode()) === 'memory') {
      result(null, { code: 1, msg: 'ok', result: memory.addMarker(featureId, body || {}) });
      return;
    }
    const id = body.id || `mk_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const tool = body.tool || 'sketchPoint';
    const points = JSON.stringify(body.points || []);
    await query(
      'INSERT INTO zb_marker (id, feature_id, tool, points) VALUES ($1, $2, $3, $4::jsonb)',
      [id, featureId, tool, points]
    );
    result(null, {
      code: 1,
      msg: 'ok',
      result: { id, featureId, tool, points: body.points || [], createdAt: new Date().toISOString() },
    });
  } catch (err) {
    logger.error(err);
    result(err, null);
  }
};

Zoning.deleteMarker = async (markerId, result) => {
  try {
    if ((await resolveMode()) === 'memory') {
      const ok = memory.deleteMarker(markerId);
      result(null, { code: ok ? 1 : 0, msg: ok ? 'ok' : 'not found', result: ok });
      return;
    }
    const rows = await query('DELETE FROM zb_marker WHERE id = $1 RETURNING id', [markerId]);
    const ok = rows.length > 0;
    result(null, { code: ok ? 1 : 0, msg: ok ? 'ok' : 'not found', result: ok });
  } catch (err) {
    logger.error(err);
    result(err, null);
  }
};

function mapUser(row) {
  return {
    userId: row.user_id || row.userId,
    userUuid: row.user_uuid || row.userUuid,
    displayName: row.display_name || row.displayName || '',
    role: row.role,
  };
}

function mapPackage(row) {
  return {
    id: row.id,
    name: row.name,
    sido: row.sido,
    sigungu: row.sigungu,
    theme: row.theme,
    targetId: row.target_id || row.targetId,
    status: row.status,
    assignedRole: row.assigned_role || row.assignedRole || null,
    note: row.note || '',
    updatedAt: row.updated_at || row.updatedAt || null,
  };
}

Zoning.login = async (body, result) => {
  try {
    const userId = body.userId || '';
    const userPw = body.userPw || '';
    if (!userId) {
      result(null, { code: 0, msg: '아이디를 입력하세요', result: null });
      return;
    }

    if ((await resolveMode()) === 'db') {
      try {
        const rows = await query(
          `SELECT user_id, user_uuid, display_name, role
           FROM zb_user
           WHERE user_id = $1 AND user_pw = $2 AND active = TRUE
           LIMIT 1`,
          [userId, userPw]
        );
        if (rows.length) {
          result(null, { code: 1, msg: 'ok', result: mapUser(rows[0]) });
          return;
        }
      } catch (err) {
        logger.warn(`[zoning] zb_user login fallback: ${err.message}`);
      }
    }

    const mem = memory.login(userId, userPw);
    if (mem) {
      result(null, { code: 1, msg: 'ok', result: mem });
      return;
    }
    result(null, { code: 0, msg: '아이디 또는 비밀번호가 올바르지 않습니다', result: null });
  } catch (err) {
    logger.error(err);
    result(err, null);
  }
};

Zoning.listPackages = async (role, result) => {
  try {
    if ((await resolveMode()) === 'memory') {
      result(null, { code: 1, msg: 'ok', result: memory.listPackages(role) });
      return;
    }
    try {
      let rows;
      if (!role || role === 'admin') {
        rows = await query('SELECT * FROM zb_package ORDER BY id');
      } else {
        rows = await query(
          `SELECT * FROM zb_package
           WHERE assigned_role IS NULL OR assigned_role = $1
           ORDER BY id`,
          [role]
        );
      }
      result(null, { code: 1, msg: 'ok', result: rows.map(mapPackage) });
      return;
    } catch (err) {
      logger.warn(`[zoning] package list fallback: ${err.message}`);
      result(null, { code: 1, msg: 'ok', result: memory.listPackages(role) });
    }
  } catch (err) {
    logger.error(err);
    result(err, null);
  }
};

Zoning.updatePackage = async (id, body, result) => {
  try {
    if ((await resolveMode()) === 'memory') {
      const row = memory.updatePackage(id, body || {});
      result(null, { code: row ? 1 : 0, msg: row ? 'ok' : 'not found', result: row });
      return;
    }
    try {
      const rows = await query(
        `UPDATE zb_package SET
           status = COALESCE($2, status),
           note = COALESCE($3, note),
           assigned_role = COALESCE($4, assigned_role),
           updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id, body.status || null, body.note !== undefined ? body.note : null, body.assignedRole || null]
      );
      if (!rows.length) {
        result(null, { code: 0, msg: 'not found', result: null });
        return;
      }
      result(null, { code: 1, msg: 'ok', result: mapPackage(rows[0]) });
      return;
    } catch (err) {
      logger.warn(`[zoning] package update fallback: ${err.message}`);
      const row = memory.updatePackage(id, body || {});
      result(null, { code: row ? 1 : 0, msg: row ? 'ok' : 'not found', result: row });
    }
  } catch (err) {
    logger.error(err);
    result(err, null);
  }
};

module.exports = Zoning;
