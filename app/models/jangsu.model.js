const sql = require('./db.js');
const run = require('./runQuery');
const crypto = require('../config/crypto');
const nodemailer = require('nodemailer');
const fs = require('fs');

const logger = require('../config/winston');
const nodeHtmlToImage = require('node-html-to-image')
const imgToPDF = require('image-to-pdf')
// const { v1: uuidv1 } = require('uuid');
const crypto2 = require('crypto');
const { JANGSU_IMG_ORDER_BY } = require('../utils/jangsu_img_order');

// var client = require('../config/elastic.config.js');

// constructor
const Jangsu = function (user) {
  this.uuid = user.uuid;
  this.userName = user.userName;
  this.userId = user.userId;
  this.userPw = user.userPw;
  this.deviceKey = user.deviceKey;

};
function getFormatDate(date) {
  var year = date.getFullYear();
  var month = (1 + date.getMonth());
  month = month > 10 ? month : '0' + month; // 10이 넘지 않으면 앞에 0을 붙인다
  var day = date.getDate();
  day = day > 10 ? day : '0' + day; // 10이 넘지 않으면 앞에 0을 붙인다
  var hours = date.getHours();
  hours = hours > 10 ? hours : '0' + hours; // 10이 넘지 않으면 앞에 0을 붙인다
  var minutes = date.getMinutes();
  minutes = minutes > 10 ? minutes : '0' + minutes; // 10이 넘지 않으면 앞에 0을 붙인다
  var seconds = date.getSeconds();
  seconds = seconds > 10 ? seconds : '0' + seconds; // 10이 넘지 않으면 앞에 0을 붙인다

  // return year + '-' + month + '-' + day;
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} `
}

let res = {
  code: 0,
  msg: '',
  // result: null
}
Jangsu.getJangsuImgData = async (req, result) => {
  try {
    // console.log(req)

    var fpop_key = req.query.fpop_key;
    var pk_uuid = req.query.pk_uuid;
    var flag = req.query.flag;
    if (flag == 'outer') {
      const selectSql = `select * from tb_jangsu_img where fpop_key = '${fpop_key}' order by ${JANGSU_IMG_ORDER_BY}`;
      const resObj = await run("getSlopeRailwayInfo", selectSql);
      var list = [];
      list = resObj;
      result(null, list);
    } else if (flag == 'inner') {
      const selectSql = `select * from tb_jangsu_img where fpop_key = '${pk_uuid}' order by ${JANGSU_IMG_ORDER_BY}`;
      const resObj = await run("getSlopeRailwayInfo", selectSql);
      var list = [];
      list = resObj;
      result(null, list);

    }


    // res.code = 1;
    // res.msg = 'ok';
  } catch (err) {
    logger.error(err)
    console.error('getSlopeRailwayInfo Error!!', err);
    res.code = 0;
    res.msg = 'getSlopeRailwayInfo Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};
Jangsu.getNewInnerPolyLine = async (req, result) => {
  try {

    // console.log(req)
    var fpop_key = req.query.info_uuid;
    const selectSql = `select 
    csft_seq,
    grp_id,
    fpop_key,
    ST_AsGeoJSON(geom) AS geom,
    write_data
    from tb_jangsu_inner where fpop_key = '${fpop_key}'`;
    const resObj = await run("getSlopeRailwayInfo", selectSql);
    // res.code = 1;
    // res.msg = 'ok';
    // var list = [];
    const list = resObj.map(item => ({
      ...item,
      // csft_seq: parseInt(item.csft_seq),
      geom: (JSON.parse(item.geom).coordinates[0] || [])
    }));
    // console.log(list)
    // list = resObj;
    result(null, list);
  } catch (err) {
    logger.error(err)
    console.error('getSlopeRailwayInfo Error!!', err);
    res.code = 0;
    res.msg = 'getSlopeRailwayInfo Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};

Jangsu.deleteJangsuImg = async (req, result) => {
  try {
    // console.log(req)
    var fpop_key = req.query.fpop_key;
    var img_name = req.query.fileNm;
    var flag = req.query.flag;
    var pk_uuid = req.query.pk_uuid;
    if (flag == 'outer') {
      const sql = `DELETE FROM tb_jangsu_img WHERE fpop_key = '${fpop_key}' AND img_name = '${img_name}';`;
      // console.log(sql);
      const resObj = await run("deleteJangsuImg", sql);
      // res.code = 1;
      // res.msg = 'ok';
      result(null, resObj);

    } else if (flag == 'inner') {
      const sql = `DELETE FROM tb_jangsu_img WHERE fpop_key = '${pk_uuid}' AND img_name = '${img_name}';`;
      // console.log(sql);
      const resObj = await run("deleteJangsuImg", sql);
      // res.code = 1;
      // res.msg = 'ok';
      result(null, resObj);

    }
  } catch (err) {
    logger.error(err)
    console.error('deleteJangsuImg Error!!', err);
    res.code = 0;
    res.msg = 'deleteJangsuImg Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};
Jangsu.updateJangsuInfoData = async (req, result) => {
  try {
    // console.log(req.body)
    var { col_ac, col_ag, col_ap, col_aq, col_ar, col_ah, col_ai, col_ax, col_at, col_al, col_am, col_an, col_au, col_av, col_aw, col_az, col_ba, col_ay, col_bb, col_bc, col_bd, col_be, col_bf, col_bg, col_bh, col_k, col_l, col_m, col_n, col_aj, pidx, flag, pk_uuid, addr, col_d, land_area } = req.body;
    var date1 = '';
    var date2 = '';
    var date3 = '';
    var date4 = '';
    if (col_al != '') {
      date1 = col_al.replace(/(\d{4})년\s*(\d{2})월\s*(\d{2})일/, '$1-$2-$3');
    }
    if (col_am != '') {
      date2 = col_am.replace(/(\d{4})년\s*(\d{2})월\s*(\d{2})일/, '$1-$2-$3');
    }
    if (col_ay != '') {
      date3 = col_ay.replace(/(\d{4})년\s*(\d{2})월\s*(\d{2})일/, '$1-$2-$3');
    }
    if (col_bb != '') {
      date4 = col_bb.replace(/(\d{4})년\s*(\d{2})월\s*(\d{2})일/, '$1-$2-$3');
    }

    const safeAddr = (addr ?? '').replace(/'/g, "''");
    const safeColD = (col_d ?? '').replace(/'/g, "''");
    const landAreaSql =
      land_area !== undefined && land_area !== null && String(land_area).trim() !== ''
        ? `land_area = ${Number(land_area) || 0},`
        : '';

    // 공부/수입 필드(addr,지목,면적,현황지목,대부가능 등)만 있어도 완료로 치지 않음.
    // 사용현황·점유·종합의견 등 실입력 항목이 하나라도 있을 때만 write_data=Y
    const hasText = (v) => v != null && String(v).trim() !== '';
    const hasSurveyInput = [
      col_aq, col_ar, col_ai, col_ax, col_at, date1, date2, col_an, col_au,
      col_av, col_aw, col_az, col_ba, date3, date4, col_bc, col_bd, col_be,
      col_bf, col_bg, col_bh, col_ac, col_k, col_l, col_m, col_n, col_aj,
    ].some(hasText);
    const writeDataFlag = hasSurveyInput ? 'Y' : 'N';

    if (flag == 'outer') {

      const sql = `update field set 
        addr = '${safeAddr}',
        col_d = '${safeColD}',
        ${landAreaSql}
        col_ac = '${col_ac}',
        col_ag = '${col_ag}',
        col_ap = '${col_ap}',
        col_aq = '${col_aq}',
        col_ar = '${col_ar}',
        col_ah = '${col_ah}',
        col_ai = '${col_ai}',
        col_ax = '${col_ax}',
        col_at = '${col_at}',
        col_al = '${date1}',
        col_am = '${date2}',
        col_an = '${col_an}',
        col_au = '${col_au}',
        col_av = '${col_av}',
        col_aw = '${col_aw}',
        col_az = '${col_az}',
        col_ba = '${col_ba}',
        col_ay = '${date3}',
        col_bb = '${date4}',
        col_bc = '${col_bc}',
        col_bd = '${col_bd}',
        col_be = '${col_be}',
        col_bf = '${col_bf}',
        col_bg = '${col_bg}',
        col_bh = '${col_bh}',
        col_k = '${String(col_k ?? '').replace(/'/g, "''")}',
        col_l = '${String(col_l ?? '').replace(/'/g, "''")}',
        col_m = '${String(col_m ?? '').replace(/'/g, "''")}',
        col_n = '${String(col_n ?? '').replace(/'/g, "''")}',
        col_aj = '${String(col_aj ?? '').replace(/'/g, "''")}',
        write_data = '${writeDataFlag}',
        mod_date = TO_CHAR(NOW(), 'YYYYMMDDHH24MISS')
         where fpop_key = '${pidx}'`
      // var uuid = req.body.idx;
      // const selectSql = "select * from tb_slope_railway where uuid = ?";
      // var param = [uuid];
      // console.log(sql)
      const resObj = await run("updateJangsuInfoData", sql);
      // // res.code = 1;
      // // res.msg = 'ok';
      // var response = resObj.length > 0 ? resObj[0] : {};
      result(null, resObj);
    } else if (flag == 'inner') {
      const sql = `update tb_jangsu_inner set 
        col_ac = '${col_ac}',
        col_ag = '${col_ag}',
        col_ap = '${col_ap}',
        col_aq = '${col_aq}',
        col_ar = '${col_ar}',
        col_ah = '${col_ah}',
        col_ai = '${col_ai}',
        col_ax = '${col_ax}',
        col_at = '${col_at}',
        col_al = '${date1}',
        col_am = '${date2}',
        col_an = '${col_an}',
        col_au = '${col_au}',
        col_av = '${col_av}',
        col_aw = '${col_aw}',
        col_az = '${col_az}',
        col_ba = '${col_ba}',
        col_ay = '${date3}',
        col_bb = '${date4}',
        col_bc = '${col_bc}',
        col_bd = '${col_bd}',
        col_be = '${col_be}',
        col_bf = '${col_bf}',
        col_bg = '${col_bg}',
        col_bh = '${col_bh}',
        col_k = '${String(col_k ?? '').replace(/'/g, "''")}',
        col_l = '${String(col_l ?? '').replace(/'/g, "''")}',
        col_m = '${String(col_m ?? '').replace(/'/g, "''")}',
        col_n = '${String(col_n ?? '').replace(/'/g, "''")}',
        col_aj = '${String(col_aj ?? '').replace(/'/g, "''")}',
        write_data = '${writeDataFlag}'
         where csft_seq = '${pk_uuid}'`
      // var uuid = req.body.idx;
      // const selectSql = "select * from tb_slope_railway where uuid = ?";
      // var param = [uuid];
      // console.log(sql)
      const resObj = await run("updateJangsuInfoData", sql);
      // // res.code = 1;
      // // res.msg = 'ok';
      // var response = resObj.length > 0 ? resObj[0] : {};
      result(null, resObj);

    }

  } catch (err) {
    logger.error(err)
    console.error('getSlopeRailwayInfo Error!!', err);
    res.code = 0;
    res.msg = 'getSlopeRailwayInfo Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};
Jangsu.getJangsuDetailDataLoad = async (req, result) => {
  try {
    // console.log(req)
    var info_uuid = req.query.info_uuid;
    const selectSql = `select col_a,col_b,col_c,col_d,col_e,col_f,col_g,col_h,col_i,col_j,col_k,col_l,col_m,col_n,col_o,col_p,col_q,col_r,col_s,col_t,col_u,col_v,col_w,col_x,col_y,col_z,col_aa,col_ab,col_ac,col_ad,col_ae,col_af,col_ag,col_ah,col_ai,col_aj,col_ak,col_al,col_am,col_an,col_ao,col_ap,col_aq,col_ar,col_ax,col_at,col_au,col_av,col_aw,col_az,col_ba,col_ay,col_bb,col_bc,col_bd,col_be,col_bf,col_bg,col_bh from field where fpop_key = '${info_uuid}'`;
    // var param = [uuid];
    const resObj = await run("getJangsuDetailDataLoad", selectSql);
    // console.log(resObj)
    // res.code = 1;
    // res.msg = 'ok';
    // var response = resObj.length > 0 ? resObj[0] : {};
    result(null, resObj);
  } catch (err) {
    logger.error(err)
    console.error('getJangsuDetailDataLoad Error!!', err);
    res.code = 0;
    res.msg = 'getJangsuDetailDataLoad Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};


Jangsu.updateJangsuImg = async (req, result) => {
  try {
    var fpop_key = req.body.fpop_key;
    var fileName = req.body.fileName;
    var imgPath = req.body.imgPath;
    var originFileName = req.body.originFileName;
    var originFilePath = req.body.originFilePath;
    var flag = req.body.flag;
    var pk_uuid = req.body.pk_uuid;

    var pngBase64 = req.body.pngBase64;
    var base64Data = pngBase64.replace(/^data:image\/png;base64,/, "");
    fs.writeFile(imgPath + "/" + fileName, base64Data, 'base64', async function (fsErr) {
      if (fsErr) {
        result(fsErr, null);
      }
      if (flag == 'outer') {

        const selectSql = `update tb_jangsu_img set img_path = '${imgPath}', img_name = '${fileName}' where fpop_key = '${fpop_key}' and img_name = '${originFileName}' and img_path = '${originFilePath}'`;
        const resObj = await run("updateJangsuImg", selectSql);
        result(null, resObj);
      } else if (flag == 'inner') {
        const selectSql = `update tb_jangsu_img set img_path = '${imgPath}', img_name = '${fileName}' where fpop_key = '${pk_uuid}' and img_name = '${originFileName}' and img_path = '${originFilePath}'`;
        const resObj = await run("updateJangsuImg", selectSql);
        result(null, resObj);

      }
    });
  } catch (err) {
    logger.error(err)
    console.error('updateJangsuImg Error!!', err);
    res.code = 0;
    res.msg = 'updateJangsuImg Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};
Jangsu.uploadCameraJangsuImg = async (req, result) => {
  try {
    const { uuid, fileName, imgPath, flag, pk_uuid } = req.body;

    // 1️⃣ 이미지 테이블 INSERT
    if (flag == 'outer') {
      var imgSql = `
        INSERT INTO tb_jangsu_img (fpop_key, img_path, img_name)
        VALUES ('${uuid}', '${imgPath}', '${fileName}');
      `;
    } else if (flag == 'inner') {
      var imgSql = `
        INSERT INTO tb_jangsu_img (fpop_key, img_path, img_name)
        VALUES ('${pk_uuid}', '${imgPath}', '${fileName}');
      `;
    }
    const resObj = await run("uploadCameraJangsuImg - insert tb_jangsu_img", imgSql);
    result(null, resObj);
  } catch (err) {
    logger.error(err)
    console.error('uploadCameraJangsuImg Error!!', err);
    res.code = 0;
    res.msg = 'uploadCameraJangsuImg Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};
Jangsu.uploadGalleryJangsuImg = async (req, result) => {
  try {
    const { uuid, flag, pk_uuid, imgPath } = req.body;
    // DB에는 상대경로(uploads/img/...)만 저장 — 절대경로면 서버/OS 바뀌면 한글 삽입 실패
    const relPath = String(imgPath || '')
      .trim()
      .replace(/\\/g, '/')
      .replace(/^\.\//, '');
    if (flag == 'outer') {
      const insertValues = req.files.map(file => {
        const img_path = relPath || String(file.destination || '').replace(/\\/g, '/');
        const img_name = file.filename || file.originalname;
        const fpop_key = uuid;
        return `('${fpop_key}', '${img_path}', '${img_name}')`;
      }).join(", ");
      const insertQuery = `
        INSERT INTO tb_jangsu_img (fpop_key, img_path, img_name)
        VALUES ${insertValues};
      `;
      const resObj = await run("uploadCameraJangsuImg - insert tb_jangsu_img", insertQuery);
      result(null, resObj);

    } else if (flag == 'inner') {
      const insertValues = req.files.map(file => {
        const img_path = relPath || String(file.destination || '').replace(/\\/g, '/');
        const img_name = file.filename || file.originalname;
        const fpop_key = pk_uuid;
        return `('${fpop_key}', '${img_path}', '${img_name}')`;
      }).join(", ");

      const insertQuery = `
        INSERT INTO tb_jangsu_img (fpop_key, img_path, img_name)
        VALUES ${insertValues};
      `;
      const resObj = await run("uploadCameraJangsuImg - insert tb_jangsu_img", insertQuery);
      result(null, resObj);
    }
  } catch (err) {
    logger.error(err)
    console.error('uploadCameraJangsuImg Error!!', err);
    res.code = 0;
    res.msg = 'uploadCameraJangsuImg Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};


Jangsu.putNewPoly = async (req) => {
  try {
    const { poly_flag, info_uuid, crops_id, crops_nm, crop_pl, surveyYm, grp_id } = req.body;

    const INT32_MAX = 2147483647;

    // 1 ~ 2147483647 사이 암호학적 난수 생성
    function generateTimeIntUUID() {
      // crypto.randomInt(min, max) -> max는 "배제"값
      return crypto2.randomInt(1, INT32_MAX + 1);
    }
    // 1754839849 210441
    // 2147483647
    // console.log(generateTimeIntUUID());
    if (poly_flag === '자르기') {
      const coordinates = JSON.parse(crop_pl);
      const lineString = `LINESTRING(${coordinates.map(coord => `${coord.lng} ${coord.lat}`).join(', ')})`;
      const splitCheckQuery = `
          WITH line_geom AS (
            SELECT ST_SetSRID(ST_GeomFromText('${lineString}'), 4326) AS line
          ),
          geom_input AS (
            SELECT 
              ST_Transform((ST_Dump(geom)).geom, 4326) AS part_geom
            FROM field
            WHERE fpop_key = '${info_uuid}' 
          ),
          split_result AS (
            SELECT 
              ST_Split(g.part_geom, l.line) AS split_geom
            FROM geom_input g
            CROSS JOIN line_geom l
          )
          SELECT 
            ST_NumGeometries(split_geom) AS num_splits,
            ST_AsGeoJSON(split_geom) AS split_polygons
          FROM split_result;
      `;
      const checkRows = await run("putNewPoly checkSplitQuery", splitCheckQuery);
      if (!checkRows.length || checkRows[0].num_splits !== 2) {
        return '0';
      }
      const split_polygons = JSON.parse(checkRows[0].split_polygons);
      const poly1 = split_polygons.geometries[0];
      const poly2 = split_polygons.geometries[1];
      const insertUpdateQuery1 =
        // `
        //   INSERT INTO tb_jangsu_inner ( pk_uuid, geom, area, crops_code, fk_uuid, write_data, memo, p_filename, p_filepath, worked_user, img_fk ) VALUES (
        //   '${info_uuid}', 
        //   ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(poly1)}'), 4326),
        //   ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(poly1)}'), 4326), 5186)),
        //    '', '${crops_id}', 'N', '', '', '', '${workedUser}','');
        // `;
        `INSERT INTO tb_jangsu_inner 
      SELECT
      ${generateTimeIntUUID()} as csft_seq,
      grp_id,
      fpop_key,
      pnu,
      land_area,
      ridge_area,
      av_area,
      ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(poly1)}'), 4326), 5186)),
      fm_land_cd,
      reg_date,
      mod_date,
      memo,
      cropcodes,
      addr,
      crop_nm,
      ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(poly1)}'), 4326),
      geo_center,
      re_area,
      re_area_reason, col_a, col_b, col_c, col_d, col_e, col_f, col_g, col_h, col_i, col_j, col_k, col_l, col_m, col_n, col_o, col_p, col_q, col_r, col_s, col_t, col_u, col_v, col_w, col_x, col_y, col_z, col_aa, col_ab, col_ac, col_ad, col_ae, col_af, col_ag, col_ah, col_ai, col_aj, col_ak, col_al, col_am, col_an, col_ao, col_ap, col_aq, col_ar, col_ax, col_at, col_au, col_av, col_aw, col_az, col_ba, col_ay, col_bb, col_bc, col_bd, col_be, col_bf, col_bg, col_bh,'N'
      FROM field
      WHERE fpop_key = '${info_uuid}';`
      await run("putNewPoly insertUpdateQuery", insertUpdateQuery1);
      const insertUpdateQuery2 =
        `INSERT INTO tb_jangsu_inner 
      SELECT
      ${generateTimeIntUUID()} as csft_seq,
      grp_id,
      fpop_key,
      pnu,
      land_area,
      ridge_area,
      av_area,
      ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(poly2)}'), 4326), 5186)) as gis_area,
      fm_land_cd,
      reg_date,
      mod_date,
      memo,
      cropcodes,
      addr,
      crop_nm,
      ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(poly2)}'), 4326) as geom,
      geo_center,
      re_area,
      re_area_reason, col_a, col_b, col_c, col_d, col_e, col_f, col_g, col_h, col_i, col_j, col_k, col_l, col_m, col_n, col_o, col_p, col_q, col_r, col_s, col_t, col_u, col_v, col_w, col_x, col_y, col_z, col_aa, col_ab, col_ac, col_ad, col_ae, col_af, col_ag, col_ah, col_ai, col_aj, col_ak, col_al, col_am, col_an, col_ao, col_ap, col_aq, col_ar, col_ax, col_at, col_au, col_av, col_aw, col_az, col_ba, col_ay, col_bb, col_bc, col_bd, col_be, col_bf, col_bg, col_bh, 'N'
      FROM field
      WHERE fpop_key = '${info_uuid}';`;

      // `
      //   INSERT INTO tb_jangsu_inner ( pk_uuid, geom, area, crops_code, fk_uuid, write_data, memo, p_filename, p_filepath, worked_user, img_fk ) VALUES (
      //   '${info_uuid}', 
      //   ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(poly2)}'), 4326),
      //   ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(poly2)}'), 4326), 5186)),
      //    '', '${uuidv1()}', 'N', '', '', '', '${workedUser}','');
      // `;
      var resObj = await run("putNewPoly insertUpdateQuery", insertUpdateQuery2);
      const updatequ = `update tb_jangus_zone set end_flag = 'N' where grp_id = '${grp_id}';`;
      await run("updatequ newPutQuery", updatequ);
      return '1';



    } else if (poly_flag === '그리기') {
      if (crops_id !== 'unique') {
        const coordinates = JSON.parse(crop_pl);
        const newPolygonWKT = `POLYGON((${coordinates.map(coord => `${coord.lng} ${coord.lat}`).join(', ')}, ${coordinates[0].lng} ${coordinates[0].lat}))`;

        const inupQuery =
          //   `
          //   INSERT INTO tb_jangsu_inner 
          //     (pk_uuid, geom, area, crops_code, fk_uuid, write_data, worked_user)
          //   VALUES 
          //     ('${info_uuid}', ST_GeomFromText('${newPolygonWKT}', 4326), ST_Area(ST_Transform(ST_GeomFromText('${newPolygonWKT}', 4326), 5186)), '', '${crops_id}', 'N', '${workedUser}')
          //   ON CONFLICT (pk_uuid, fk_uuid) 
          //   DO UPDATE SET geom = EXCLUDED.geom, area = ST_Area(ST_Transform(EXCLUDED.geom, 5186)), worked_user = EXCLUDED.worked_user, write_data = EXCLUDED.write_data;
          // `;
          `INSERT INTO tb_jangsu_inner (
        csft_seq,
        grp_id,
        fpop_key,
        pnu,
        land_area,
        ridge_area,
        av_area,
        gis_area,
        fm_land_cd,
        reg_date,
        mod_date,
        memo,
        cropcodes,
        addr,
        crop_nm,
        geom,
        re_area,
        re_area_reason,
        col_a,
        col_b,
        col_c,
        col_d,
        col_e,
        col_f,
        col_g,
        col_h,
        col_i,
        col_j,
        col_k,
        col_l,
        col_m,
        col_n,
        col_o,
        col_p,
        col_q,
        col_r,
        col_s,
        col_t,
        col_u,
        col_v,
        col_w,
        col_x,
        col_y,
        col_z,
        col_aa,
        col_ab,
        col_ac,
        col_ad,
        col_ae,
        col_af,
        col_ag,
        col_ah,
        col_ai,
        col_aj,
        col_ak,
        col_al,
        col_am,
        col_an,
        col_ao,
        col_ap,
        col_aq,
        col_ar,
        col_ax,
        col_at,
        col_au,
        col_av,
        col_aw,
        col_az,
        col_ba,
        col_ay,
        col_bb,
        col_bc,
        col_bd,
        col_be,
        col_bf,
        col_bg,
        col_bh,
        write_data
        )
        SELECT
         ${generateTimeIntUUID()} as csft_seq,
        grp_id,
        fpop_key,
        pnu,
        land_area,
        ridge_area,
        av_area,
        ST_Area(ST_Transform(ST_GeomFromText('${newPolygonWKT}', 4326), 5186)) as gis_area,
        fm_land_cd,
        reg_date,
        mod_date,
        memo,
        cropcodes,
        addr,
        crop_nm,
        ST_GeomFromText('${newPolygonWKT}', 4326) as geom,
        re_area,
        re_area_reason,
        col_a,
        col_b,
        col_c,
        col_d,
        col_e,
        col_f,
        col_g,
        col_h,
        col_i,
        col_j,
        col_k,
        col_l,
        col_m,
        col_n,
        col_o,
        col_p,
        col_q,
        col_r,
        col_s,
        col_t,
        col_u,
        col_v,
        col_w,
        col_x,
        col_y,
        col_z,
        col_aa,
        col_ab,
        col_ac,
        col_ad,
        col_ae,
        col_af,
        col_ag,
        col_ah,
        col_ai,
        col_aj,
        col_ak,
        col_al,
        col_am,
        col_an,
        col_ao,
        col_ap,
        col_aq,
        col_ar,
        col_ax,
        col_at,
        col_au,
        col_av,
        col_aw,
        col_az,
        col_ba,
        col_ay,
        col_bb,
        col_bc,
        col_bd,
        col_be,
        col_bf,
        col_bg,
        col_bh,'N'
        FROM field
        WHERE fpop_key = '${info_uuid}';`;
        await run("putNewPoly newPutQuery", inupQuery);
        const updatequ = `update tb_jangus_zone set end_flag = 'N' where grp_id = '${grp_id}';`;
        await run("updatequ newPutQuery", updatequ);
        return '1';
      }
      // else {
      // const updatequ = `
      //     update tb_jangus_zone set end_flag = 'N' where grp_id = '${grp_id}';
      //   `;
      // await run("updatequ newPutQuery", updatequ);
      //   result(null, resObj);
      //   return '1';
      // }
    }
    return '1';
  } catch (err) {
    logger.error(err)
    console.error('❌ Error in putNewPoly:', err);
    throw new Error('DB_ERROR: putNewPoly');
  }
};


