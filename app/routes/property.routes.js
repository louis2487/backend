module.exports = app => {
  const property = require("../controllers/property.controller.js");
  const multer = require('multer')

  var router = require("express").Router();
  const fs = require('fs');

  const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads')
    },
    filename: (req, file, cb) => {
      // cb(null, file.filename);
      cb(null, req.body.fname);
    }
  });

  const upload = multer({ storage: fileStorageEngine, limits: { fieldSize: 25 * 1024 * 1024 } });


  router.get("/getAll", property.getAll);
  router.get("/getSelectData", property.getSelectData);
  router.post("/saveJeonggye", property.saveJeonggye);
  router.post('/updateScreenCaptrue', upload.single('file'), property.updateScreenCaptrue)
  router.post('/updateScreenCaptrueMap', upload.none(), property.updateScreenCaptrueMap)
  router.post('/deleteScreenCaptureImage', upload.none(), property.deleteScreenCaptureImage)
  router.post('/mkOutputExelFile', upload.none(), property.mkOutputExelFile)
  // router.post('/getAllDetail', upload.none(), property.getAllDetail)
  router.get("/getAllDetail", property.getAllDetail);
  router.get("/getTotalJoinList", property.getTotalJoinList);
  router.get("/renameFile", property.renameFile);
  router.get("/mvWorkImageFile", property.mvWorkImageFile);
  router.get("/getExelFile", property.getExelFile);
  // 합본(한글/엑셀): 키가 많아 GET 쿼리 길이 제한에 잘리므로 POST body 사용
  router.post("/getExelFile", property.getExelFile);


  // router.get('/getExelFile',
  //   async (req, res) => {
  //     try {
  //       var exelName = req.query.exelName;
  //       const fileName = exelName + '.xlsx'
  //       const fileURL = './uploads/assets/' + exelName + '.xlsx'
  //       // const fileName = '4574033521100150001.xlsx'
  //       // const fileURL = './uploads/assets/4574033521100150001.xlsx'
  //       console.log(fileURL)
  //       const stream = fs.createReadStream(fileURL);
  //       res.set({
  //         'Content-Disposition': `attachment; filename='${fileName}'`,
  //         'Content-Type': 'application/pdf',
  //       });
  //       stream.pipe(res);
  //     } catch (e) {
  //       console.error(e)
  //       res.status(500).end();
  //     }
  //   });
  // router.get('/getExelFile',
  //   async (req, res) => {
  //     try {
  //       console.log(req.query)
  //       var exelName = req.query.fpop_key;
  //       const fileName = exelName + '.xlsx'
  //       const fileURL = './uploads/assets/' + exelName + '.xlsx'
  //       // // const fileName = '4574033521100150001.xlsx'
  //       // // const fileURL = './uploads/assets/4574033521100150001.xlsx'
  //       // console.log(fileURL)
  //       // const stream = fs.createReadStream(fileURL);
  //       // res.set({
  //       //   'Content-Disposition': `attachment; filename='${fileName}'`,
  //       //   'Content-Type': 'application/pdf',
  //       // });
  //       // stream.pipe(res);

  //       const filePath = './uploads/assets/' + exelName + '.xlsx'

  //       // const filePath = path.join(process.cwd(), 'files', 'report.xlsx'); // 파일이 존재해야 함
  //       if (!fs.existsSync(filePath)) return res.status(404).send('Not found');

  //       res.setHeader(
  //         'Content-Type',
  //         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  //       );
  //       res.setHeader('Content-Disposition', 'attachment; filename="report.xlsx"');

  //       fs.createReadStream(filePath).pipe(res);
  //       // 또는: res.download(filePath, 'report.xlsx');  // 자동 헤더 세팅

  //     } catch (e) {
  //       console.error(e)
  //       res.status(500).end();
  //     }
  //   });

  app.use('/v1/property', router);
};



