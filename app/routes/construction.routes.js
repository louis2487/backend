module.exports = app => {
  const construction = require("../controllers/construction.controller.js");

  var router = require("express").Router();
  const multer = require('multer')
  const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads')
    },
    filename: (req, file, cb) => {
      // cb(null, Date.now() + "--" + file.originalname);
      cb(null, file.originalname);
    },
  });
  const upload = multer({ storage: fileStorageEngine, limits: { fieldSize: 25 * 1024 * 1024 } });

  router.get("/getAll", construction.getAll);

  router.post("/addPost",upload.none(), construction.addPost);
  

  app.use('/v1/construction', router);
};
