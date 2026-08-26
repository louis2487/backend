const jangsu = require("../controllers/jangsu.controller.js");

module.exports = app => {
  const router = require("express").Router();

  router.get("/getBoundsList", jangsu.getBoundsList);

  app.use('/v1/property_crops', router);
};