Jangsu.zoneTotalList = async (req) => {
  const { minx, miny, maxx, maxy, surveyYm } = req.query;
  const query = `
  SELECT DISTINCT ON (a.grp_id)
    a.grp_id,
    ST_AsGeoJSON(a.geom) AS geom,
    a.end_flag,
    b.addr
  FROM tb_jangus_zone a
  LEFT JOIN field b ON a.grp_id = b.grp_id
  where ST_Intersects(
              ST_MakeEnvelope(${minx}, ${miny}, ${maxx}, ${maxy}, 4326),
              ST_SetSRID(ST_Centroid(a.geom), 4326)
            )
  ORDER BY a.grp_id, b.addr;`;
  try {
    // console.log(query)
    const resObj = await run("zoneTotalList", query);
    return resObj;
  } catch (err) {
    logger.error(err)
    console.error('❌ Error in zoneTotalList:', err);
    throw new Error('DB_ERROR: zoneTotalList');
  }
};


Jangsu.deleteJangsuData = async (req) => {
  try {
    const { idx } = req.body;
    // 3️⃣ tb_poly_info 삭제
    console.log(`DELETE FROM tb_jangsu_inner WHERE csft_seq = '${idx}';`);
    await run("deleteCropsData DELETE tb_jangsu_inner",
      `DELETE FROM tb_jangsu_inner WHERE csft_seq = ${idx};`);
    return '1';
  } catch (err) {
    logger.error(err)
    console.error('❌ Error in deleteCropsData:', err);
    throw new Error('DB_ERROR: deleteCropsData');
  }
};
function parseGeomRing(geomStr) {
  if (!geomStr) return [];
  try {
    const parsed = typeof geomStr === 'string' ? JSON.parse(geomStr) : geomStr;
    if (parsed.type === 'MultiPolygon') {
      return parsed.coordinates?.[0]?.[0] ?? [];
    }
    if (parsed.type === 'Polygon') {
      return parsed.coordinates?.[0] ?? [];
    }
    return parsed.coordinates?.[0] ?? [];
  } catch (_) {
    return [];
  }
}

