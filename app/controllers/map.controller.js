const Map = require("../models/map.model.js");
const logger = require('../config/winston');


// Find a single User by Id
exports.ladfrlService = (req, res) => {
  Map.ladfrlService(req.body, (err, data) => {
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
exports.roadCenterLine = (req, res) => {
  Map.roadCenterLine(req.body, (err, data) => {
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
exports.buildingTotalLine = (req, res) => {
  Map.buildingTotalLine(req.body, (err, data) => {
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
exports.insertNewBldExitMk = (req, res) => {
  Map.insertNewBldExitMk(req, (err, data) => {
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
exports.getBldDoorInfo = (req, res) => {
  Map.getBldDoorInfo(req, (err, data) => {
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
exports.getBldDoorList = (req, res) => {
  Map.getBldDoorList(req, (err, data) => {
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
exports.getAppInfo = (req, res) => {
  Map.getAppInfo(req, (err, data) => {
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
exports.saveDoorPositin = (req, res) => {
  Map.saveDoorPositin(req, (err, data) => {
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
exports.saveDoorExitLine = (req, res) => {
  Map.saveDoorExitLine(req, (err, data) => {
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
exports.buildingLine = (req, res) => {
  Map.buildingLine(req.body, (err, data) => {
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
exports.getBuildingInfo = (req, res) => {
  Map.getBuildingInfo(req, (err, data) => {
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
  Map.mkpdf(req, (err, data) => {
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
exports.mkpdf2 = (req, res) => {
  Map.mkpdf2(req, (err, data) => {
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
