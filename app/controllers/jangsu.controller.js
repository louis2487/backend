const Jangsu = require("../models/jangsu.model.js");
const logger = require('../config/winston');


exports.getNewInnerPolyLine = (req, res) => {
  Jangsu.getNewInnerPolyLine(req, (err, data) => {
    if (err) {
      logger.error(err)
      res.status(500).send({
        msg: err.message
      });
    } else {

      res.send(data);
    }
  });
};
exports.getJangsuDetailDataLoad = (req, res) => {
  Jangsu.getJangsuDetailDataLoad(req, (err, data) => {
    if (err) {
      logger.error(err)
      res.status(500).send({
        msg: err.message
      });
    } else {

      res.send(data);
    }
  });
};
exports.updateJangsuImg = (req, res) => {
  Jangsu.updateJangsuImg(req, (err, data) => {
    if (err) {
      logger.error(err)
      res.status(500).send({
        msg: err.message
      });
    } else {

      res.send(data);
    }
  });
};
exports.updateJangsuInfoData = (req, res) => {
  Jangsu.updateJangsuInfoData(req, (err, data) => {
    if (err) {
      logger.error(err)
      res.status(500).send({
        msg: err.message
      });
    } else {

      res.send(data);
    }
  });
};
exports.getJangsuImgData = (req, res) => {
  Jangsu.getJangsuImgData(req, (err, data) => {
    if (err) {
      logger.error(err)
      res.status(500).send({
        msg: err.message
      });
    } else {

      res.send(data);
    }
  });
};
exports.deleteJangsuImg = (req, res) => {
  Jangsu.deleteJangsuImg(req, (err, data) => {
    if (err) {
      logger.error(err)
      res.status(500).send({
        msg: err.message
      });
    } else {

      res.send(data);
    }
  });
};

exports.uploadGalleryJangsuImg = (req, res) => {
  Jangsu.uploadGalleryJangsuImg(req, (err, data) => {
    if (err) {
      logger.error(err)
      res.status(500).send({
        msg: err.message
      });
    } else {

      res.send(data);
    }
  });
};

exports.putNewPoly = async (req, res) => {
  try {
    const property = await Jangsu.putNewPoly(req);
    res.json(property);
  } catch (err) {
    logger.error(err)
    res.status(500).json({ msg: err.message }); //
  }
};


exports.uploadCameraJangsuImg = (req, res) => {
  Jangsu.uploadCameraJangsuImg(req, (err, data) => {
    if (err) {
      logger.error(err)
      res.status(500).send({
        msg: err.message
      });
    } else {

      res.send(data);
    }
  });
};
// exports.zoneTotalList = (req, res) => {
//   Jangsu.zoneTotalList(req, (err, data) => {
//     if (err) {
//       logger.error(err)
//       res.status(500).send({
//         msg: err.message
//       });
//     } else {

//       res.send(data);
//     }
//   });
// };



exports.zoneTotalList = async (req, res) => {
  try {
    const property = await Jangsu.zoneTotalList(req);
    const list = property.map(item => ({
      ...item,
      addr: item.addr?.trim() ? item.addr : '',
      geom: JSON.parse(item.geom).coordinates[0]
    }));
    res.json(list);
  } catch (err) {
    logger.error(err)
    res.status(500).json({ msg: err.message }); //
  }
};
exports.deleteJangsuData = async (req, res) => {
  try {
    const property = await Jangsu.deleteJangsuData(req);
    res.json(property);
  } catch (err) {
    logger.error(err)
    res.status(500).json({ msg: err.message }); //
  }
};
exports.getJangsuInnerData = async (req, res) => {
  try {
    const property = await Jangsu.getJangsuInnerData(req);
    const parseGeomRing = (geomStr) => {
      if (!geomStr) return [];
      try {
        const parsed = typeof geomStr === 'string' ? JSON.parse(geomStr) : geomStr;
        if (parsed.type === 'MultiPolygon') {
          return parsed.coordinates?.[0]?.[0] ?? [];
        }
        if (parsed.type === 'Polygon') {
          return parsed.coordinates?.[0] ?? [];
        }
        return parsed.coordinates?.[0] ?? parsed ?? [];
      } catch (_) {
        return Array.isArray(geomStr) ? geomStr : [];
      }
    };
    const list = property.map(item => {
      let geo_center = [];
      try {
        if (item.geo_center) {
          const parsed = typeof item.geo_center === 'string'
            ? JSON.parse(item.geo_center)
            : item.geo_center;
          geo_center = parsed.coordinates ?? parsed;
        }
      } catch (_) {}
      return {
        ...item,
        geom: Array.isArray(item.geom) ? item.geom : parseGeomRing(item.geom),
        geo_center,
      };
    });
    res.json(list);
  } catch (err) {
    logger.error(err)
    res.status(500).json({ msg: err.message }); //
  }
};