Jangsu.getJangsuInnerData = async (req) => {
  try {
    const { seq } = req.query;
    // const sql = `
    //   select 
    //   csft_seq,
    //   grp_id,
    //   fpop_key,
    //   pnu,
    //   ST_AsGeoJSON(geom) AS geom,
    //   land_area,
    //   ridge_area,
    //   av_area,
    //   fm_land_cd,
    //   reg_date,
    //   mod_date,
    //   memo,
    //   cropcodes,
    //   addr,
    //   crop_nm,
    //   re_area,
    //   re_area_reason,
    //   col_a,
    //   col_b,
    //   col_c,
    //   col_d,
    //   col_e,
    //   col_f,
    //   col_g,
    //   col_h,
    //   col_i,
    //   col_j,
    //   col_k,
    //   col_l,
    //   col_m,
    //   col_n,
    //   col_o,
    //   col_p,
    //   col_q,
    //   col_r,
    //   col_s,
    //   col_t,
    //   col_u,
    //   col_v,
    //   col_w,
    //   col_x,
    //   col_y,
    //   col_z,
    //   col_aa,
    //   col_ab,
    //   col_ac,
    //   col_ad,
    //   col_ae,
    //   col_af,
    //   col_ag,
    //   col_ah,
    //   col_ai,
    //   col_aj,
    //   col_ak,
    //   col_al,
    //   col_am,
    //   col_an,
    //   col_ao,
    //   col_ap,
    //   col_aq,
    //   col_ar,
    //   col_ax,
    //   col_at,
    //   col_au,
    //   col_av,
    //   col_aw,
    //   col_az,
    //   col_ba,
    //   col_ay,
    //   col_bb,
    //   col_bc,
    //   col_bd,
    //   col_be,
    //   col_bf,
    //   col_bg,
    //   col_bh,
    //   write_data
    //   from tb_jangsu_inner
    //   WHERE csft_seq = ${seq}
    // `;
    // console.log(sql)
    const selectSql = `SELECT *, st_asgeojson(geom) AS geom, st_asgeojson(geo_center) AS geo_center from tb_jangsu_inner where csft_seq = ${seq}`;

    const resObj = await run("getJangsuInnerData", selectSql);

    const list = resObj.map(item => {
      let geo_center = [];
      try {
        if (item.geo_center) {
          const parsed = JSON.parse(item.geo_center);
          geo_center = parsed.coordinates ?? parsed;
        }
      } catch (_) {}
      return {
        ...item,
        geom: parseGeomRing(item.geom),
        geo_center,
      };
    });
    // console.log(list)
    return list;
  } catch (err) {
    logger.error(err)
    console.error('❌ Error in getJangsuInnerData:', err);
    throw new Error('DB_ERROR: getJangsuInnerData');
  }
};



