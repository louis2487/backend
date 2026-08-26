'use strict';

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const roadview = require('../controllers/roadview.controller');

module.exports = (app) => {
  const router = require('express').Router();

  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      const dir = path.resolve(__dirname, '../..', 'uploads/roadview');
      try {
        if (!fs.existsSync(dir)) await fs.promises.mkdir(dir, { recursive: true });
      } catch (err) {
        console.error('로드뷰 업로드 폴더 생성 오류:', err);
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const safe = String(file.originalname || 'file').replace(/[\\/:*?"<>|]/g, '_');
      cb(null, `${Date.now()}_${safe}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024, fieldSize: 25 * 1024 * 1024 },
  });

  // POST /v1/load/roadview/convert
  router.post(
    '/roadview/convert',
    upload.fields([
      { name: 'file', maxCount: 1 },
      { name: 'files', maxCount: 20 },
    ]),
    roadview.convert
  );

  app.use('/v1/load', router);
};
