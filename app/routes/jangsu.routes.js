const multer = require('multer')
const path = require('path')
const fs = require('fs');


const fileStorageEngine = multer.diskStorage({
  destination: async (req, file, cb) => {
    // server.js 기준 back/uploads/... (cwd 무관)
    const rel = String(req.body.imgPath || 'uploads').replace(/\\/g, '/').replace(/^\.\//, '');
    const uploadPath = path.resolve(__dirname, '../..', rel);
    try {
      if (!fs.existsSync(uploadPath)) {
        await fs.promises.mkdir(uploadPath, { recursive: true });
      }
    } catch (err) {
      console.error("폴더 생성 오류:", err);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: fileStorageEngine, limits: { fieldSize: 25 * 1024 * 1024 } });

const jangsu = require("../controllers/jangsu.controller.js");
module.exports = app => {




  var router = require("express").Router();


  router.get("/getBoundsList", jangsu.getBoundsList);
  router.get("/getDetail", jangsu.getDetail);
  router.get("/setWorkingInJulyFlag", jangsu.setWorkingInJulyFlag);


  router.post("/deleteJangsuData", jangsu.deleteJangsuData);
  router.get("/getJangsuInnerData", jangsu.getJangsuInnerData);
  router.get("/getNewInnerPolyLine", jangsu.getNewInnerPolyLine);
  router.get("/getJangsuDetailDataLoad", jangsu.getJangsuDetailDataLoad);
  router.get("/getJangsuDetailDataLoad", jangsu.getJangsuDetailDataLoad);
  router.post("/putNewPoly", jangsu.putNewPoly);
  router.post("/updateJangsuInfoData", jangsu.updateJangsuInfoData);
  router.get("/getJangsuImgData", jangsu.getJangsuImgData);
  router.post("/updateJangsuImg", upload.none(), jangsu.updateJangsuImg);
  router.get("/deleteJangsuImg", jangsu.deleteJangsuImg);
  router.post('/uploadGalleryJangsuImg', upload.array('files'), jangsu.uploadGalleryJangsuImg)
  router.post('/uploadCameraJangsuImg', upload.single('file'), jangsu.uploadCameraJangsuImg)
  router.get("/zoneTotalList", jangsu.zoneTotalList);
  router.get("/getSimpleStati", jangsu.getSimpleStati);
  router.get("/getRegionStati", jangsu.getRegionStati);
  router.get("/getSigunguStati", jangsu.getSigunguStati);
  router.get("/getSurveyedList", jangsu.getSurveyedList);
  router.get("/exportSigunguXlsx", jangsu.exportSigunguXlsx);
  router.post("/clearSurveyData", jangsu.clearSurveyData);
  router.post("/clearSurveyDataBatch", jangsu.clearSurveyDataBatch);

  // 공유재산 매크로 (등기부·공유재산·토지대장 → 분석완료.xlsx)
  const macroStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
      const dir = path.resolve(__dirname, '../..', 'uploads/macro');
      try {
        if (!fs.existsSync(dir)) await fs.promises.mkdir(dir, { recursive: true });
      } catch (err) {
        console.error('매크로 업로드 폴더 생성 오류:', err);
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const safe = String(file.originalname || 'file').replace(/[\\/:*?"<>|]/g, '_');
      cb(null, `${Date.now()}_${safe}`);
    },
  });
  const macroUpload = multer({
    storage: macroStorage,
    limits: { fileSize: 50 * 1024 * 1024, fieldSize: 25 * 1024 * 1024 },
  });
  router.post(
    '/macro/analyze',
    macroUpload.fields([
      { name: 'deunggi', maxCount: 1 },
      { name: 'gongyu', maxCount: 1 },
      { name: 'toji', maxCount: 1 },
      { name: 'geonchuk', maxCount: 1 },
    ]),
    jangsu.macroAnalyze
  );

  router.post(
    '/macro/analyze-batch',
    macroUpload.array('files', 300),
    jangsu.macroAnalyzeBatch
  );

  app.use('/v1/jangsu', router);
};