Jangsu.getBoundsList = async (req) => {
  const minx = Number(req.query.minx);
  const miny = Number(req.query.miny);
  const maxx = Number(req.query.maxx);
  const maxy = Number(req.query.maxy);
  if (![minx, miny, maxx, maxy].every(Number.isFinite)) {
    throw new Error('INVALID_BOUNDS: minx,miny,maxx,maxy required');
  }
  const query = `
    SELECT
      csft_seq, grp_id, fpop_key, pnu, ridge_area,
      COALESCE(
        land_area,
        ROUND(ST_Area(geom::geography)::numeric, 1)::int
      ) AS land_area,
      COALESCE(
        av_area,
        ROUND(ST_Area(geom::geography)::numeric, 1)::int
      ) AS av_area,
      fm_land_cd, reg_date, mod_date, memo, cropcodes, addr, crop_nm,
      col_d, col_ac, col_ag, col_ah, col_ak, col_bg,
      re_area, re_area_reason,
      'N' AS inspection_flag,
      '' AS worked_user,
      '' AS working_in_july,
      COALESCE(write_data, 'N') AS write_data,
      ST_AsGeoJSON(
        ST_SimplifyPreserveTopology(
          ST_CollectionExtract(geom, 3),
          0.000015
        )
      ) AS geom,
      ST_AsGeoJSON(COALESCE(geo_center, ST_PointOnSurface(geom))) AS geo_center
    FROM field
    WHERE geom IS NOT NULL
      AND ST_Intersects(
        geom,
        ST_MakeEnvelope(${minx}, ${miny}, ${maxx}, ${maxy}, 4326)
      )
    ORDER BY fpop_key
    LIMIT 250;
  `;
  try {
    const resObj = await run("getBoundsList", query);
    return resObj;
  } catch (err) {
    logger.error(err)
    console.error('❌ Error in getBoundsList:', err);
    throw new Error('DB_ERROR: getBoundsList');
  }
};


