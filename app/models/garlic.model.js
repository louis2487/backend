const run = require('./runQuery.js');
const logger = require('../config/winston');

const Garlic = {};

function esc(v) {
  if (v == null) return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}

function jsonEsc(obj) {
  return esc(JSON.stringify(obj == null ? {} : obj));
}

/** bbox 내 필지 목록 */
Garlic.getBoundsList = async (req) => {
  const minx = Number(req.query.minx);
  const miny = Number(req.query.miny);
  const maxx = Number(req.query.maxx);
  const maxy = Number(req.query.maxy);
  if (![minx, miny, maxx, maxy].every(Number.isFinite)) {
    throw new Error('INVALID_BOUNDS: minx,miny,maxx,maxy required');
  }
  const query = `
    SELECT
      a.id,
      a.uid,
      a.pnu,
      a.stdg_addr,
      a.clsf_nm,
      a.area,
      COALESCE(c.write_data, 'N') AS write_data,
      c.survey_uuid,
      ST_AsGeoJSON(
        ST_SimplifyPreserveTopology(
          ST_CollectionExtract(a.geom, 3),
          0.000015
        )
      ) AS geom,
      ST_AsGeoJSON(COALESCE(a.geo_center, ST_PointOnSurface(a.geom))) AS geo_center
    FROM garlic_a a
    LEFT JOIN garlic_c c ON c.parcel_id = a.id
    WHERE a.geom IS NOT NULL
      AND ST_Intersects(
        a.geom,
        ST_MakeEnvelope(${minx}, ${miny}, ${maxx}, ${maxy}, 4326)
      )
    ORDER BY a.id
    LIMIT 250;
  `;
  return run('garlic.getBoundsList', query);
};

/** 필지 전체 목록 (지도 초기/목록용) */
Garlic.listParcels = async (req) => {
  const q = String(req.query.q || '').trim();
  const where = q
    ? `WHERE a.stdg_addr ILIKE ${esc('%' + q + '%')} OR a.pnu ILIKE ${esc('%' + q + '%')} OR a.id ILIKE ${esc('%' + q + '%')}`
    : '';
  const query = `
    SELECT
      a.id,
      a.uid,
      a.pnu,
      a.stdg_addr,
      a.clsf_nm,
      a.area,
      COALESCE(c.write_data, 'N') AS write_data,
      c.survey_uuid,
      ST_AsGeoJSON(COALESCE(a.geo_center, ST_PointOnSurface(a.geom))) AS geo_center
    FROM garlic_a a
    LEFT JOIN garlic_c c ON c.parcel_id = a.id
    ${where}
    ORDER BY a.stdg_addr, a.id
    LIMIT 500;
  `;
  return run('garlic.listParcels', query);
};

Garlic.getParcelDetail = async (req) => {
  const id = String(req.query.id || req.query.parcel_id || '').trim();
  if (!id) throw new Error('INVALID: id required');
  const query = `
    SELECT
      a.*,
      ST_AsGeoJSON(a.geom) AS geom,
      ST_AsGeoJSON(COALESCE(a.geo_center, ST_PointOnSurface(a.geom))) AS geo_center,
      c.survey_uuid,
      c.write_data AS survey_write_data,
      c.name AS survey_name,
      c.contact AS survey_contact,
      c.survey AS survey_body
    FROM garlic_a a
    LEFT JOIN garlic_c c ON c.parcel_id = a.id
    WHERE a.id = ${esc(id)}
    LIMIT 1;
  `;
  const rows = await run('garlic.getParcelDetail', query);
  return rows[0] || null;
};

/** 면접 목록 */
Garlic.listInterviews = async (req) => {
  const query = `
    SELECT
      survey_uuid,
      farmer_key,
      respondent,
      write_data,
      created_at,
      updated_at,
      COALESCE(respondent->>'name', '') AS name,
      COALESCE(respondent->>'phone', '') AS phone
    FROM garlic_b
    ORDER BY updated_at DESC
    LIMIT 200;
  `;
  return run('garlic.listInterviews', query);
};