exports.getBoundsList = async (req, res) => {
  try {
    const property = await Jangsu.getBoundsList(req);
    const parseGeomRing = (geomStr) => {
      if (!geomStr) return [];
      try {
        const parsed = JSON.parse(geomStr);
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
    };
    const list = property.map(item => {
      let geom = parseGeomRing(item.geom);
      let geo_center = [];
      try {
        if (item.geo_center) {
          const parsed = JSON.parse(item.geo_center);
          geo_center = parsed.coordinates ?? parsed;
        }
      } catch (_) {}
      return {
        ...item,
        geom,
        geo_center,
      };
    }).filter(item => Array.isArray(item.geom) && item.geom.length >= 3);
    res.json(list);
  } catch (err) {
    logger.error(err)
    res.status(500).json({ msg: err.message });
  }
};

exports.getDetail = async (req, res) => {
  try {
    const property = await Jangsu.getDetail(req);
    const parseGeomRing = (geomStr) => {
      if (!geomStr) return [];
      try {
        const parsed = JSON.parse(geomStr);
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
    };
    const list = property.map(item => {
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
    res.json(list);
  } catch (err) {
    logger.error(err)
    res.status(500).json({ msg: err.message }); //
  }
};

exports.setWorkingInJulyFlag = async (req, res) => {
  try {
    const property = await Jangsu.setWorkingInJulyFlag(req);
    res.json(property);
  } catch (err) {
    logger.error(err)
    res.status(500).json({ msg: err.message }); //
  }
};

exports.getSimpleStati = async (req, res) => {
  try {
    const rows = await Jangsu.getSimpleStati();
    res.json(rows);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ msg: err.message });
  }
};

exports.getRegionStati = async (req, res) => {
  try {
    const rows = await Jangsu.getRegionStati();
    res.json(rows);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ msg: err.message });
  }
};

exports.getSigunguStati = async (req, res) => {
  try {
    const rows = await Jangsu.getSigunguStati(req);
    res.json(rows);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ msg: err.message });
  }
};

exports.getSurveyedList = async (req, res) => {
  try {
    const rows = await Jangsu.getSurveyedList(req);
    res.json(rows);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ msg: err.message });
  }
};

/** 시군구 필지 목록 엑셀 다운로드 */
exports.exportSigunguXlsx = async (req, res) => {
  try {
    const Excel = require('exceljs');
    const rows = await Jangsu.listSigunguParcels(req);
    const region = String(req.query.region ?? '').trim() || 'all';
    const sigungu = String(req.query.sigungu ?? '').trim() || '전체';
    const safeName = `${region}_${sigungu}`.replace(/[\\/:*?"<>|]/g, '_');

    const workbook = new Excel.Workbook();
    workbook.creator = 'admin_web';
    workbook.created = new Date();
    const sheet = workbook.addWorksheet('필지목록', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    const headers = [
      '권역',
      '시도',
      '시군구',
      '관리번호',
      'PNU',
      '그룹ID',
      '주소',
      '면적(㎡)',
      '지목코드',
      '조사완료',
      '등록일',
      '수정일',
    ];
    sheet.addRow(headers);
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' },
      };
    });

    for (const r of rows) {
      sheet.addRow([
        r.region || '',
        r.sido || '',
        r.sigungu || '',
        r.fpop_key || '',
        r.pnu || '',
        r.grp_id || '',
        r.addr || '',
        r.land_area ?? '',
        r.fm_land_cd || '',
        String(r.write_data || 'N').toUpperCase() === 'Y' ? 'Y' : 'N',
        r.reg_date || '',
        r.mod_date || '',
      ]);
    }

    sheet.columns.forEach((col) => {
      let max = 10;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const len = String(cell.value ?? '').length;
        if (len > max) max = len;
      });
      col.width = Math.min(40, Math.max(10, max + 2));
    });

    const filenameUtf = `parcels_${safeName}.xlsx`
    const filenameAscii = `parcels_${region}_${Date.now()}.xlsx`.replace(
      /[^\w.-]/g,
      '_',
    )
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filenameAscii}"; filename*=UTF-8''${encodeURIComponent(filenameUtf)}`,
    )
    await workbook.xlsx.write(res)
    res.end()  } catch (err) {
    logger.error(err);
    if (!res.headersSent) {
      res.status(500).json({ msg: err.message });
    }
  }
};

