const Garlic = require('../models/garlic.model.js');
const logger = require('../config/winston');

function send(res, err, data) {
  if (err) {
    logger.error(err);
    res.status(500).send({ msg: err.message || String(err) });
    return;
  }
  res.send(data);
}

exports.getBoundsList = async (req, res) => {
  try {
    const data = await Garlic.getBoundsList(req);
    res.send(data);
  } catch (err) {
    send(res, err);
  }
};

exports.listParcels = async (req, res) => {
  try {
    const data = await Garlic.listParcels(req);
    res.send(data);
  } catch (err) {
    send(res, err);
  }
};

exports.getParcelDetail = async (req, res) => {
  try {
    const data = await Garlic.getParcelDetail(req);
    res.send(data);
  } catch (err) {
    send(res, err);
  }
};

exports.listInterviews = async (req, res) => {
  try {
    const data = await Garlic.listInterviews(req);
    res.send(data);
  } catch (err) {
    send(res, err);
  }
};

exports.getInterview = async (req, res) => {
  try {
    const data = await Garlic.getInterview(req);
    res.send(data);
  } catch (err) {
    send(res, err);
  }
};

exports.updateInterview = (req, res) => {
  Garlic.updateInterview(req, (err, data) => send(res, err, data));
};

exports.getParcelSurvey = async (req, res) => {
  try {
    const data = await Garlic.getParcelSurvey(req);
    res.send(data);
  } catch (err) {
    send(res, err);
  }
};

exports.updateParcelSurvey = (req, res) => {
  Garlic.updateParcelSurvey(req, (err, data) => send(res, err, data));
};

exports.getParcelImg = (req, res) => {
  Garlic.getParcelImg(req, (err, data) => send(res, err, data));
};

exports.uploadParcelImg = (req, res) => {
  Garlic.uploadParcelImg(req, (err, data) => send(res, err, data));
};

exports.deleteParcelImg = (req, res) => {
  Garlic.deleteParcelImg(req, (err, data) => send(res, err, data));
};
