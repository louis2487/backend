module.exports = app => {
  const map = require("../controllers/map.controller.js");
  const multer = require('multer')

  var router = require("express").Router();

  var router = require("express").Router();
  const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads')
    },
    filename: (req, file, cb) => {
      // cb(null, Date.now() + "--" + file.originalname);
      cb(null, file.originalname);
    }
  });

  const upload = multer({ storage: fileStorageEngine, limits: { fieldSize: 25 * 1024 * 1024 } });


  
  router.post("/ladfrlService", map.ladfrlService);
  router.post("/roadCenterLine", map.roadCenterLine);
  router.post("/buildingLine", map.buildingLine);
  router.get("/buildingTotalLine", map.buildingTotalLine);
  router.post("/insertNewBldExitMk", map.insertNewBldExitMk);
  router.get("/getBldDoorInfo", map.getBldDoorInfo);
  router.get("/getBldDoorList", map.getBldDoorList);
  router.get("/getAppInfo", map.getAppInfo);

  router.post("/saveDoorPositin", map.saveDoorPositin);
  router.post("/saveDoorExitLine", map.saveDoorExitLine);

  router.get("/getBuildingInfo", map.getBuildingInfo);
  router.post('/mkpdf2', map.mkpdf2)
  router.post('/mkpdf', upload.none(), map.mkpdf)

  app.use('/v1/map', router);
};