exports.clearSurveyData = async (req, res) => {
  try {
    const result = await Jangsu.clearSurveyData(req);
    res.json({ ok: true, result });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ msg: err.message });
  }
};

exports.clearSurveyDataBatch = async (req, res) => {
  try {
    const result = await Jangsu.clearSurveyDataBatch(req);
    res.json({ ok: true, ...result });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ msg: err.message });
  }
};

/** 등기부·공유재산 + (토지대장|건축물대장) → 분석완료.xlsx */
exports.macroAnalyze = async (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  const { analyzeToXlsx } = require('../utils/shared_property_macro');

  const deunggi = req.files?.deunggi?.[0];
  const gongyu = req.files?.gongyu?.[0];
  const toji = req.files?.toji?.[0];
  const geonchuk = req.files?.geonchuk?.[0];

  if (!deunggi || !gongyu) {
    return res.status(400).send({
      msg: '등기부(deunggi), 공유재산(gongyu) 파일을 업로드하세요.',
    });
  }
  if (toji && geonchuk) {
    return res.status(400).send({
      msg: '토지대장과 건축물대장은 하나만 선택하세요.',
    });
  }
  if (!toji && !geonchuk) {
    return res.status(400).send({
      msg: '토지대장(toji) 또는 건축물대장(geonchuk) 중 하나를 업로드하세요.',
    });
  }

  const mode = geonchuk ? 'building' : 'land';
  const ledger = geonchuk || toji;

  const outPath = path.join(
    os.tmpdir(),
    `jangsu_macro_${Date.now()}_${Math.random().toString(36).slice(2)}.xlsx`
  );
  const uploaded = [deunggi.path, gongyu.path, ledger.path];

  try {
    await analyzeToXlsx(
      {
        deunggiPath: deunggi.path,
        gongyuPath: gongyu.path,
        ledgerPath: ledger.path,
        mode,
      },
      outPath
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      "attachment; filename=\"analysis_complete.xlsx\"; filename*=UTF-8''%EB%B6%84%EC%84%9D%EC%99%84%EB%A3%8C.xlsx"
    );

    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(outPath);
      stream.on('error', reject);
      res.on('finish', resolve);
      res.on('close', resolve);
      stream.pipe(res);
    });
  } catch (err) {
    logger.error(err);
    if (!res.headersSent) {
      res.status(500).send({ msg: err.message || '매크로 분석 실패' });
    }
  } finally {
    for (const p of [...uploaded, outPath]) {
      try {
        if (p && fs.existsSync(p)) fs.unlinkSync(p);
      } catch (_) {}
    }
  }
};

/** 배치: 시군구별 결과분석_{지역}.xlsx zip / files[] + mode */
exports.macroAnalyzeBatch = async (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  const {
    analyzeBatchToZip,
    groupMacroUploads,
  } = require('../utils/shared_property_macro');

  const files = Array.isArray(req.files) ? req.files : [];
  const mode = req.body?.mode === 'building' ? 'building' : 'land';

  if (!files.length) {
    return res.status(400).send({
      msg: '배치 파일을 업로드하세요. 예: 부동산등기부_과천시.xlsx',
    });
  }

  const outPath = path.join(
    os.tmpdir(),
    `jangsu_macro_batch_${Date.now()}_${Math.random().toString(36).slice(2)}.zip`
  );
  const uploaded = files.map((f) => f.path);

  try {
    const sets = groupMacroUploads(files, mode);
    await analyzeBatchToZip(sets, outPath);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      "attachment; filename=\"analysis_by_region.zip\"; filename*=UTF-8''%EA%B2%B0%EA%B3%BC%EB%B6%84%EC%84%9D_%EC%8B%9C%EA%B5%B0%EA%B5%AC.zip"
    );

    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(outPath);
      stream.on('error', reject);
      res.on('finish', resolve);
      res.on('close', resolve);
      stream.pipe(res);
    });
  } catch (err) {
    logger.error(err);
    if (!res.headersSent) {
      res.status(400).send({ msg: err.message || '배치 매크로 분석 실패' });
    }
  } finally {
    for (const p of [...uploaded, outPath]) {
      try {
        if (p && fs.existsSync(p)) fs.unlinkSync(p);
      } catch (_) {}
    }
  }
};

