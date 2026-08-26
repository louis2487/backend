const sql = require("./db.js");
const run = require('./runQuery');
const logger = require('../config/winston');

// constructor
const Construction = function (user) {
  this.uuid = user.uuid;
  this.userName = user.userName;
  this.userId = user.userId;
  this.userPw = user.userPw;
  this.deviceKey = user.deviceKey;

};

let res = {
  code: 0,
  msg: '',
  result: null
}

Construction.getAll = async (body, result) => {
  try {
    const sql = `SELECT * FROM tb_construction_list`;
    const resObj = await run("getAll", sql);
    if (resObj.length > 0) {
      res.code = 1;
      res.msg = 'ok';
      res.result = resObj;
      result(null, res);
      return;
    } else if (resObj.length == 0) {
      res.code = 0;
      res.msg = 'ok';
      res.result = [];
      result(null, res);
      return;
    }
  } catch (err) {
    logger.error(err)
    console.error('userTable/select Error!!', err);
    res.msg = 'user_login Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};

Construction.addPost = async (req, result) => {
  try {
    // console.log("body.body");
    // console.log("body.body");
    // console.log(req);
    // console.log("body.body");

    const sql = `
    INSERT INTO tb_boarder_list (cUuid, cName, cType, cContent,cDate, cLocation, userUuid
      ) VALUES (?, ?, ?, ?, ?, ?, ? ) 
      `;
    // ON DUPLICATE KEY 
    // UPDATE cUuid = ?, cName= ?, cType= ?, cContent= ?, cDate= ?, cLocation= ?, userUuid= ?;
    var cName = req.body.workName;
    var cType = req.body.workType;
    var cContent = req.body.workCont;
    var cDate = req.body.workDate;
    var cLocation = req.body.location;
    var cUuid = req.body.contUuid;
    var userUuid = req.body.userUuid;
    var param = [cUuid, cName, cType, cContent, cDate, cLocation, userUuid, cUuid, cName, cType, cContent, cDate, cLocation, userUuid];
    const resObj = await run("getAll", sql, param);
    // console.log(resObj);
    res.code = 1;
    res.msg = 'ok';
    res.result = resObj;    // return;
    result(null, res);
    return;
    // if (resObj.length > 0) {
    //   res.code = 1;
    //   res.msg = 'ok';
    //   res.result = resObj;
    //   result(null, res);
    //   return;
    // } else if (resObj.length == 0) {
    //   res.code = 0;
    //   res.msg = 'no';
    //   res.result = [];
    //   result(null, res);
    //   return;
    // }
  } catch (err) {
    logger.error(err)
    console.error('userTable/select Error!!', err);
    res.code = 0;
    res.msg = 'user_login Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};

module.exports = Construction;
