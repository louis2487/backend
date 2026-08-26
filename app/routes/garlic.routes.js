const multer = require('multer');
const path = require('path');
const fs = require('fs');

const fileStorageEngine = multer.diskStorage({
  destination: async (req, file, cb) => {
    const rel = String(req.body.imgPath || 'uploads/garlic').replace(/\\/g, '/').replace(/^\.\//, '');
    const uploadPath = path.resolve(__dirname, '../..', rel);
    try {
      if (!fs.existsSync(uploadPath)) {
        await fs.promises.mkdir(uploadPath, { recursive: true });
      }
    } catch (err) {
      console.error('garlic upload folder error:', err);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const safe = String(file.originalname || 'img.jpg').replace(/[\\/:*?"<>|]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({
  storage: fileStorageEngine,
  limits: { fieldSize: 25 * 1024 * 1024, fileSize: 25 * 1024 * 1024 },
});

const garlic = require('../controllers/garlic.controller.js');

module.exports = (app) => {
  const router = require('express').Router();

  router.get('/getBoundsList', garlic.getBoundsList);
  router.get('/listParcels', garlic.listParcels);
  router.get('/getParcelDetail', garlic.getParcelDetail);

  router.get('/listInterviews', garlic.listInterviews);
  router.get('/getInterview', garlic.getInterview);
  router.post('/updateInterview', garlic.updateInterview);

  router.get('/getParcelSurvey', garlic.getParcelSurvey);
  router.post('/updateParcelSurvey', garlic.updateParcelSurvey);

  router.get('/getParcelImg', garlic.getParcelImg);
  router.post('/uploadParcelImg', upload.array('files'), garlic.uploadParcelImg);
  router.get('/deleteParcelImg', garlic.deleteParcelImg);

  app.use('/v1/garlic', router);
};