Jangsu.getDetail = async (req) => {
  const { info_uuid, surveyYm } = req.query;
  const query = `
    SELECT
      t.*,
      st_asgeojson(t.geom) AS geom,
      st_asgeojson(t.geo_center) AS geo_center,
      COALESCE(
        t.av_area,
        ROUND(ST_Area(t.geom::geography)::numeric, 1)::int
      ) AS av_area,
      COALESCE(
        t.land_area,
        ROUND(ST_Area(t.geom::geography)::numeric, 1)::int
      ) AS land_area
    FROM field t
    WHERE t.fpop_key = '${info_uuid}';
  `;
  try {
    const resObj = await run("getDetail", query);
    return resObj;
  } catch (err) {
    logger.error(err)
    console.error('❌ Error in getDetail:', err);
    throw new Error('DB_ERROR: getDetail');
  }
};


/** addr → 시도/시군구/권역 파싱용 SQL 조각 (공통) */
const ADDR_SIDO_FROM_ADDR = `
  NULLIF(
    (regexp_match(
      COALESCE(addr, ''),
      '^\\s*([가-힣]+(?:특별시|광역시|특별자치시|특별자치도|도))'
    ))[1],
    ''
  )
`;

/** PNU / grp_id / 관리번호 앞 2자리 → 시도 (addr 파싱 실패 보정) */
const SIDO_CODE_SOURCE = `
  COALESCE(
    CASE WHEN NULLIF(TRIM(pnu), '') ~ '^[0-9]{2}' THEN TRIM(pnu) END,
    CASE WHEN NULLIF(TRIM(grp_id::text), '') ~ '^[0-9]{2}' THEN TRIM(grp_id::text) END,
    CASE WHEN NULLIF(TRIM(fpop_key), '') ~ '^[0-9]{2}' THEN TRIM(fpop_key) END,
    ''
  )
`;

const SIDO_FROM_PNU = `
  CASE LEFT(${SIDO_CODE_SOURCE}, 2)
    WHEN '11' THEN '서울특별시'
    WHEN '26' THEN '부산광역시'
    WHEN '27' THEN '대구광역시'
    WHEN '28' THEN '인천광역시'
    WHEN '29' THEN '광주광역시'
    WHEN '30' THEN '대전광역시'
    WHEN '31' THEN '울산광역시'
    WHEN '36' THEN '세종특별자치시'
    WHEN '41' THEN '경기도'
    WHEN '42' THEN '강원특별자치도'
    WHEN '43' THEN '충청북도'
    WHEN '44' THEN '충청남도'
    WHEN '45' THEN '전북특별자치도'
    WHEN '46' THEN '전라남도'
    WHEN '47' THEN '경상북도'
    WHEN '48' THEN '경상남도'
    WHEN '50' THEN '제주특별자치도'
    ELSE NULL
  END
`;