Garlic.getInterview = async (req) => {
  const uuid = String(req.query.survey_uuid || '').trim();
  if (!uuid) throw new Error('INVALID: survey_uuid required');
  const rows = await run(
    'garlic.getInterview',
    `SELECT * FROM garlic_b WHERE survey_uuid = ${esc(uuid)} LIMIT 1;`
  );
  return rows[0] || null;
};

Garlic.updateInterview = async (req, result) => {
  try {
    const body = req.body || {};
    let surveyUuid = String(body.survey_uuid || '').trim();
    const farmerKey = body.farmer_key != null ? String(body.farmer_key) : null;
    const respondent = body.respondent || {};
    const garlic = body.garlic || {};
    const onion = body.onion || {};
    const writeData =
      body.write_data === 'N' ? 'N' : 'Y';

    if (!surveyUuid) {
      const created = await run(
        'garlic.updateInterview.insert',
        `
        INSERT INTO garlic_b (farmer_key, respondent, garlic, onion, write_data, updated_at)
        VALUES (
          ${esc(farmerKey)},
          ${jsonEsc(respondent)}::jsonb,
          ${jsonEsc(garlic)}::jsonb,
          ${jsonEsc(onion)}::jsonb,
          ${esc(writeData)},
          NOW()
        )
        RETURNING *;
        `
      );
      result(null, created[0]);
      return;
    }

    const updated = await run(
      'garlic.updateInterview.upsert',
      `
      INSERT INTO garlic_b (survey_uuid, farmer_key, respondent, garlic, onion, write_data, updated_at)
      VALUES (
        ${esc(surveyUuid)},
        ${esc(farmerKey)},
        ${jsonEsc(respondent)}::jsonb,
        ${jsonEsc(garlic)}::jsonb,
        ${jsonEsc(onion)}::jsonb,
        ${esc(writeData)},
        NOW()
      )
      ON CONFLICT (survey_uuid) DO UPDATE SET
        farmer_key = EXCLUDED.farmer_key,
        respondent = EXCLUDED.respondent,
        garlic = EXCLUDED.garlic,
        onion = EXCLUDED.onion,
        write_data = EXCLUDED.write_data,
        updated_at = NOW()
      RETURNING *;
      `
    );
    result(null, updated[0]);
  } catch (err) {
    logger.error(err);
    result(err, null);
  }
};

Garlic.getParcelSurvey = async (req) => {
  const surveyUuid = String(req.query.survey_uuid || '').trim();
  const parcelId = String(req.query.parcel_id || '').trim();
  let query;
  if (surveyUuid) {
    query = `SELECT * FROM garlic_c WHERE survey_uuid = ${esc(surveyUuid)} LIMIT 1;`;
  } else if (parcelId) {
    query = `SELECT * FROM garlic_c WHERE parcel_id = ${esc(parcelId)} LIMIT 1;`;
  } else {
    throw new Error('INVALID: survey_uuid or parcel_id required');
  }
  const rows = await run('garlic.getParcelSurvey', query);
  return rows[0] || null;
};

