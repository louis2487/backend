const Construction = require("../models/construction.model.js");
const logger = require('../config/winston');


// Find a single User by Id
exports.getAll = (req, res) => {
  Construction.getAll(req, (err, data) => {
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

// 동산 보드 등록
exports.addPost = (req, res) => {
  Construction.addPost(req, (err, data) => {
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
