const FileModel = require("../models/file.model.js");
const logger = require('../config/winston');

// const multer = require('multer')
// // const ErrorMessages = require('../constants/ErrorMessages')

// function makeid (length) {
//   var result = ''
//   var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
//   var charactersLength = characters.length
//   for (var i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength))
//   }
//   return result
// }

// const DIR = './uploads/'
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, DIR)
//   },
//   filename: (req, file, cb) => {
//     const fileName = file.originalname.toLowerCase().split(' ').join('-')
//     console.log(file.originalname+"file.originalnamefile.originalnamefile.originalname")
//     cb(null, makeid(16) + '_' + fileName)
//   }
// })
// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
//       cb(null, true)
//     } else {
//       cb(null, false)
//       return cb(new Error('Only .png, .jpg, .mp4 and .jpeg format allowed!'))
//     }
//   }
// })
// exports.wrireSingleFile = (req, res, next) => {
//   console.log(req.image)
//   return upload.single('file')(req, res, () => {
//     // Remember, the middleware will call it's next function
//     // so we can inject our controller manually as the next()

//     if (!req.file) return res.json({ error: "ErrorMessages.invalidFiletype" })
//     next()
//   })
// }


// Find a single User by Id
exports.upload = (req, res) => {
  FileModel.upload(req, (err, data) => {
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
// Find a single User by Id
exports.uploadPaint = (req, res) => {
  FileModel.uploadPaint(req, (err, data) => {
    if (err) {
      logger.error(err)
      res.status(500).send({
        msg: err.message
      });
    } else {
      res.send(data);
    }
    // if (err) {
    //   res.status(500).send({
    //     msg: "Error retrieving uploadPaint  "
    //   });
    // } else res.send(data);
  });
};
exports.uploadBldImg = (req, res) => {
  FileModel.uploadBldImg(req, (err, data) => {
    if (err) {
      logger.error(err)
      res.status(500).send({
        msg: err.message
      });
    } else {
      res.send(data);
    }
    // if (err) {
    //   res.status(500).send({
    //     msg: "Error retrieving uploadPaint  "
    //   });
    // } else res.send(data);
  });
};
exports.mkSticker = (req, res) => {
  FileModel.mkSticker(req, (err, data) => {
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
exports.delete = (req, res) => {
  FileModel.delete(req, (err, data) => {
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
exports.change = (req, res) => {
  FileModel.change(req, (err, data) => {
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
exports.mkpdf = (req, res) => {
  FileModel.mkpdf(req, (err, data) => {
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
exports.downpdf = (req, res) => {
  FileModel.downpdf(req, (err, data) => {
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
