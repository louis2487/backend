const Property = require("../models/property.model.js");
const logger = require('../config/winston');

const fs = require('fs');

// Find a single User by Id
exports.getAll = (req, res) => {
  Property.getAll(req.body, (err, data) => {
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
exports.getSelectData = (req, res) => {
  Property.getSelectData(req, (err, data) => {
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
exports.saveJeonggye = (req, res) => {
  Property.saveJeonggye(req, (err, data) => {
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
exports.updateScreenCaptrue = (req, res) => {
  Property.updateScreenCaptrue(req, (err, data) => {
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
exports.updateScreenCaptrueMap = (req, res) => {
  Property.updateScreenCaptrueMap(req, (err, data) => {
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
exports.deleteScreenCaptureImage = (req, res) => {
  Property.deleteScreenCaptureImage(req, (err, data) => {
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
exports.mkOutputExelFile = (req, res) => {
  Property.mkOutputExelFile(req, (err, data) => {
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
exports.getAllDetail = (req, res) => {

  Property.getAllDetail(req, (err, data) => {
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
exports.getTotalJoinList = (req, res) => {

  Property.getTotalJoinList(req, (err, data) => {
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
exports.renameFile = (req, res) => {

  Property.renameFile(req, (err, data) => {
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
// 생성(mkOutputExelFile) 로직을 Promise로 감싸 재사용
const generateOutputFile = (body) =>
  new Promise((resolve, reject) => {
    Property.mkOutputExelFile({ body }, (err, data) =>
      err ? reject(err) : resolve(data)
    );
  });

exports.getExelFile = async (req, res) => {
  try {
    // GET query 또는 POST body (합본 fpop_keys는 body 권장)
    const src = {
      ...(req.query || {}),
      ...((req.body && typeof req.body === 'object') ? req.body : {}),
    };
    var fpop_key = src.fpop_key;
    var flag = src.flag;
    var pk_uuid = src.pk_uuid;

    var fileName = '';
    if (flag == 'outer') {
      fileName = fpop_key;
    } else if (flag == 'inner') {
      fileName = pk_uuid;
    }

    const format = (src.format || 'pdf').toString().toLowerCase();
    const isHwpx = format === 'hwpx' || format === 'hwpx_batch';
    const isXlsx = format === 'xlsx' || format === 'xlsx_batch';
    if (format === 'hwpx_batch') {
      fileName = 'hwpx_batch_merged';
    } else if (format === 'xlsx_batch') {
      fileName = 'xlsx_batch_merged';
    }
    const ext = isXlsx
      ? 'xlsx'
      : format === 'docx'
        ? 'docx'
        : isHwpx
          ? 'hwpx'
          : 'pdf';
    var filePath = './uploads/assets/' + fileName + '.' + ext;

    // 생성 후 곧바로 스트리밍 (합본 키는 body/query의 fpop_keys)
    await generateOutputFile({
      fpop_key,
      pk_uuid,
      flag,
      format,
      fpop_keys: src.fpop_keys,
    });

    if (!fs.existsSync(filePath)) {
      return res.status(404).send({ msg: '파일이 없습니다.' });
    }

    if (ext === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
    } else if (ext === 'docx') {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.docx"`);
    } else if (ext === 'hwpx') {
      res.setHeader('Content-Type', 'application/hwp+zip');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.hwpx"`);
    } else {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
    }

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    logger.error(err);
    if (!res.headersSent) {
      res.status(500).send({ msg: err.message || '파일 생성 실패' });
    }
  }
};
exports.mvWorkImageFile = (req, res) => {

  Property.mvWorkImageFile(req, (err, data) => {
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