/** 주소·코드 모두 없을 때 중심좌표로 시도 추정 (기타 버킷 방지) */
const GEOM_PT = `COALESCE(geo_center, ST_Centroid(geom))`;
const SIDO_FROM_GEOM = `
  CASE
    WHEN ST_Y(${GEOM_PT}) BETWEEN 33.05 AND 33.70
         AND ST_X(${GEOM_PT}) BETWEEN 126.05 AND 127.10
      THEN '제주특별자치도'
    WHEN ST_Y(${GEOM_PT}) >= 37.05 AND ST_X(${GEOM_PT}) >= 127.40
      THEN '강원특별자치도'
    WHEN ST_Y(${GEOM_PT}) BETWEEN 37.35 AND 37.75
         AND ST_X(${GEOM_PT}) BETWEEN 126.75 AND 127.20
      THEN '서울특별시'
    WHEN ST_Y(${GEOM_PT}) BETWEEN 37.20 AND 37.70
         AND ST_X(${GEOM_PT}) BETWEEN 126.30 AND 126.85
      THEN '인천광역시'
    WHEN ST_Y(${GEOM_PT}) BETWEEN 36.80 AND 38.30
         AND ST_X(${GEOM_PT}) BETWEEN 126.40 AND 127.90
      THEN '경기도'
    WHEN ST_Y(${GEOM_PT}) BETWEEN 35.00 AND 35.40
         AND ST_X(${GEOM_PT}) BETWEEN 128.85 AND 129.35
      THEN '부산광역시'
    WHEN ST_Y(${GEOM_PT}) BETWEEN 35.70 AND 36.05
         AND ST_X(${GEOM_PT}) BETWEEN 128.40 AND 128.85
      THEN '대구광역시'
    WHEN ST_Y(${GEOM_PT}) BETWEEN 35.40 AND 35.75
         AND ST_X(${GEOM_PT}) BETWEEN 129.10 AND 129.55
      THEN '울산광역시'
    WHEN ST_Y(${GEOM_PT}) BETWEEN 36.20 AND 36.50
         AND ST_X(${GEOM_PT}) BETWEEN 127.25 AND 127.55
      THEN '대전광역시'
    WHEN ST_Y(${GEOM_PT}) BETWEEN 36.40 AND 36.65
         AND ST_X(${GEOM_PT}) BETWEEN 127.15 AND 127.40
      THEN '세종특별자치시'
    WHEN ST_Y(${GEOM_PT}) BETWEEN 35.00 AND 35.30
         AND ST_X(${GEOM_PT}) BETWEEN 126.70 AND 127.10
      THEN '광주광역시'
    WHEN ST_Y(${GEOM_PT}) BETWEEN 35.50 AND 37.20
         AND ST_X(${GEOM_PT}) BETWEEN 128.00 AND 129.60
      THEN '경상북도'
    WHEN ST_Y(${GEOM_PT}) BETWEEN 34.50 AND 35.90
         AND ST_X(${GEOM_PT}) BETWEEN 127.60 AND 129.40
      THEN '경상남도'
    WHEN ST_Y(${GEOM_PT}) BETWEEN 36.00 AND 37.15
         AND ST_X(${GEOM_PT}) BETWEEN 125.90 AND 127.60
      THEN '충청남도'
    WHEN ST_Y(${GEOM_PT}) BETWEEN 36.00 AND 37.20
         AND ST_X(${GEOM_PT}) BETWEEN 127.20 AND 128.70
      THEN '충청북도'
    WHEN ST_Y(${GEOM_PT}) BETWEEN 35.30 AND 36.05
         AND ST_X(${GEOM_PT}) BETWEEN 126.30 AND 127.95
      THEN '전북특별자치도'
    WHEN ST_Y(${GEOM_PT}) BETWEEN 34.20 AND 35.55
         AND ST_X(${GEOM_PT}) BETWEEN 126.20 AND 127.80
      THEN '전라남도'
    ELSE NULL
  END
`;

const ADDR_SIDO_EXPR = `
  COALESCE(
    ${ADDR_SIDO_FROM_ADDR},
    ${SIDO_FROM_PNU},
    ${SIDO_FROM_GEOM},
    '미분류'
  )
`;

const ADDR_SIGUNGU_EXPR = `
  COALESCE(
    NULLIF((regexp_match(COALESCE(addr, ''), '([가-힣]+군)'))[1], ''),
    NULLIF(
      (regexp_match(
        COALESCE(addr, ''),
        '(?:특별시|광역시|특별자치시)\\s+([가-힣]+구)'
      ))[1],
      ''
    ),
    NULLIF((regexp_match(COALESCE(addr, ''), '([가-힣]+시)'))[1], ''),
    '미분류'
  )
`;

/** 시도명 → 권역 ID (수도권·중부·영남 외는 모두 기타) */
const REGION_CASE_EXPR = (sidoCol = 'sido') => `
  CASE
    WHEN ${sidoCol} IN ('서울특별시', '인천광역시', '경기도') THEN 'sudo'
    WHEN ${sidoCol} IN (
      '대전광역시', '세종특별자치시', '충청남도', '충청북도'
    ) THEN 'jungbu'
    WHEN ${sidoCol} IN (
      '부산광역시', '대구광역시', '울산광역시', '경상남도', '경상북도'
    ) THEN 'yeongnam'
    ELSE 'other'
  END
`;

const REGION_LABEL_CASE = (regionCol = 'region') => `
  CASE ${regionCol}
    WHEN 'sudo' THEN '수도권'
    WHEN 'jungbu' THEN '중부'
    WHEN 'yeongnam' THEN '영남'
    WHEN 'other' THEN '기타'
    ELSE NULL
  END
`;

const ALLOWED_REGIONS = new Set(['sudo', 'jungbu', 'yeongnam', 'other']);

/** 예전 권역 ID(호남·강원·제주) → 기타 */
const LEGACY_OTHER_REGIONS = new Set(['gangwon', 'honam', 'jeju']);

function normalizeRegionParam(region) {
  const r = String(region ?? '').trim();
  if (LEGACY_OTHER_REGIONS.has(r)) return 'other';
  return r;
}

