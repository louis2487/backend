const sql = require("./db.js");
const run = require('./runQuery');
const crypto = require('../config/crypto');
const nodemailer = require('nodemailer');

const logger = require('../config/winston');

// var client = require('../config/elastic.config.js');

// constructor
const User = function (user) {
  this.uuid = user.uuid;
  this.userName = user.userName;
  this.userId = user.userId;
  this.userPw = user.userPw;
  this.deviceKey = user.deviceKey;

};

let res = {
  code: 0,
  msg: '',
  // result: null
}

User.login = async (body, result) => {
  try {
    var id = body.userId;
    var pw = body.userPw;
    const sql = `SELECT * FROM tb_user WHERE userId = ? and userPw = ?`;
    const param = [id, pw];
    const resObj = await run("login", sql, param);
    // console.log(sql)
    if (resObj.length > 0) {
      res.code = 1;
      res.msg = 'ok';
      res.result = resObj[0].userUuid;
      result(null, res);
      return;
    } else if (resObj.length == 0) {
      res.code = 0;
      res.msg = 'ok';
      res.result = '';
      result(null, res);
      return;
    }
  } catch (err) {
    logger.error(err)
    console.error('userTable/select Error!!', err);
    res.code = 2;
    res.msg = 'user_login Error';
    res.result = '';
    console.log("error: ", err);
    result(err, null);
    return;
  }
};

User.pinLogin = async (body, result) => {
  try {
    console.log(body)
    var pinNum = body.pinNum;
    var deviceId = body.deviceId;
    const sql3 = `SELECT * FROM tb_user WHERE deviceKey = ?`;
    const param3 = [deviceId];
    const resObj = await run("pinLogin", sql3, param3);
    if (resObj.length == 0) {
      res.code = 0;
      res.msg = 'ok';
      res.result = '';
      result(null, res);
      return;
    }
    const verified3 = await crypto.verifyPassword(
      pinNum,
      resObj[0].pinSalt,
      resObj[0].userPinNum
    );
    console.log("verified3")
    console.log(verified3)
    console.log("verified3")
    if (!verified3) {
      res.code = 0;
      res.msg = 'ok';
      res.result = '';
      result(null, res);
      return;
    } else {
      res.code = 1;
      res.msg = 'ok';
      res.result = resObj[0].userUuid;
      result(null, res);
      return;
    }
    // const sql = `SELECT * FROM tb_user WHERE userPinNum = ? and deviceKey = ?`;
    // const param = [pN, deviceId];
    // const resObj = await run(sql, param);
    // // console.log(sql)
    // if (resObj.length > 0) {
    //   res.code = 1;
    //   res.msg = 'ok';
    //   res.result = resObj[0].userUuid;
    //   result(null, res);
    //   return;
    // } else if (resObj.length == 0) {
    //   res.code = 0;
    //   res.msg = 'ok';
    //   res.result = '';
    //   result(null, res);
    //   return;
    // }
  } catch (err) {
    logger.error(err)
    console.error('userTable/select Error!!', err);
    res.code = 2;
    res.msg = 'user_login Error';
    res.result = '';
    console.log("error: ", err);
    result(err, null);
    return;
  }
};

