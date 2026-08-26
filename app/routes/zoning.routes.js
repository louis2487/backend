module.exports = (app) => {
  const zoning = require('../controllers/zoning.controller.js');
  const router = require('express').Router();

  router.get('/targets', zoning.listTargets);
  router.get('/targets/:id/features', zoning.listFeatures);
  router.get('/features/:id/parcels', zoning.listParcels);
  router.get('/features/:id/gosi', zoning.getGosi);
  router.get('/layers', zoning.getLayers);

  router.get('/features/:id/result', zoning.getResult);
  router.post('/features/:id/result', zoning.saveResult);

  router.get('/features/:id/markers', zoning.listMarkers);
  router.post('/features/:id/markers', zoning.addMarker);
  router.delete('/markers/:id', zoning.deleteMarker);

  router.post('/auth/login', zoning.login);
  router.get('/packages', zoning.listPackages);
  router.post('/packages/:id', zoning.updatePackage);

  router.get('/vworld/wms', zoning.proxyWms);
  router.get('/vworld/cadastral', zoning.proxyCadastral);

  app.use('/v1/zoning', router);
};
