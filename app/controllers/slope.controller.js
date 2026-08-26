const Slope = require("../models/slope.model.js");
const logger = require('../config/winston');


// Find a single User by Id
exports.saveScore = (req, res) => {
  Slope.saveScore(req.body, (err, data) => {
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
exports.getSlopeRailwayInfo = (req, res) => {
  Slope.getSlopeRailwayInfo(req, (err, data) => {
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
exports.getJangsuDetailDataLoad = (req, res) => {
  Slope.getJangsuDetailDataLoad(req, (err, data) => {
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
exports.updateJangsuImg = (req, res) => {
  Slope.updateJangsuImg(req, (err, data) => {
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
exports.updateJangsuInfoData = (req, res) => {
  Slope.updateJangsuInfoData(req, (err, data) => {
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
exports.getJangsuImgData = (req, res) => {
  Slope.getJangsuImgData(req, (err, data) => {
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
exports.deleteJangsuImg = (req, res) => {
  Slope.deleteJangsuImg(req, (err, data) => {
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

exports.uploadGalleryJangsuImg = (req, res) => {
  Slope.uploadGalleryJangsuImg(req, (err, data) => {
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
exports.uploadCameraJangsuImg = (req, res) => {
  Slope.uploadCameraJangsuImg(req, (err, data) => {
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