Garlic.updateParcelSurvey = async (req, result) => {
  try {
    const body = req.body || {};
    let surveyUuid = String(body.survey_uuid || '').trim();
    const parcelId = body.parcel_id != null ? String(body.parcel_id) : null;
    const name = body.name != null ? String(body.name) : null;
    const contact = body.contact != null ? String(body.contact) : null;
    const parcelAddr = body.parcel_addr != null ? String(body.parcel_addr) : null;
    const farmmapId = body.farmmap_id != null ? String(body.farmmap_id) : null;
    const survey = body.survey || {};
    const writeData = body.write_data === 'N' ? 'N' : 'Y';

    if (!surveyUuid && parcelId) {
      const existing = await run(
        'garlic.updateParcelSurvey.findByParcel',
        `SELECT survey_uuid FROM garlic_c WHERE parcel_id = ${esc(parcelId)} LIMIT 1;`
      );
      if (existing[0]) surveyUuid = existing[0].survey_uuid;
    }

    if (!surveyUuid) {
      const created = await run(
        'garlic.updateParcelSurvey.insert',
        `
        INSERT INTO garlic_c (
          parcel_id, name, contact, parcel_addr, farmmap_id, survey, write_data, updated_at
        ) VALUES (
          ${esc(parcelId)},
          ${esc(name)},
          ${esc(contact)},
          ${esc(parcelAddr)},
          ${esc(farmmapId)},
          ${jsonEsc(survey)}::jsonb,
          ${esc(writeData)},
          NOW()
        )
        RETURNING *;
        `
      );
      result(null, created[0]);
      return;
    }

    const updated = await run(
      'garlic.updateParcelSurvey.upsert',
      `
      INSERT INTO garlic_c (
        survey_uuid, parcel_id, name, contact, parcel_addr, farmmap_id, survey, write_data, updated_at
      ) VALUES (
        ${esc(surveyUuid)},
        ${esc(parcelId)},
        ${esc(name)},
        ${esc(contact)},
        ${esc(parcelAddr)},
        ${esc(farmmapId)},
        ${jsonEsc(survey)}::jsonb,
        ${esc(writeData)},
        NOW()
      )
      ON CONFLICT (survey_uuid) DO UPDATE SET
        parcel_id = COALESCE(EXCLUDED.parcel_id, garlic_c.parcel_id),
        name = EXCLUDED.name,
        contact = EXCLUDED.contact,
        parcel_addr = EXCLUDED.parcel_addr,
        farmmap_id = EXCLUDED.farmmap_id,
        survey = EXCLUDED.survey,
        write_data = EXCLUDED.write_data,
        updated_at = NOW()
      RETURNING *;
      `
    );
    result(null, updated[0]);
  } catch (err) {
    logger.error(err);
    result(err, null);
  }
};

Garlic.getParcelImg = async (req, result) => {
  try {
    const surveyUuid = String(req.query.survey_uuid || '').trim();
    if (!surveyUuid) {
      result(new Error('INVALID: survey_uuid required'), null);
      return;
    }
    const rows = await run(
      'garlic.getParcelImg',
      `
      SELECT id, survey_uuid, slot, img_path, img_name, created_at
      FROM garlic_img
      WHERE survey_uuid = ${esc(surveyUuid)}
      ORDER BY slot, id;
      `
    );
    result(null, rows);
  } catch (err) {
    logger.error(err);
    result(err, null);
  }
};

Garlic.uploadParcelImg = async (req, result) => {
  try {
    const surveyUuid = String(req.body.survey_uuid || '').trim();
    const slot = String(req.body.slot || 'overview').trim();
    const imgPath = String(req.body.imgPath || '')
      .trim()
      .replace(/\\/g, '/')
      .replace(/^\.\//, '');
    if (!surveyUuid) {
      result(new Error('INVALID: survey_uuid required'), null);
      return;
    }

    const files = req.files && req.files.length ? req.files : req.file ? [req.file] : [];
    if (!files.length) {
      result(new Error('INVALID: file required'), null);
      return;
    }

    const values = files
      .map((file) => {
        const p = imgPath || String(file.destination || '').replace(/\\/g, '/');
        const name = file.filename || file.originalname;
        return `(${esc(surveyUuid)}, ${esc(slot)}, ${esc(p)}, ${esc(name)})`;
      })
      .join(', ');

    const rows = await run(
      'garlic.uploadParcelImg',
      `
      INSERT INTO garlic_img (survey_uuid, slot, img_path, img_name)
      VALUES ${values}
      RETURNING *;
      `
    );
    result(null, rows);
  } catch (err) {
    logger.error(err);
    result(err, null);
  }
};

Garlic.deleteParcelImg = async (req, result) => {
  try {
    const id = String(req.query.id || '').trim();
    if (!id) {
      result(new Error('INVALID: id required'), null);
      return;
    }
    const rows = await run(
      'garlic.deleteParcelImg',
      `DELETE FROM garlic_img WHERE id = ${Number(id)} RETURNING *;`
    );
    result(null, rows[0] || { deleted: true });
  } catch (err) {
    logger.error(err);
    result(err, null);
  }
};

module.exports = Garlic;
