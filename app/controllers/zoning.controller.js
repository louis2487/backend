const Zoning = require('../models/zoning.model.js');
const logger = require('../config/winston');
const vworld = require('./zoning.vworld.js');

exports.proxyWms = vworld.proxyWms;
exports.proxyCadastral = vworld.proxyCadastral;

function send(res, err, data) {
  if (err) {
    logger.error(err);
    res.status(500).send({ msg: err.message || String(err) });
    return;
  }
  res.send(data);
}

exports.listTargets = (req, res) => {
  Zoning.listTargets((err, data) => send(res, err, data));
};

exports.listFeatures = (req, res) => {
  Zoning.listFeatures(req.params.id, (err, data) => send(res, err, data));
};

exports.listParcels = (req, res) => {
  Zoning.listParcels(req.params.id, (err, data) => send(res, err, data));
};

exports.getGosi = (req, res) => {
  const type = req.query.type || 'text';
  Zoning.getGosi(req.params.id, type, (err, data) => send(res, err, data));
};

exports.getLayers = (req, res) => {
  Zoning.getLayers((err, data) => send(res, err, data));
};

exports.getResult = (req, res) => {
  Zoning.getResult(req.params.id, (err, data) => send(res, err, data));
};

exports.saveResult = (req, res) => {
  Zoning.saveResult(req.params.id, req.body || {}, (err, data) => send(res, err, data));
};

exports.listMarkers = (req, res) => {
  Zoning.listMarkers(req.params.id, (err, data) => send(res, err, data));
};

exports.addMarker = (req, res) => {
  Zoning.addMarker(req.params.id, req.body || {}, (err, data) => send(res, err, data));
};

exports.deleteMarker = (req, res) => {
  Zoning.deleteMarker(req.params.id, (err, data) => send(res, err, data));
};

exports.login = (req, res) => {
  Zoning.login(req.body || {}, (err, data) => send(res, err, data));
};

exports.listPackages = (req, res) => {
  Zoning.listPackages(req.query.role, (err, data) => send(res, err, data));
};

exports.updatePackage = (req, res) => {
  Zoning.updatePackage(req.params.id, req.body || {}, (err, data) => send(res, err, data));
};
