module.exports = app => {
  const user = require("../controllers/user.controller.js");

  var router = require("express").Router();

  router.post("/login", user.login);

  router.post("/pinLogin", user.pinLogin);

  router.get("/checkId", user.checkId);
  
  router.get("/checkId2", user.checkId2);


  router.post("/register", user.register);


  router.post("/forget", user.forget);


  router.post("/columnData", user.columnData);

  router.post("/locationRing", user.locationRing);
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

  app.use('/v1/user', router);
};