User.checkId = async (req, result) => {
  try {
    // console.log(req.query)
    const sql = `SELECT count(*) as cnt FROM tb_user WHERE userId = ?`;
    const param = [req.query.userId];
    const resObj = await run("checkId", sql, param);
    // console.log(sql)
    var cnt = resObj[0].cnt;
    console.log("같은아이디")
    console.log(cnt)

    if (cnt > 0) {
      res.code = 0;
      res.msg = 'User.checkId- 아이디 체크 중복되는 아이디 있음';
      result(null, res);
    } else if (cnt == 0) {
      res.code = 1;
      res.msg = 'User.checkId - 중복되는 아이디 없음';
      result(null, res);
    }
  } catch (error) {
    logger.error(error)
    console.error('userTable/select checkId Error!!', err);
    res.msg = 'user_checkId Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};

User.checkId2 = async (req, result) => {
  try {
    console.log(req.query)
    const sql = `SELECT count(*) as cnt FROM tb_user WHERE deviceKey = ?`;
    const param = [req.query.token];
    const resObj = await run("checkId2", sql, param);
    // console.log(sql)
    var cnt = resObj[0].cnt;
    console.log("같은아이디")
    console.log(cnt)

    if (cnt > 0) {
      res.code = 0;
      res.msg = 'User.checkId- 아이디 체크 중복되는 아이디 있음';
      result(null, res);
    } else if (cnt == 0) {
      res.code = 1;
      res.msg = 'User.checkId - 중복되는 아이디 없음';
      result(null, res);
    }
  } catch (error) {
    logger.error(error)
    console.error('userTable/select checkId Error!!', err);
    res.msg = 'user_checkId Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};

User.register = async (body, result) => {
  try {
    console.log(body)
    const sql = "INSERT INTO tb_user (userUuid, userId, userPw,passwordSalt, userName, deviceKey, deviceInfo,userPinNum, pinSalt ) VALUES (?,?,?,?,?,?,?,?,?)";
    // console.log(typeof (body.userDevice))


    // var userPw = crypto.cipher(body.userPw);
    // var userPinNum = crypto.cipher(body.userPinNum);
    // var userPw = createHashedPassword(body.userPw);
    // var userPinNum = createHashedPassword(body.userPinNum);
    const { hashedPinNum, pinSalt } = await crypto.createHashedPinNum(body.userPinNum);
    const { hashedPassword, salt } = await crypto.createHashedPassword("body.userPw");
    const param = [body.userUuid, body.userId, hashedPassword, salt, body.userName, body.deviceKey, body.deviceInfo, hashedPinNum, pinSalt];

    const resObj = await run("register", sql, param);
    // console.log(sql)
    // console.log(resObj)
    // console.log(resObj.insertId)
    if (resObj.insertId) {
      res.code = 1;
      res.msg = 'User.register - 가입';
      result(null, res);
    } else {
      res.code = 0;
      res.msg = 'User.checkId - 가입안됨';
      result(null, res);
    }
  } catch (err) {
    logger.error(err)
    console.error('userTable/register Error!!', err);
    res.msg = 'user_register Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};
User.forget = async (body, result) => {
  try {
    // console.log(body)

    var variable = "0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z".split(",");
    var randomPassword = createRandomPassword(variable, 8);

    //비밀번호 랜덤 함수
    function createRandomPassword(variable, passwordLength) {
      var randomString = "";
      for (var j = 0; j < passwordLength; j++)
        randomString += variable[Math.floor(Math.random() * variable.length)];
      return randomString
    }
    const sql = `SELECT * FROM tb_user WHERE userName = ? AND userId = ?`;
    // var psword = body.userPw;
    const param = [body.userName, body.userId];
    const resObj = await run("forget", sql, param);
    if (resObj.length > 0) {
      var transporter = nodemailer.createTransport({
        service: 'gmail',   // 메일 보내는 곳
        prot: 587,
        host: 'smtp.gmlail.com',
        secure: false,
        requireTLS: true,
        auth: {
          user: "bhiz8989@gmail.com",  // 보내는 메일의 주소
          pass: "qoguddlf2@ek!"   // 보내는 메일의 비밀번호
        }
      });
      // 메일 옵션
      var mailOptions = {
        from: "bhiz8989@gmail.com", // 보내는 메일의 주소
        to: "bhiz89@naver.com", // 수신할 이메일
        subject: "도시와농촌에서 임시비밀번호를 알려드립니다", // 메일 제목
        text: randomPassword // 메일 내용
      };

      // 메일 발송    
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      res.code = 1;
      res.msg = 'ok';
      res.result = '';
      result(null, res);
      return;
    } else {
      res.code = 0;
      res.msg = 'no';
      res.result = '';
      result(null, res);
      return;
    }

  } catch (err) {
    logger.error(err)
    console.error('userTable/register Error!!', err);
    res.code = 0;
    res.msg = 'user_register Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};



User.columnData = async (req, result) => {
  try {
    var sql = `SELECT * FROM tb_form_info WHERE userUuid = ?`;
    var param = [req.userUuid];
    var resObj = await run("columnData", sql, param);
    if (resObj.length > 0) {
      res.code = 1;
      res.msg = 'ok';
      res.result = JSON.stringify(resObj[0]);
      result(null, res);
      return;
    } else {
      param = ['rootAdmin'];
      resObj = await run("columnData", sql, param);
      res.code = 1;
      res.msg = 'ok';
      res.result = JSON.stringify(resObj[0]);
      result(null, res);
      return;
    }
  } catch (error) {
    logger.error(error)
    console.error('userTable/select columnData Error!!', err);
    res.code = 0;
    res.msg = 'no';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};
User.locationRing = async (req, result) => {
  try {
    var lat = req.body.lat;
    var lng = req.body.lng;
    var sql = "SELECT * , ";
    sql += `(6371 * acos(cos(radians(?)) * cos(radians(y)) * cos(radians(x) - radians(?)) + sin(radians(?)) * sin(radians(y)))) `
    sql += "AS distance FROM tb_geocode_sejong HAVING distance <= 1 ORDER BY distance LIMIT 0, 1;";
    // sql += "AS distance FROM tb_sejong_geocode HAVING distance <= 1 ORDER BY distance LIMIT 0, 1;";
    var param = [lat, lng, lat];
    var resObj = await run("locationRing", sql, param);
    if (resObj.length > 0) {
      res.code = 1;
      res.msg = 'ok';
      res.result = JSON.stringify(resObj);
      result(null, res);
      return;
    } else {
      res.code = 1;
      res.msg = 'ok';
      res.result = [];
      result(null, res);
      return;
    }
  } catch (error) {
    logger.error(error)
    console.error('lat lng /select locationRing Error!!', error);
    res.code = 0;
    res.msg = 'no';
    res.result = error.message;
    console.log("error: ", error);
    result(error, null);
    return;
  }
};

// Tutorial.create = (newTutorial, result) => {
//   sql.query("INSERT INTO tutorials SET ?", newTutorial, (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(err, null);
//       return;
//     }

//     console.log("created tutorial: ", { id: res.insertId, ...newTutorial });
//     result(null, { id: res.insertId, ...newTutorial });
//   });
// };

// Tutorial.findById = (id, result) => {
//   sql.query(`SELECT * FROM tutorials WHERE id = ${id}`, (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(err, null);
//       return;
//     }

//     if (res.length) {
//       console.log("found tutorial: ", res[0]);
//       result(null, res[0]);
//       return;
//     }

//     // not found Tutorial with the id
//     result({ kind: "not_found" }, null);
//   });
// };

// Tutorial.getAll = (title, result) => {
//   let query = "SELECT * FROM tutorials";

//   if (title) {
//     query += ` WHERE title LIKE '%${title}%'`;
//   }

//   sql.query(query, (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     console.log("tutorials: ", res);
//     result(null, res);
//   });
// };

// Tutorial.getAllPublished = result => {
//   sql.query("SELECT * FROM tutorials WHERE published=true", (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     console.log("tutorials: ", res);
//     result(null, res);
//   });
// };

// Tutorial.updateById = (id, tutorial, result) => {
//   sql.query(
//     "UPDATE tutorials SET title = ?, description = ?, published = ? WHERE id = ?",
//     [tutorial.title, tutorial.description, tutorial.published, id],
//     (err, res) => {
//       if (err) {
//         console.log("error: ", err);
//         result(null, err);
//         return;
//       }

//       if (res.affectedRows == 0) {
//         // not found Tutorial with the id
//         result({ kind: "not_found" }, null);
//         return;
//       }

//       console.log("updated tutorial: ", { id: id, ...tutorial });
//       result(null, { id: id, ...tutorial });
//     }
//   );
// };

// Tutorial.remove = (id, result) => {
//   sql.query("DELETE FROM tutorials WHERE id = ?", id, (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     if (res.affectedRows == 0) {
//       // not found Tutorial with the id
//       result({ kind: "not_found" }, null);
//       return;
//     }

//     console.log("deleted tutorial with id: ", id);
//     result(null, res);
//   });
// };

// Tutorial.removeAll = result => {
//   sql.query("DELETE FROM tutorials", (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     console.log(`deleted ${res.affectedRows} tutorials`);
//     result(null, res);
//   });
// };

module.exports = User;