function sanitizeIdentParam(value) {
  const s = String(value ?? '').trim();
  if (!s) return '';
  // 한글·영문·숫자·공백·하이픈만 허용 (SQL 주입 방지)
  if (!/^[가-힣A-Za-z0-9\s\-]+$/.test(s)) return '';
  return s.replace(/'/g, "''");
}

Jangsu.getSimpleStati = async () => {
  const query = `
    SELECT
      COUNT(*)::text AS total_groups,
      COUNT(*) FILTER (
        WHERE COALESCE(write_data, 'N') = 'Y'
      )::text AS all_inspected_groups
    FROM field
    WHERE geom IS NOT NULL;
  `;
  try {
    const resObj = await run('getSimpleStati', query);
    return resObj;
  } catch (err) {
    logger.error(err);
    console.error('❌ Error in getSimpleStati:', err);
    throw new Error('DB_ERROR: getSimpleStati');
  }
};


/** 권역별 진척 통계 */
Jangsu.getRegionStati = async () => {
  const query = `
    WITH base AS (
      SELECT
        COALESCE(write_data, 'N') AS write_data,
        ${ADDR_SIDO_EXPR} AS sido
      FROM field
      WHERE geom IS NOT NULL
    ),
    tagged AS (
      SELECT
        write_data,
        sido,
        ${REGION_CASE_EXPR('sido')} AS region
      FROM base
    )
    SELECT
      region,
      ${REGION_LABEL_CASE('region')} AS region_nm,
      COUNT(*) FILTER (WHERE UPPER(TRIM(write_data)) = 'Y')::int AS inspected_count,
      COUNT(*)::int AS total_count,
      ROUND(
        (
          COUNT(*) FILTER (WHERE UPPER(TRIM(write_data)) = 'Y')::numeric
          * 100
          / NULLIF(COUNT(*), 0)
        ),
        1
      ) AS inspected_percentage
    FROM tagged
    WHERE region IS NOT NULL
    GROUP BY region
    ORDER BY
      CASE region
        WHEN 'sudo' THEN 1
        WHEN 'jungbu' THEN 2
        WHEN 'yeongnam' THEN 3
        WHEN 'other' THEN 4
        ELSE 9
      END;
  `;
  try {
    const resObj = await run('getRegionStati', query);
    return resObj;
  } catch (err) {
    logger.error(err);
    console.error('❌ Error in getRegionStati:', err);
    throw new Error('DB_ERROR: getRegionStati');
  }
};


/** addr에서 시도·시군구 추출 후 집계. ?region= 있으면 해당 권역만 */
Jangsu.getSigunguStati = async (req) => {
  const region = normalizeRegionParam(req?.query?.region);
  const regionFilter =
    region && ALLOWED_REGIONS.has(region)
      ? `WHERE region = '${region}'`
      : '';

  const query = `
    WITH base AS (
      SELECT
        COALESCE(write_data, 'N') AS write_data,
        ${ADDR_SIDO_EXPR} AS sido,
        ${ADDR_SIGUNGU_EXPR} AS sigungu
      FROM field
      WHERE geom IS NOT NULL
    ),
    tagged AS (
      SELECT
        write_data,
        sido,
        sigungu,
        ${REGION_CASE_EXPR('sido')} AS region
      FROM base
    )
    SELECT
      sigungu AS code_nm,
      sido,
      region,
      ${REGION_LABEL_CASE('region')} AS region_nm,
      COUNT(*) FILTER (WHERE UPPER(TRIM(write_data)) = 'Y')::int AS inspected_count,
      COUNT(*)::int AS total_count,
      ROUND(
        (
          COUNT(*) FILTER (WHERE UPPER(TRIM(write_data)) = 'Y')::numeric
          * 100
          / NULLIF(COUNT(*), 0)
        ),
        1
      ) AS inspected_percentage
    FROM tagged
    ${regionFilter}
    GROUP BY sigungu, sido, region
    ORDER BY
      CASE WHEN sigungu = '미분류' THEN 1 ELSE 0 END,
      total_count DESC,
      sido,
      code_nm;
  `;
  try {
    const resObj = await run('getSigunguStati', query);
    return resObj;
  } catch (err) {
    logger.error(err);
    console.error('❌ Error in getSigunguStati:', err);
    throw new Error('DB_ERROR: getSigunguStati');
  }
};


Jangsu.getSurveyedList = async (req) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const region = normalizeRegionParam(req.query.region);
  const sigungu = sanitizeIdentParam(req.query.sigungu);
  const status = String(req.query.status ?? 'done').trim().toLowerCase();

  const filters = ['geom IS NOT NULL'];

  if (status === 'done') {
    filters.push(`COALESCE(write_data, 'N') = 'Y'`);
  } else if (status === 'pending') {
    filters.push(`COALESCE(write_data, 'N') <> 'Y'`);
  } else if (status !== 'all') {
    filters.push(`COALESCE(write_data, 'N') = 'Y'`);
  }

  if (region && ALLOWED_REGIONS.has(region)) {
    filters.push(`${REGION_CASE_EXPR(ADDR_SIDO_EXPR)} = '${region}'`);
  }
  if (sigungu) {
    filters.push(`${ADDR_SIGUNGU_EXPR} = '${sigungu}'`);
  }

  const query = `
    SELECT
      fpop_key,
      pnu,
      COALESCE(addr, '') AS addr,
      COALESCE(mod_date, '') AS mod_date,
      COALESCE(
        land_area,
        ROUND(ST_Area(geom::geography)::numeric, 1)::int
      ) AS land_area,
      CASE WHEN COALESCE(write_data, 'N') = 'Y' THEN 'Y' ELSE 'N' END AS survey_status,
      ${ADDR_SIDO_EXPR} AS sido,
      ${ADDR_SIGUNGU_EXPR} AS sigungu,
      ${REGION_CASE_EXPR(ADDR_SIDO_EXPR)} AS region
    FROM field
    WHERE ${filters.join('\n      AND ')}
    ORDER BY
      CASE WHEN COALESCE(write_data, 'N') = 'Y' THEN 0 ELSE 1 END,
      mod_date DESC NULLS LAST,
      addr
    LIMIT ${limit} OFFSET ${offset};
  `;
  try {
    const resObj = await run('getSurveyedList', query);
    return resObj;
  } catch (err) {
    logger.error(err);
    console.error('❌ Error in getSurveyedList:', err);
    throw new Error('DB_ERROR: getSurveyedList');
  }
};


/** 시군구(·권역) 필지 목록 — 엑셀 내보내기용 (조사완료 여부 포함, 상한 2만건) */
Jangsu.listSigunguParcels = async (req) => {
  const region = normalizeRegionParam(req.query.region);
  const sigungu = sanitizeIdentParam(req.query.sigungu);
  const sido = sanitizeIdentParam(req.query.sido);

  const filters = ['geom IS NOT NULL'];
  if (region && ALLOWED_REGIONS.has(region)) {
    filters.push(`${REGION_CASE_EXPR(ADDR_SIDO_EXPR)} = '${region}'`);
  }
  if (sigungu) {
    filters.push(`${ADDR_SIGUNGU_EXPR} = '${sigungu}'`);
  }
  if (sido) {
    filters.push(`${ADDR_SIDO_EXPR} = '${sido}'`);
  }

  const query = `
    SELECT
      fpop_key,
      pnu,
      COALESCE(grp_id::text, '') AS grp_id,
      COALESCE(addr, '') AS addr,
      COALESCE(
        land_area,
        ROUND(ST_Area(geom::geography)::numeric, 1)::int
      ) AS land_area,
      COALESCE(fm_land_cd, '') AS fm_land_cd,
      COALESCE(write_data, 'N') AS write_data,
      COALESCE(mod_date, '') AS mod_date,
      COALESCE(reg_date, '') AS reg_date,
      ${ADDR_SIDO_EXPR} AS sido,
      ${ADDR_SIGUNGU_EXPR} AS sigungu,
      ${REGION_CASE_EXPR(ADDR_SIDO_EXPR)} AS region
    FROM field
    WHERE ${filters.join('\n      AND ')}
    ORDER BY
      CASE WHEN COALESCE(write_data, 'N') = 'Y' THEN 0 ELSE 1 END,
      addr,
      fpop_key
    LIMIT 20000;
  `;
  try {
    return await run('listSigunguParcels', query);
  } catch (err) {
    logger.error(err);
    console.error('❌ Error in listSigunguParcels:', err);
    throw new Error('DB_ERROR: listSigunguParcels');
  }
};


