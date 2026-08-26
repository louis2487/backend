module.exports = app => {
  const fileController = require("../controllers/file.controller.js");
  const multer = require('multer')
  const nodeHtmlToImage = require('node-html-to-image');
  const fs = require('fs')

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

  // router.post("/upload", fileController.upload);
  router.post('/upload', upload.single('file'), fileController.upload)
  // router.post('/mkSticker', upload.single('file'), fileController.upload)
  router.post('/mkSticker', upload.none(), fileController.mkSticker)

  // const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])
  router.post('/uploadPaint', upload.none(), fileController.uploadPaint)
  router.post('/uploadBldImg', upload.none(), fileController.uploadBldImg)
  router.post('/delete', upload.none(), fileController.delete)
  router.post('/change', upload.none(), fileController.change)

  router.post('/mkpdf', upload.none(), fileController.mkpdf)
  router.post('/downpdf', upload.none(), fileController.downpdf)

  // router.post('/uploadPaint', upload.none(), function (req, res, next) {

  //   // router.post('/uploadPaint', (req, res, next) => {
  //   // console.log(req.body.image)
  //   // console.log(req.uuid)

  //   // var obj = JSON.parse(req.body)
  //   // console.log(obj.name)
  //   var name = req.body.name;
  //   console.log(name)
  //   var img = req.body.image;
  //   var base64Data = img.replace(/^data:image\/png;base64,/, "");

  //   require("fs").writeFile("out.png", base64Data, 'base64', function (err) {
  //     console.log(err);
  //   });


  //   // fs.writeFileSync(name, img, "base64");

  //   // var realFile = Buffer.from(img,"base64");
  //   // // const base64 = fs.readFileSync("path-to-image.jpg", "base64");
  //   // let buff = new Buffer(img, 'base64');
  //   // fs.writeFileSync('stack-abuse-logo-out.png', buff);


  //   //   fs.writeFile(name, realFile, function(err) {
  //   //       if(err)
  //   //          console.log(err);
  //   //    });
  //   //    res.send("OK");
  //   // //  });
  //   //   var myBuffer = new Buffer(img.length);
  //   //   for (var i = 0; i < img.length; i++) {
  //   //       myBuffer[i] = img[i];
  //   //   }
  //   //   fs.writeFile(__dirname+"/212312312312312_"+ name, myBuffer, function(err) {
  //   //       if(err) {
  //   //           console.log(err);
  //   //       } else {
  //   //           console.log("The file was saved!");
  //   //       }
  //   //   });
  //   // console.log("asdFASDFASDFAS???")
  //   // console.log(req.image)
  //   // console.log(req.file)
  //   // console.log(req.files)
  //   // res.status(200).send({
  //   //   message: "Ok",
  //   //   fileInfo: req.file
  //   // })
  // });
  // router.post('/upload', upload.single('file'), (req, res, next) => {
  //   console.log("asdFASDFASDFAS???")
  //   console.log(req.image)
  //   console.log(req.file)
  //   console.log(req.files)
  //   res.status(200).send({
  //     message: "Ok",
  //     fileInfo: req.file
  //   })
  // });

  // router.get("/checkId", user.checkId);


  // router.post("/register", user.register);
  // router.post('/login', function (req, res) {
  //   user.login
  // });
  // router.post("/login",(req,res)=>user.login(res,req));


  // // Create a new Tutorial
  // router.post("/", user.create);

  // // Retrieve all Tutorials
  // router.get("/", user.findAll);

  // // Retrieve all published Tutorials
  // router.get("/published", user.findAllPublished);

  // // Retrieve a single Tutorial with id
  // router.get("/:id", user.findOne);

  // // Update a Tutorial with id
  // router.put("/:id", user.update);

  // // Delete a Tutorial with id
  // router.delete("/:id", user.delete);

  // // Delete all Tutorials
  // router.delete("/", user.deleteAll);

  app.use('/v1/file', router);
};