Jangsu.clearSurveyData = async (req) => {
  const fpopKey = String(req.body?.fpop_key ?? '').trim();
  if (!fpopKey) {
    throw new Error('INVALID_FPOP_KEY: fpop_key required');
  }
  const safeKey = fpopKey.replace(/'/g, "''");
  const clearSql = `
    UPDATE field SET
      col_a = '', col_b = '', col_c = '', col_e = '', col_f = '', col_g = '',
      col_h = '', col_i = '', col_j = '', col_k = '', col_l = '', col_m = '',
      col_n = '', col_o = '', col_p = '', col_q = '', col_r = '', col_s = '',
      col_t = '', col_u = '', col_v = '', col_w = '', col_x = '', col_y = '',
      col_z = '', col_aa = '', col_ab = '', col_ac = '', col_ad = '', col_ae = '',
      col_af = '', col_ag = '', col_ah = '', col_ai = '', col_aj = '', col_ak = '',
      col_al = '', col_am = '', col_an = '', col_ao = '', col_ap = '', col_aq = '',
      col_ar = '', col_at = '', col_au = '', col_av = '', col_aw = '', col_ax = '',
      col_ay = '', col_az = '', col_ba = '', col_bb = '', col_bc = '', col_bd = '',
      col_be = '', col_bf = '', col_bg = '', col_bh = '',
      re_area = NULL,
      re_area_reason = '',
      memo = '',
      write_data = 'N',
      mod_date = ''
    WHERE fpop_key = '${safeKey}';
  `;
  try {
    await run('clearSurveyData', clearSql);
    await run(
      'clearSurveyData delete images',
      `DELETE FROM tb_jangsu_img WHERE fpop_key = '${safeKey}';`,
    );
    return '1';
  } catch (err) {
    logger.error(err);
    console.error('❌ Error in clearSurveyData:', err);
    throw new Error('DB_ERROR: clearSurveyData');
  }
};

/** 권역·시군구 필터 내 조사완료 데이터 일괄 삭제 */
Jangsu.clearSurveyDataBatch = async (req) => {
  const region = normalizeRegionParam(
    req.body?.region ?? req.query?.region ?? '',
  );
  const sigungu = sanitizeIdentParam(
    req.body?.sigungu ?? req.query?.sigungu ?? '',
  );

  const filters = [
    'geom IS NOT NULL',
    `COALESCE(write_data, 'N') = 'Y'`,
  ];

  if (region && ALLOWED_REGIONS.has(region)) {
    filters.push(`${REGION_CASE_EXPR(ADDR_SIDO_EXPR)} = '${region}'`);
  }
  if (sigungu) {
    filters.push(`${ADDR_SIGUNGU_EXPR} = '${sigungu}'`);
  }

  const whereClause = filters.join('\n      AND ');
  const clearSql = `
    UPDATE field SET
      col_a = '', col_b = '', col_c = '', col_e = '', col_f = '', col_g = '',
      col_h = '', col_i = '', col_j = '', col_k = '', col_l = '', col_m = '',
      col_n = '', col_o = '', col_p = '', col_q = '', col_r = '', col_s = '',
      col_t = '', col_u = '', col_v = '', col_w = '', col_x = '', col_y = '',
      col_z = '', col_aa = '', col_ab = '', col_ac = '', col_ad = '', col_ae = '',
      col_af = '', col_ag = '', col_ah = '', col_ai = '', col_aj = '', col_ak = '',
      col_al = '', col_am = '', col_an = '', col_ao = '', col_ap = '', col_aq = '',
      col_ar = '', col_at = '', col_au = '', col_av = '', col_aw = '', col_ax = '',
      col_ay = '', col_az = '', col_ba = '', col_bb = '', col_bc = '', col_bd = '',
      col_be = '', col_bf = '', col_bg = '', col_bh = '',
      re_area = NULL,
      re_area_reason = '',
      memo = '',
      write_data = 'N',
      mod_date = ''
    WHERE ${whereClause};
  `;

  try {
    const countRows = await run(
      'clearSurveyDataBatch count',
      `SELECT COUNT(*)::int AS cnt FROM field WHERE ${whereClause};`,
    );
    const count = Number(countRows?.[0]?.cnt ?? 0);
    if (count === 0) {
      return { count: 0 };
    }

    await run('clearSurveyDataBatch', clearSql);
    await run(
      'clearSurveyDataBatch delete images',
      `DELETE FROM tb_jangsu_img
       WHERE fpop_key IN (SELECT fpop_key FROM field WHERE ${whereClause});`,
    );
    return { count };
  } catch (err) {
    logger.error(err);
    console.error('❌ Error in clearSurveyDataBatch:', err);
    throw new Error('DB_ERROR: clearSurveyDataBatch');
  }
};


Jangsu.setWorkingInJulyFlag = async (req) => {
  try {
    const { flag, etc_meno, poly_uuid, workedUser, unitFlag, grpId } = req.query;

    const finalFlag = flag === '밭' ? '' : flag;
    const flagStr = finalFlag === '' ? 'N' : 'Y';

    if (unitFlag === 'total') {
      const updateZoneSql1 = `UPDATE field SET write_data = 'Y', mod_date = TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') WHERE grp_id = '${grpId}';`;
      await run("setWorkingInJulyFlag updateZoneSql1", updateZoneSql1);

      const updateZoneSql2 = `UPDATE tb_jangus_zone SET end_flag = 'Y' WHERE grp_id = '${grpId}';`;
      await run("setWorkingInJulyFlag updateZoneSql2", updateZoneSql2);
      return '1';
    }
    // else if (unitFlag === 'unit') {
    //   // ✅ 단일 폴리곤 처리
    //   const updateUnitSql = `
    //     UPDATE field 
    //     SET working_in_july = '${finalFlag}',
    //         inspection_flag = 'Y',
    //         -- inspection_flag = '${flagStr}',
    //         worked_user = '${workedUser}',
    //         memo = '${etc_meno}',
    //         mod_date = TO_CHAR(NOW(), 'YYYYMMDDHH24MISS')
    //     WHERE fpop_key = '${poly_uuid}';
    //   `;
    //   await run("setWorkingInJulyFlag updateUnitLayer", updateUnitSql);

    //   // ✅ 상태 업데이트 (Zone & Layer 종합 상태)
    //   await run("setWorkingInJulyFlag updatePolyStatus", QueryCommonSql.UPDATE_TB_POLY);
    //   await run("setWorkingInJulyFlag updateZoneStatus", QueryCommonSql.UPDATE_TB_ZONE);

    //   return '1';
    // }
  } catch (err) {
    logger.error(err)
    console.error('❌ Error in setWorkingInJulyFlag:', err);
    throw new Error('DB_ERROR: setWorkingInJulyFlag');
  }
};

module.exports = Jangsu;
