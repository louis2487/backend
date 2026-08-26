const sql = require("./db.js");
const run = require('./runQuery');
const crypto = require('../config/crypto');
const nodemailer = require('nodemailer');
const fs = require('fs');

const logger = require('../config/winston');




var Excel = require('exceljs');

var wb = new Excel.Workbook();
var path = require('path');
const { exportChungjuSurveyPdf } = require('../utils/chungju_survey_pdf');
const {
  exportChungjuSurveyXlsx,
  exportChungjuSurveyXlsxMerged,
} = require('../utils/chungju_survey_xlsx');
const { exportChungjuSurveyDocx } = require('../utils/chungju_survey_docx');
const {
  exportChungjuSurveyHwpx,
  exportChungjuSurveyHwpxMerged,
} = require('../utils/chungju_survey_hwpx');
const { JANGSU_IMG_ORDER_BY } = require('../utils/jangsu_img_order');


// constructor
const Property = function (user) {
  this.uuid = user.uuid;
  this.userName = user.userName;
  this.userId = user.userId;
  this.userPw = user.userPw;
  this.deviceKey = user.deviceKey;
};

let res = {
  // code: 0,
  // msg: '',
  data: []
  // result: null
}


Property.getAll = async (body, result) => {
  try {
    var id = body.userId;
    var pw = body.userPw;
    // const sql = `SELECT * FROM tb_gyebukjeonggyecheon`;
    const sql = `SELECT * FROM tb_gyebukjeonggyecheon_output`;
    const resObj = await run("getAll", sql);
    if (resObj.length > 0) {
      // res.code = 1;
      // res.msg = 'ok';
      res.data = resObj;
      let filtered = resObj;
      // let filtered = resObj.filter((element) => element.idx !== 23);
      result(null, filtered);
      return;
    } else if (resObj.length == 0) {
      res.code = 0;
      res.msg = 'ok';
      res.result = '';
      result(null, resObj);
      return;
    }
  } catch (err) {
    logger.error(err)
    console.error('tb_gyebukjeonggyecheon_output/select Error!!', err);
    res.code = 2;
    res.msg = 'tb_gyebukjeonggyecheon_output Error';
    res.result = '';
    console.log("error: ", err);
    result(err, null);
    return;
  }
};
Property.getAllDetail = async (body, result) => {
  try {
    var id = body.userId;
    var pw = body.userPw;
    // const sql = `SELECT * FROM tb_gyebukjeonggyecheon`;
    const sql = `SELECT * FROM tb_gyebukjeonggyecheon_child`;
    const resObj = await run("getAllDetail", sql);
    if (resObj.length > 0) {
      // res.code = 1;
      // res.msg = 'ok';
      res.data = resObj;
      let filtered = resObj;
      // let filtered = resObj.filter((element) => element.idx !== 23);
      result(null, filtered);
      return;
    } else if (resObj.length == 0) {
      res.code = 0;
      res.msg = 'ok';
      res.result = '';
      result(null, resObj);
      return;
    }
  } catch (err) {
    logger.error(err)
    console.error('tb_gyebukjeonggyecheon_output/select Error!!', err);
    res.code = 2;
    res.msg = 'tb_gyebukjeonggyecheon_output Error';
    res.result = '';
    console.log("error: ", err);
    result(err, null);
    return;
  }
};
Property.getTotalJoinList = async (body, result) => {
  try {
    var sql = 'SELECT ';
    sql += ' a.idx as aIdx,'
    sql += ' a.col_a as aCol_a,'
    sql += ' a.col_b as aCol_b,'
    sql += ' a.col_c as aCol_c,'
    sql += ' a.col_d as aCol_d,'
    sql += ' a.col_e as aCol_e,'
    sql += ' a.col_f as aCol_f,'
    sql += ' a.col_g as aCol_g,'
    sql += ' a.col_h as aCol_h,'
    sql += ' a.col_i as aCol_i,'
    sql += ' a.col_j as aCol_j,'
    sql += ' a.col_k as aCol_k,'
    sql += ' a.col_l as aCol_l,'
    sql += ' a.col_m as aCol_m,'
    sql += ' a.col_n as aCol_n,'
    sql += ' a.col_o as aCol_o,'
    sql += ' a.col_p as aCol_p,'
    sql += ' a.col_q as aCol_q,'
    sql += ' a.col_r as aCol_r,'
    sql += ' a.col_s as aCol_s,'
    sql += ' a.col_t as aCol_t,'
    sql += ' a.col_u as aCol_u,'
    sql += ' a.col_v as aCol_v,'
    sql += ' a.col_w as aCol_w,'
    sql += ' a.col_x as aCol_x,'
    sql += ' a.col_y as aCol_y,'
    sql += ' a.col_z as aCol_z,'
    sql += ' a.col_aa as aCol_aa,'
    sql += ' a.col_ab as aCol_ab,'
    sql += ' a.col_ac as aCol_ac,'
    sql += ' a.col_ad as aCol_ad,'
    sql += ' a.col_ae as aCol_ae,'
    sql += ' a.col_af as aCol_af,'
    sql += ' b.col_a as bCol_a,'
    sql += ' b.col_b as bCol_b,'
    sql += ' b.col_c as bCol_c,'
    sql += ' b.col_d as bCol_d,'
    sql += ' b.col_e as bCol_e,'
    sql += ' b.col_f as bCol_f,'
    sql += ' b.col_g as bCol_g,'
    sql += ' b.col_h as bCol_h,'
    sql += ' b.col_i as bCol_i,'
    sql += ' b.col_j as bCol_j,'
    sql += ' b.col_k as bCol_k,'
    sql += ' b.col_l as bCol_l,'
    sql += ' b.col_m as bCol_m,'
    sql += ' b.col_n as bCol_n,'
    sql += ' b.col_o as bCol_o,'
    sql += ' b.col_p as bCol_p,'
    sql += ' b.col_q as bCol_q,'
    sql += ' b.col_r as bCol_r,'
    sql += ' b.col_s as bCol_s,'
    sql += ' b.col_t as bCol_t,'
    sql += ' b.col_u as bCol_u,'
    sql += ' b.col_v as bCol_v,'
    sql += ' b.col_w as bCol_w,'
    sql += ' b.col_x as bCol_x,'
    sql += ' b.col_y as bCol_y,'
    sql += ' b.col_z as bCol_z,'
    sql += ' b.col_aa as bCol_aa,'
    sql += ' b.col_ab as bCol_ab,'
    sql += ' b.col_ac as bCol_ac,'
    sql += ' b.col_ad as bCol_ad,'
    sql += ' b.col_ae as bCol_ae,'
    sql += ' b.col_af as bCol_af,'
    sql += ' b.col_ag as bCol_ag,'
    sql += ' b.col_ah as bCol_ah'
    sql += ' FROM tb_gyebukjeonggyecheon_output as a inner join tb_gyebukjeonggyecheon_child as b ON a.col_a = b.parents_idx ;'

    const resObj = await run("getTotalJoinList", sql);
    if (resObj.length > 0) {
      res.data = resObj;
      result(null, resObj);
      return;
    } else if (resObj.length == 0) {
      res.code = 0;
      res.msg = 'ok';
      res.result = '';
      result(null, resObj);
      return;
    }
  } catch (err) {
    logger.error(err)
    console.error('tb_gyebukjeonggyecheon_output/select Error!!', err);
    res.code = 2;
    res.msg = 'tb_gyebukjeonggyecheon_output Error';
    res.result = '';
    console.log("error: ", err);
    result(err, null);
    return;
  }
};
Property.getSelectData = async (body, result) => {
  try {

    var idx = body.query.idx;
    const sql = `SELECT * FROM tb_gyebukjeonggyecheon_child where parents_idx = ?`;
    const param = [idx];
    const resObj = await run("getSelectData", sql, param);
    if (resObj.length > 0) {
      // res.code = 1;
      // res.msg = 'ok';
      res.data = resObj;
      let filtered = resObj;
      result(null, filtered);
      return;
    } else if (resObj.length == 0) {
      res.code = 0;
      res.msg = 'ok';
      res.result = '';
      result(null, resObj);
      return;
    }
  } catch (err) {
    logger.error(err)
    console.error('getSelectData/select Error!!', err);
    res.code = 2;
    res.msg = 'getSelectData Error';
    res.result = '';
    console.log("error: ", err);
    result(err, null);
    return;
  }
};


function getCurrentDateTime() {
  var today = new Date();

  var year = today.getFullYear();
  var month = ('0' + (today.getMonth() + 1)).slice(-2);
  var day = ('0' + today.getDate()).slice(-2);

  var dateString = year + '-' + month + '-' + day;
  var hours = ('0' + today.getHours()).slice(-2);
  var minutes = ('0' + today.getMinutes()).slice(-2);
  var seconds = ('0' + today.getSeconds()).slice(-2);

  var timeString = hours + ':' + minutes + ':' + seconds;

  return dateString + " " + timeString;

}
Property.saveJeonggye = async (req, result) => {
  try {


    var obj = req.body;
    console.log(obj);
    var sql = "SELECT * from tb_gyebukjeonggyecheon_child where parents_idx = ?";
    const selectRes = await run("saveJeonggye", sql, obj.pidx);
    console.log("selectRes");
    console.log(selectRes);
    console.log("selectRes");
    if (selectRes.length > 0) {
      sql = `UPDATE tb_gyebukjeonggyecheon_child SET 
      col_a = ?, col_b = ?, col_c = ?, col_d = ?, col_e = ?, col_f = ?, col_g = ?,
      col_h = ?, col_i = ?, col_j = ?, col_k = ?, col_l = ?, col_m = ?, col_n = ?,
      col_o = ?, col_p = ?, col_q = ?, col_r = ?, col_s = ?, col_t = ?, col_u = ?,
      col_v = ?, col_w = ?, col_x = ?, col_y = ?, col_z = ?, col_aa = ?, col_ab = ?,
      col_ac = ?, col_ad = ?
      WHERE parents_idx = ?`;
      // col_ac = ?, col_ad = ?, col_ae = ?, col_af = ?, col_ag = ?, col_ah = ?
    } else if (selectRes.length == 0) {
      sql = `INSERT INTO tb_gyebukjeonggyecheon_child (
        col_a, col_b, col_c, col_d, col_e, col_f, col_g,
        col_h, col_i, col_j, col_k, col_l, col_m, col_n,
        col_o, col_p, col_q, col_r, col_s, col_t, col_u,
        col_v, col_w, col_x, col_y, col_z, col_aa, col_ab, 
        col_ac, col_ad, parents_idx) 
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
      // col_ac, col_ad, col_ae, col_af, col_ag, col_ah, parents_idx) 
    }
    const param = [obj.col_a, obj.col_b, obj.col_c, obj.col_d, obj.col_e, obj.col_f, obj.col_g, obj.col_h, obj.col_i, obj.col_j, obj.col_k, obj.col_l, obj.col_m, obj.col_n, obj.col_o, obj.col_p, obj.col_q, obj.col_r, obj.col_s, obj.col_t, obj.col_u, obj.col_v, obj.col_w, obj.col_x, obj.col_y, obj.col_z,
    // obj.col_aa,
    getCurrentDateTime(),
    obj.col_ab,
    obj.col_ac,
    obj.col_ad,
    // obj.col_ae,
    // obj.col_af,
    // obj.col_ag,
    // obj.col_ah,
    obj.pidx];
    var endFlagSql = "UPDATE tb_gyebukjeonggyecheon_output SET endFlag = 'Y' WHERE col_a = ?";
    var endParam = [obj.pidx]
    const resObj = await run("saveJeonggye", sql, param);
    const resObj2 = await run("saveJeonggye", endFlagSql, endParam);
    if (resObj.length > 0) {
      // res.code = 1;
      // res.msg = 'ok';
      res.data = resObj;
      let filtered = resObj;
      result(null, filtered);
      return;
    } else if (resObj.length == 0) {
      res.code = 0;
      res.msg = 'ok';
      res.result = '';
      result(null, resObj);
      return;
    }
  } catch (err) {
    logger.error(err)
    console.error('tb_gyebukjeonggyecheon/select Error!!', err);
    res.code = 2;
    res.msg = 'tb_gyebukjeonggyecheon Error';
    res.result = '';
    console.log("error: ", err);
    result(err, null);
    return;
  }
};
Property.updateScreenCaptrue = async (req, result) => {
  try {

    var obj = req.body;
    // console.log(obj)
    // console.log(obj.pngBase64)
    console.log(obj.pidx)
    console.log(obj.fname)
    console.log(obj.flag)
    // console.log(obj.body.flag)
    // var base64Data = obj.pngBase64.replace(/^data:image\/png;base64,/, "");
    // return;
    var deleteSql = 'SELECT * from tb_gyebukjeonggyecheon_child where parents_idx = ?'
    var dPram = [obj.pidx];
    var dobj = await run("updateScreenCaptrue", deleteSql, dPram);
    if (dobj.length > 0) {
      try {
        if (dobj[0].col_ae) {
          fs.unlinkSync("./uploads/" + dobj[0].col_ae);
        }
      } catch (error) {

      }
      var sql = 'UPDATE tb_gyebukjeonggyecheon_child SET col_ae = ?  WHERE parents_idx = ?';
      console.log(sql)
      var param = [
        obj.fname,
        obj.pidx];
      const upObj = await run("updateScreenCaptrue", sql, param);
      res.code = 1;
      res.msg = 'ok';
      res.result = upObj;
      result(null, res);
      return;
    } else if (dobj.length == 0) {
      var insertSql = "INSERT INTO tb_gyebukjeonggyecheon_child ( col_ae, parents_idx ) VALUE ( ? , ? )"
      var param = [
        obj.fname,
        obj.pidx];
      const insertObj = await run("updateScreenCaptrue", insertSql, param);
      res.code = 1;
      res.msg = 'ok';
      res.result = insertObj;
      result(null, res);
      return;
    }
  } catch (err) {
    logger.error(err)
    console.error('updateScreenCaptrue Error!!', err);
    res.code = 2;
    res.msg = 'updateScreenCaptrue Error';
    res.result = '';
    console.log("error: ", err);
    result(err, null);
    return;
  }
};


Property.updateScreenCaptrueMap = async (req, result) => {
  try {
    var pidx = req.body.pidx;
    var flag = req.body.flag;
    var fileName = req.body.fileName;
    var pngBase64 = req.body.pngBase64;
    var base64Data = pngBase64.replace(/^data:image\/png;base64,/, "");
    fs.writeFile("./uploads/" + fileName, base64Data, 'base64', async function (fsErr) {
      if (!fsErr) {
        var deleteSql = 'SELECT * from tb_gyebukjeonggyecheon_child where parents_idx = ?'
        var dPram = [pidx];
        var dobj = await run("updateScreenCaptrueMap", deleteSql, dPram);
        if (dobj.length > 0) {
          try {
            if (flag == 1) {
              if (dobj[0].col_ae) {
                fs.unlinkSync("./uploads/" + dobj[0].col_ae);
              }
            } else if (flag == 2) {
              if (dobj[0].col_af) {
                fs.unlinkSync("./uploads/" + dobj[0].col_af);
              }
            } else if (flag == 3) {
              if (dobj[0].col_ag) {
                fs.unlinkSync("./uploads/" + dobj[0].col_ag);
              }
            } else if (flag == 4) {
              if (dobj[0].col_ag) {
                fs.unlinkSync("./uploads/" + dobj[0].col_ag);
              }
            }
          } catch (error) {

          }
          var sql = 'UPDATE tb_gyebukjeonggyecheon_child SET ';
          if (flag == 1) {
            sql += 'col_ae = ?'
          } else if (flag == 2) {
            sql += 'col_af = ?'
          } else if (flag == 3) {
            sql += 'col_ag = ?'
          } else if (flag == 4) {
            sql += 'col_ah = ?'
          }
          sql += ' WHERE parents_idx = ?';
          console.log(sql)
          var param = [
            fileName,
            pidx];
          const upObj = await run("updateScreenCaptrueMap", sql, param);
          res.code = 1;
          res.msg = 'ok';
          res.result = upObj;
          result(null, res);
          return;
        } else if (dobj.length == 0) {
          var insertSql = "INSERT INTO tb_gyebukjeonggyecheon_child ( "
          if (flag == 1) {
            insertSql += 'col_ae'
          } else if (flag == 2) {
            insertSql += 'col_af'
          } else if (flag == 3) {
            insertSql += 'col_ag'
          } else if (flag == 4) {
            insertSql += 'col_ah '
          }
          insertSql += " , parents_idx ) VALUE ( ? , ? )";
          var param = [
            fileName,
            pidx];
          const insertObj = await run("updateScreenCaptrueMap", insertSql, param);
          res.code = 1;
          res.msg = 'ok';
          res.result = insertObj;
          result(null, res);
          return;
        }
      } else {
        res.code = 0;
        res.msg = 'no';
        console.log(fsErr)
        result(fsErr, null);
        return;
      }
    });
  } catch (error) {
    logger.error(error)
    console.error('file updateScreenCaptrueMap up/ update Error!!', error);
    res.code = 0;
    res.msg = 'updateScreenCaptrueMap Error';
    res.result = error.message;
    console.log("error: ", error);
    result(error, null);
    return;
  }
};

Property.deleteScreenCaptureImage = async (req, result) => {
  try {
    var pidx = req.body.pidx;
    var flag = req.body.flag;
    var fileName = req.body.fileName;
    var deleteSql = 'SELECT * from tb_gyebukjeonggyecheon_child where parents_idx = ?'
    var dPram = [pidx];
    var dobj = await run("deleteScreenCaptureImage", deleteSql, dPram);
    if (dobj.length > 0) {
      try {
        if (flag == 1) {
          if (dobj[0].col_ae) {
            fs.unlinkSync("./uploads/" + dobj[0].col_ae);
          }
        } else if (flag == 2) {
          if (dobj[0].col_af) {
            fs.unlinkSync("./uploads/" + dobj[0].col_af);
          }
        } else if (flag == 3) {
          if (dobj[0].col_ag) {
            fs.unlinkSync("./uploads/" + dobj[0].col_ag);
          }
        } else if (flag == 4) {
          if (dobj[0].col_ag) {
            fs.unlinkSync("./uploads/" + dobj[0].col_ag);
          }
        }
      } catch (error) {
        console.log(error)
      }
      var sql = 'UPDATE tb_gyebukjeonggyecheon_child SET ';
      if (flag == 1) {
        sql += 'col_ae = ?'
      } else if (flag == 2) {
        sql += 'col_af = ?'
      } else if (flag == 3) {
        sql += 'col_ag = ?'
      } else if (flag == 4) {
        sql += 'col_ah = ?'
      }
      sql += ' WHERE parents_idx = ?';
      console.log(sql)
      var param = [
        '',
        pidx];
      const upObj = await run("deleteScreenCaptureImage", sql, param);
      res.code = 1;
      res.msg = 'ok';
      res.result = upObj;
      result(null, res);
      return;
    }
  } catch (error) {
    logger.error(error)
    console.error('file uploadPaint up/ update Error!!', error);
    res.code = 0;
    res.msg = 'file upload Error';
    res.result = err.message;
    console.log("error: ", error);
    result(error, null);
    return;
  }
};
// Property.mkOutputExelFile = async (req, result) => {
//   try {
//     var pidx = req.body.pidx;
//     var orginsSql = 'SELECT * from tb_gyebukjeonggyecheon_output where col_a = ?'
//     var detailSql = 'SELECT * from tb_gyebukjeonggyecheon_child where parents_idx = ?'
//     var dPram = [pidx];
//     var orginsObj = await run("mkOutputExelFile", orginsSql, dPram);
//     var detailObj = await run("mkOutputExelFile", detailSql, dPram);
//     try {
//       var filePath = path.resolve(__dirname, '../../uploads/assets/sampleExcel.xlsx');
//       wb.xlsx.readFile(filePath).then(function () {
//         var sh = wb.getWorksheet("sheet1");
//         // console.log(orginsObj[0]);
//         // var filePath = path.resolve(__dirname, '../../uploads/assets/');
//         sh.getRow(37).getCell('C').value = orginsObj[0].col_a
//         sh.getRow(47).getCell('C').value = orginsObj[0].col_a
//         sh.getRow(2).getCell('E').value = orginsObj[0].col_b;
//         sh.getRow(37).getCell('Q').value = orginsObj[0].col_b;
//         sh.getRow(47).getCell('Q').value = orginsObj[0].col_b;
//         sh.getRow(3).getCell('E').value = orginsObj[0].col_c;
//         sh.getRow(2).getCell('O').value = orginsObj[0].col_d;
//         // sh.getRow(2).getCell('V').value = orginsObj[0].col_e;
//         sh.getRow(2).getCell('V').value = orginsObj[0].col_e;
//         // sh.getRow(3).getCell('O').value = orginsObj[0].col_f;
//         sh.getRow(3).getCell('O').value = orginsObj[0].col_f;
//         // console.log("orginsObj[0].col_f")
//         sh.getRow(3).getCell('V').value = orginsObj[0].col_g;
//         sh.getRow(4).getCell('E').value = orginsObj[0].col_h;
//         // sh.getRow().getCell('').value = orginsObj[0].col_i;
//         sh.getRow(4).getCell('V').value = orginsObj[0].col_j;
//         sh.getRow(5).getCell('E').value = orginsObj[0].col_k;
//         sh.getRow(5).getCell('O').value = orginsObj[0].col_l;
//         // sh.getRow(6).getCell('E').value.richText[0].text = orginsObj[0].col_m;
//         sh.getRow(6).getCell('E').value = orginsObj[0].col_m;
//         // sh.getRow(6).getCell('O').value.richText[0].text = orginsObj[0].col_n;
//         sh.getRow(6).getCell('O').value = orginsObj[0].col_n;
//         sh.getRow(7).getCell('E').value = orginsObj[0].col_o;
//         sh.getRow(7).getCell('O').value = orginsObj[0].col_p;
//         sh.getRow(8).getCell('E').value = orginsObj[0].col_q;
//         sh.getRow(8).getCell('O').value = orginsObj[0].col_r;
//         sh.getRow(9).getCell('E').value = orginsObj[0].col_s;
//         sh.getRow(10).getCell('O').value = orginsObj[0].col_t;
//         sh.getRow(11).getCell('E').value = orginsObj[0].col_u;
//         sh.getRow(11).getCell('O').value = orginsObj[0].col_v;
//         sh.getRow(12).getCell('E').value = orginsObj[0].col_w;
//         sh.getRow(12).getCell('O').value = orginsObj[0].col_x;
//         sh.getRow(13).getCell('E').value = orginsObj[0].col_y;
//         sh.getRow(13).getCell('O').value = orginsObj[0].col_z;
//         sh.getRow(14).getCell('E').value = orginsObj[0].col_aa;
//         // sh.getRow(14).getCell('O').value = orginsObj[0].col_ab;
//         sh.getRow(14).getCell('O').value = orginsObj[0].col_ab;
//         sh.getRow(15).getCell('E').value = orginsObj[0].col_ac;
//         sh.getRow(15).getCell('O').value = orginsObj[0].col_ad;
//         sh.getRow(16).getCell('H').value = orginsObj[0].col_ae;
//         sh.getRow(17).getCell('H').value = orginsObj[0].col_af;
//         // /**
//         //  * 대부...
//         // sh.getRow().getCell('').value.richText[0].text = orginsObj[0].col_ag: 'X',
//         // sh.getRow().getCell('').value.richText[0].text = orginsObj[0].col_ah: 'N',
//         // sh.getRow().getCell('').value.richText[0].text = orginsObj[0].col_ai: '',
//         // sh.getRow().getCell('').value.richText[0].text = orginsObj[0].col_aj: '',
//         // sh.getRow().getCell('').value.richText[0].text = orginsObj[0].col_ak: '',
//         // sh.getRow().getCell('').value.richText[0].text = orginsObj[0].col_al: '',
//         // sh.getRow().getCell('').value.richText[0].text = orginsObj[0].col_am: '',
//         // sh.getRow().getCell('').value.richText[0].text = orginsObj[0].col_an: '',
//         // sh.getRow().getCell('').value.richText[0].text = orginsObj[0].col_ao: '',
//         //  * 
//         //  * 
//         //  */
//         sh.getRow(20).getCell('D').value = detailObj[0].col_a;
//         sh.getRow(20).getCell('I').value = detailObj[0].col_b;
//         sh.getRow(20).getCell('P').value = detailObj[0].col_c;


//         sh.getRow(20).getCell('W').value = detailObj[0].col_d;
//         sh.getRow(22).getCell('B').value = detailObj[0].col_e;
//         sh.getRow(22).getCell('D').value = detailObj[0].col_f;
//         sh.getRow(22).getCell('G').value = detailObj[0].col_g;
//         sh.getRow(22).getCell('I').value = detailObj[0].col_h;
//         sh.getRow(22).getCell('M').value = detailObj[0].col_i;
//         sh.getRow(22).getCell('P').value = detailObj[0].col_j;
//         sh.getRow(22).getCell('T').value = detailObj[0].col_k;
//         sh.getRow(22).getCell('W').value = detailObj[0].col_l;
//         sh.getRow(26).getCell('B').value = detailObj[0].col_m;
//         sh.getRow(26).getCell('D').value = detailObj[0].col_n;
//         sh.getRow(26).getCell('G').value = detailObj[0].col_o;
//         sh.getRow(26).getCell('I').value = detailObj[0].col_p;
//         sh.getRow(26).getCell('M').value = detailObj[0].col_q;
//         sh.getRow(26).getCell('P').value = detailObj[0].col_r;
//         sh.getRow(26).getCell('T').value = detailObj[0].col_s;
//         sh.getRow(26).getCell('W').value = detailObj[0].col_t;
//         sh.getRow(29).getCell('E').value = detailObj[0].col_u;
//         sh.getRow(30).getCell('E').value = detailObj[0].col_v;
//         sh.getRow(31).getCell('E').value = detailObj[0].col_w;
//         sh.getRow(32).getCell('E').value = detailObj[0].col_x;
//         sh.getRow(33).getCell('E').value = detailObj[0].col_y;
//         sh.getRow(35).getCell('B').value = detailObj[0].col_z;
//         sh.getRow(35).getCell('F').value = detailObj[0].col_aa;
//         sh.getRow(35).getCell('B').value = "김지성";
//         // sh.getRow(35).getCell('A').style.fill.fgColor.indexed = 0
//         // /**
//         //  * 확인 자 ... 확인 일자
//         // // sh.getRow().getCell('').value.richText[0].text =  detailObj[0].col_ab: null,
//         // // sh.getRow().getCell('').value.richText[0].text =  detailObj[0].col_ac: null,
//         //  */
//         sh.getRow(4).getCell('O').value = detailObj[0].col_ad;
//         sh.getRow(2).getCell('A').fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'B8B8B8' },
//         };
//         sh.getRow(2).getCell('B').fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'B8B8B8' },
//         };
//         sh.getRow(20).getCell('A').fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'B8B8B8' },
//         };
//         sh.getRow(16).getCell('B').fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'B8B8B8' },
//         };
//         sh.getRow(37).getCell('A').fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'B8B8B8' },
//         };
//         sh.getRow(47).getCell('A').fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'B8B8B8' },
//         };
//         sh.getRow(47).getCell('J').fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'B8B8B8' },
//         };

//         // add image to workbook by filename

//         // detailObj[0].col_ad;
//         if (detailObj[0].col_ae != "" && detailObj[0].col_ae != null) {

//           var filePath = path.resolve(__dirname, '../../uploads/' + detailObj[0].col_ae);
//           console.log(filePath);
//           const imageId1 = wb.addImage({
//             // filename: "./uploads/assets/"+detailObj[0].col_ae,
//             filename: filePath,
//             // buffer: fs.readFileSync(filePath),
//             // extension: 'jpeg',
//             extension: 'png',
//           });
//           sh.addImage(imageId1, 'A40:I40');
//         }

//         var filePath = path.resolve(__dirname, '../../uploads/dronPnu/' + detailObj[0].parents_idx + ".JPG");
//         console.log(filePath);
//         const imageId2 = wb.addImage({
//           // filename: "./uploads/assets/"+detailObj[0].col_ae,
//           filename: filePath,
//           // buffer: fs.readFileSync(filePath),
//           // extension: 'jpeg',
//           extension: 'png',
//         });
//         sh.addImage(imageId2, 'J40:W40');
//         if (detailObj[0].col_c == "Y") {
//           sh.addImage(imageId2, 'A50:I50');
//         }

//         var filePath = path.resolve(__dirname, '../../uploads/flyImg/' + detailObj[0].parents_idx + ".png");
//         console.log(filePath);
//         const imageId3 = wb.addImage({
//           // filename: "./uploads/assets/"+detailObj[0].col_ae,
//           filename: filePath,
//           // buffer: fs.readFileSync(filePath),
//           // extension: 'jpeg',
//           extension: 'png',
//         });
//         sh.addImage(imageId3, 'A43:I43');


//         var filePath = path.resolve(__dirname, '../../uploads/polyImg/' + detailObj[0].parents_idx + ".png");
//         console.log(filePath);
//         const imageId4 = wb.addImage({
//           // filename: "./uploads/assets/"+detailObj[0].col_ae,
//           filename: filePath,
//           // buffer: fs.readFileSync(filePath),
//           // extension: 'jpeg',
//           extension: 'png',
//         });
//         sh.addImage(imageId4, 'J43:W43');



//         // sh.addBackgroundImage(imageId1);
//         wb.xlsx.writeFile("./uploads/assets/" + orginsObj[0].col_a + ".xlsx");
//         res.code = 1;
//         res.msg = 'ok';
//         res.result = orginsObj[0].col_a;
//         result(null, res);
//         // console.log(sh.);
//         //Get all the rows data [1st and 2nd column]
//         // for (i = 1; i <= sh.rowCount; i++) {
//         //   for (j = 1; j < 8; j++) {
//         //     // console.log(sh.getRow(i).getCell(j).value);
//         //     if ((sh.getRow(i).getCell(j).value).richText[0].text.indexOf('text') >= 0) {
//         //       console.log("----------------------")
//         //       console.log(j)
//         //       console.log(i)
//         //       console.log(sh.getRow(i).getCell(j).value);
//         //       console.log("----------------------")
//         //     }
//         //   }
//         // console.log(sh.getRow(i).getCell(1).value);
//         // console.log(sh.getRow(i).getCell(2).value);
//         // console.log(sh.getRow(i).getCell(3).value);
//         // console.log(sh.getRow(i).getCell(4).value);
//         // console.log(sh.getRow(i).getCell(5).value);
//         // console.log(sh.getRow(i).getCell(6).value);
//         // console.log(sh.getRow(i).getCell(7).value);
//         // }
//       });
//       // result(null, res);
//     } catch (error) {
//       result(error, null);
//     }

//     return;
//   } catch (error) {
//     logger.error(error)
//     console.error('file uploadPaint up/ update Error!!', error);
//     res.code = 0;
//     res.msg = 'file upload Error';
//     res.result = err.message;
//     console.log("error: ", error);
//     result(error, null);
//     return;


//   }
// };
function parseFpopKeys(raw) {
  if (Array.isArray(raw)) {
    return raw.map((k) => String(k || '').trim()).filter(Boolean);
  }
  const s = String(raw || '').trim();
  if (!s) return [];
  if (s.startsWith('[')) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) {
        return arr.map((k) => String(k || '').trim()).filter(Boolean);
      }
    } catch (_) {}
  }
  return s.split(/[,\s]+/).map((k) => k.trim()).filter(Boolean);
}

Property.mkOutputExelFile = async (req, result) => {
  try {
    var fpop_key = req.body.fpop_key;
    var pk_uuid = req.body.pk_uuid;
    var flag = req.body.flag;
    // xlsx | docx | pdf | hwpx | hwpx_batch | xlsx_batch | both(기본)
    var format = (req.body.format || 'both').toString().toLowerCase();

    const assetsDir = path.resolve(__dirname, '../../uploads/assets');
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

    // 합본: 여러 fpop_key → 단일 HWPX / XLSX
    if (format === 'hwpx_batch' || format === 'xlsx_batch') {
      // fpop_keys만 사용 (fpop_key 폴백 금지: 센티널명만 들어와 1건처럼 보이는 문제 방지)
      const keys = parseFpopKeys(req.body.fpop_keys);
      console.log('[mkOutput]', format, 'keys', keys.length);
      if (keys.length === 0) {
        result(new Error('합본 대상 필지가 없습니다.'), null);
        return;
      }
      const batchItems = [];
      for (const key of keys) {
        const orginsSql = `SELECT * from public.field where fpop_key = '${key}'`;
        const detailSql = `SELECT fpop_key, img_path, img_name from jangsucrops.tb_jangsu_img where fpop_key = '${key}' ORDER BY ${JANGSU_IMG_ORDER_BY}`;
        const orginsObj = await run('mkOutputExelFile', orginsSql);
        const detailObj = await run('mkOutputExelFile', detailSql);
        if (!orginsObj || !orginsObj[0]) {
          console.warn('[mkOutput]', format, 'skip empty', key);
          continue;
        }
        batchItems.push({ row: orginsObj[0], images: detailObj || [] });
      }
      console.log('[mkOutput]', format, 'loaded', batchItems.length, '/', keys.length);
      if (batchItems.length === 0) {
        result(new Error('실태조사 데이터가 없습니다.'), null);
        return;
      }
      if (format === 'xlsx_batch') {
        const filesavename = 'xlsx_batch_merged';
        const xlsxPath = path.join(assetsDir, filesavename + '.xlsx');
        await exportChungjuSurveyXlsxMerged(batchItems, xlsxPath);
        console.log('xlsx batch merged:', xlsxPath, 'count', batchItems.length);
        res.code = 1;
        res.msg = 'ok';
        res.result = filesavename;
        result(null, res);
        return;
      }
      const filesavename = 'hwpx_batch_merged';
      const hwpxPath = path.join(assetsDir, filesavename + '.hwpx');
      await exportChungjuSurveyHwpxMerged(batchItems, hwpxPath);
      console.log('hwpx batch merged:', hwpxPath, 'count', batchItems.length);
      res.code = 1;
      res.msg = 'ok';
      res.result = filesavename;
      result(null, res);
      return;
    }

    if (flag == 'outer') {
      var orginsSql = `SELECT * from public.field where fpop_key = '${fpop_key}'`;
      // 슬롯 순서: 1근경 2원경 3항공 4지적 (*_1~*_4 우선)
      var detailSql = `SELECT fpop_key, img_path, img_name from jangsucrops.tb_jangsu_img where fpop_key = '${fpop_key}' ORDER BY ${JANGSU_IMG_ORDER_BY}`;
    } else if (flag == 'inner') {
      var orginsSql = `SELECT * from jangsucrops.tb_jangsu_inner where csft_seq = ${pk_uuid}`;
      var detailSql = `SELECT fpop_key, img_path, img_name from jangsucrops.tb_jangsu_img where fpop_key = '${pk_uuid}' ORDER BY ${JANGSU_IMG_ORDER_BY}`;
    }
    console.log(req.body)
    console.log(orginsSql);
    console.log(detailSql);

    var orginsObj = await run("mkOutputExelFile", orginsSql);
    var detailObj = await run("mkOutputExelFile", detailSql);
    console.log('[mkOutput] images', (detailObj || []).length, (detailObj || []).map((r) => r.img_name));

    if (!orginsObj || !orginsObj[0]) {
      result(new Error('실태조사 데이터가 없습니다.'), null);
      return;
    }

    var filesavename = '';
    if (flag == 'outer') {
      filesavename = fpop_key;
    } else if (flag == 'inner') {
      filesavename = pk_uuid;
    }

    const needXlsx = format === 'xlsx' || format === 'both' || format === '';
    const needDocx = format === 'docx';
    const needHwpx = format === 'hwpx';
    const needPdf = format === 'pdf' || format === 'both' || format === '';

    const respondOk = () => {
      res.code = 1;
      res.msg = 'ok';
      res.result = orginsObj[0].col_a;
      result(null, res);
    };

    const finalizePdf = async () => {
      const pdfPath = path.join(assetsDir, filesavename + '.pdf');
      await exportChungjuSurveyPdf(orginsObj[0], detailObj, pdfPath);
    };

    if (needXlsx) {
      try {
        const xlsxPath = path.join(assetsDir, filesavename + '.xlsx');
        await exportChungjuSurveyXlsx(orginsObj[0], detailObj || [], xlsxPath);
        console.log('xlsx written:', xlsxPath);
      } catch (error) {
        result(error, null);
        return;
      }
    }

    if (needDocx) {
      try {
        const docxPath = path.join(assetsDir, filesavename + '.docx');
        await exportChungjuSurveyDocx(orginsObj[0], docxPath);
        console.log('docx written:', docxPath);
      } catch (error) {
        result(error, null);
        return;
      }
    }

    if (needHwpx) {
      try {
        const hwpxPath = path.join(assetsDir, filesavename + '.hwpx');
        await exportChungjuSurveyHwpx(orginsObj[0], detailObj || [], hwpxPath);
        console.log('hwpx written:', hwpxPath);
      } catch (error) {
        result(error, null);
        return;
      }
    }

    if (needPdf) {
      try {
        await finalizePdf();
      } catch (error) {
        result(error, null);
        return;
      }
    }

    respondOk();
    return;
  } catch (error) {
    logger.error(error)
    console.error('file uploadPaint up/ update Error!!', error);
    res.code = 0;
    res.msg = 'file upload Error';
    res.result = error.message;
    console.log("error: ", error);
    result(error, null);
    return;


  }
};


Property.renameFile = async (body, result) => {
  try {

    var selectSql = "SELECT parents_idx , col_ae  FROM tb_gyebukjeonggyecheon_child";
    var resObj = await run("renameFile", selectSql);
    // console.log(resObj[1]);
    // console.log(resObj.length);
    // for(var i = 0; i < resObj.length; i++){
    //   // console.log('==============================================')
    //   // if(resObj[i].parents_idx !="4574036024108660013"){
    //     try {
    //       var exten = resObj[i].col_ae.split(".");
    //       fs.createReadStream('./uploads/'+resObj[i].col_ae).pipe(fs.createWriteStream('./uploads/cameraPnu/'+resObj[i].parents_idx+'.'+exten[1]));

    //     } catch (error) {
    //       console.log(resObj[i].parents_idx)
    //       console.log(resObj[i].col_ae)
    //       console.log(error)
    //     }
    //   // }
    //   // console.log(resObj[i].col_ae)
    //   // console.log('./uploads/'+resObj[i].col_ae);
    //   // console.log('./uploads/cameraPnu/'+resObj[i].parents_idx+'.'+exten[1]);
    //   // console.log('==============================================')
    // }

    var list = [];
    var list2 = [];
    fs.readdir("./uploads", (err, files) => {
      if (err) {
        throw err;
      }
      files.forEach(file => {
        // console.log(file);
        // var x = file.split(".");
        // // console.log(x)
        // list.push(x[0]);
        list.push(file);
      });
      for (var i = 0; i < resObj.length; i++) {
        list2.push(resObj[i].col_ae);
      }
      // console.log(list.length)
      // console.log(list2)
      // console.log(list.filter(x => !list2.includes(x)));
      try {
        var list3 = list.filter(x => !list2.includes(x));
        console.log(list3)
        for (var k = 0; k < list3.length; k++) {
          // console.log(list3[k])
          fs.createReadStream('./uploads/' + list3[k]).pipe(fs.createWriteStream('./uploads/sumList/' + list3[k]));
        }
      } catch (error) {
        console.log(error)
      }


    });

    // for (var i = 0; i < list.length; i++) {
    //   for(var j = 0; j < resObj.length; j++){

    //   }
    // }

    result(null, res);

  } catch (err) {
    logger.error(err)
    console.error('tb_gyebukjeonggyecheon_output/select Error!!', err);
    res.code = 2;
    res.msg = 'tb_gyebukjeonggyecheon_output Error';
    res.result = '';
    console.log("error: ", err);
    result(err, null);
    return;
  }
};

// Property.getExelFile = async (body, result) => {
//   try {


//     result.setHeader('Access-Control-Expose-Headers', "Content-Disposition"); //IMPORTANT FOR React.js content-disposition get Name
//     result.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     result.setHeader("Content-Disposition", "attachment; filename=4574033521104170002.xlsx");
//     return workbook.xlsx.write(result)
//       .then(function () {
//         result.end();
//       });
//     // })
//   } catch (err) {
//     logger.error(err)
//     console.error('tb_gyebukjeonggyecheon_output/select Error!!', err);
//     res.code = 2;
//     res.msg = 'tb_gyebukjeonggyecheon_output Error';
//     res.result = '';
//     console.log("error: ", err);
//     result(err, null);
//     return;
//   }
// };
Property.getExelFile = async (req, result) => {
  try {


    console.log("req.query")
    console.log(req.query)
    console.log("req.query")
    var fpop_key = req.query.fpop_key;
    var flag = req.query.flag;
    var pk_uuid = req.query.pk_uuid;
    // const fileName = exelName + '.xlsx'
    // const fileURL = './uploads/assets/' + exelName + '.xlsx'
    // // const fileName = '4574033521100150001.xlsx'
    // // const fileURL = './uploads/assets/4574033521100150001.xlsx'
    // console.log(fileURL)
    // const stream = fs.createReadStream(fileURL);
    // res.set({
    //   'Content-Disposition': `attachment; filename='${fileName}'`,
    //   'Content-Type': 'application/pdf',
    // });
    // stream.pipe(res);
    if (flag == 'outer') {
      var filePath = './uploads/assets/' + fpop_key + '.xlsx'
    } else if (flag == 'inner') {
      var filePath = './uploads/assets/' + pk_uuid + '.xlsx'
    }

    // const filePath = path.join(process.cwd(), 'uploads/assets', exelName+'.xlsx'); // 파일이 존재해야 함
    if (!fs.existsSync(filePath)) return result(null, 'null');

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="report.xlsx"');

    fs.createReadStream(filePath).pipe(res);
    // 또는: res.download(filePath, 'report.xlsx');  // 자동 헤더 세팅

    // })
  } catch (err) {
    logger.error(err)
    console.error('tb_gyebukjeonggyecheon_output/select Error!!', err);
    res.code = 2;
    res.msg = 'tb_gyebukjeonggyecheon_output Error';
    res.result = '';
    console.log("error: ", err);
    result(err, null);
    return;
  }
};



Property.mvWorkImageFile = async (body, result) => {
  try {

    var list = [
      '186efbc0-6201-11ee-99d0-c914ed2fbd22screenshot_2023-10-04T00-25-33-924986.png',
      '5bc635f0-6201-11ee-b743-735f559ac482screenshot_2023-10-04T00-27-26-900854.png',
      '836c0d50-6201-11ee-aa0b-c75a35b624d4screenshot_2023-10-04T00-28-33-413498.png',
      'f31ed430-6200-11ee-9ee2-b56c4201ec5ascreenshot_2023-10-04T00-24-31-316016.png',
      '0a003860-6201-11ee-8599-c564d3d9b351screenshot_2023-10-04T00-25-09-701852.png',
      '01557090-6201-11ee-9215-612604a050c6screenshot_2023-10-04T00-24-55-163695.png',
      '2ff7c380-6201-11ee-9756-df8ff32af621screenshot_2023-10-04T00-26-13-410860.png',
      '46428d00-6201-11ee-a09b-5ff0aa23798cscreenshot_2023-10-04T00-26-50-808799.png',
      'c1594840-6200-11ee-a05a-6705647ab7f5screenshot_2023-10-04T00-23-07-819859.png',
      '78dfb440-6201-11ee-9754-6ba9c4d75531screenshot_2023-10-04T00-28-15-722761.png',
      'b104ade0-6200-11ee-9306-f7bb63a961adscreenshot_2023-10-04T00-22-40-420982.png',
      'dd715c20-6200-11ee-9578-a111a3bda23ascreenshot_2023-10-04T00-23-54-954144.png',
      'a5e67510-6200-11ee-9a45-979f31b3b6ffscreenshot_2023-10-04T00-22-21-766892.png',
      '46331920-6200-11ee-a306-7982c4c68319screenshot_2023-10-04T00-19-41-212049.png',
      '369db010-6200-11ee-b41e-a5a053e7c807screenshot_2023-10-04T00-19-15-072094.png',
      '78057650-6200-11ee-838f-0f684de4e1d0screenshot_2023-10-04T00-21-04-790032.png',
      '6cb0c430-6200-11ee-9701-7dd18ed64ccfscreenshot_2023-10-04T00-20-45-780788.png',
      '8cd16800-6200-11ee-a609-ef70336a93eascreenshot_2023-10-04T00-21-39-687599.png',
      '9a221130-6200-11ee-a9a0-4fbafd573c78screenshot_2023-10-04T00-22-02-026708.png',
      '6156bae0-6200-11ee-aa51-c9a19dcde5cbscreenshot_2023-10-04T00-20-26-746302.png',
      '4ee0a010-6200-11ee-8a89-cd4f2f09bd4fscreenshot_2023-10-04T00-19-55-771450.png',
      '202fce30-6200-11ee-aaf6-bd606c6d98afscreenshot_2023-10-04T00-18-37-430787.png',
      '12547130-6200-11ee-bc63-0f897702ebbcscreenshot_2023-10-04T00-18-14-185794.png',
      '6c174120-61f1-11ee-9144-4992fca418e5screenshot_2023-10-03T22-33-22-329209.png',
      '360e8d40-61f1-11ee-9438-03e07a43acdcscreenshot_2023-10-03T22-31-51-674595.png',
      '57d56700-61f1-11ee-97e1-a3ab6e9c39f7screenshot_2023-10-03T22-32-48-349009.png',
      '2aca7cf0-61f1-11ee-978a-6d634b21e233screenshot_2023-10-03T22-31-32-767237.png',
      'd0c08fb0-61f0-11ee-a439-a199465ee0e4screenshot_2023-10-03T22-29-01-718187.png',
      '03efbdc0-61f1-11ee-8509-e55d0e4eb7a0screenshot_2023-10-03T22-30-27-584124.png',
      '40747d20-61f2-11ee-ac6f-67ef68855ecbscreenshot_2023-10-03T22-39-18-617457.png',
      '34822b70-61f2-11ee-9250-3d6dd778e5dascreenshot_2023-10-03T22-38-58-572139.png',
      'fe1cb190-61f1-11ee-974e-2f70796b0b34screenshot_2023-10-03T22-37-27-317874.png',
      '09dafaf0-61f2-11ee-8efd-0969879004f9screenshot_2023-10-03T22-37-47-017127.png',
      'e2692150-61f0-11ee-90a1-bf41c0115cc8screenshot_2023-10-03T22-29-31-338201.png',
      'bdd8ee60-61f0-11ee-8a67-5386bd26d184screenshot_2023-10-03T22-28-29-993336.png',
      'c271e200-61f1-11ee-9c2b-3f6a46400999screenshot_2023-10-03T22-35-47-210993.png',
      'd03c7620-61f1-11ee-a32a-c3ccfb4b516ascreenshot_2023-10-03T22-36-10-355583.png',
      '6cf7b370-625c-11ee-8f7c-7d513a99243dscreenshot_2023-10-04T11-19-19-921691.png',
      'b2079230-61f0-11ee-bde4-29c9feef4958screenshot_2023-10-03T22-28-10-167468.png',
      '9a9119f0-61f0-11ee-8924-536bcf44c44fscreenshot_2023-10-03T22-27-30-812492.png',
      '8271de90-61f0-11ee-8090-e1b6906aa1bcscreenshot_2023-10-03T22-26-50-340359.png',
      '8c48a340-61f0-11ee-bdb6-fd4040df3b8dscreenshot_2023-10-03T22-27-06-844750.png',
      '25287dc0-61f0-11ee-8fbc-a78108f1466dscreenshot_2023-10-03T22-24-13-822780.png',
      '1b28ad40-61f0-11ee-9a2f-c3c0a86d40a1screenshot_2023-10-03T22-23-57-056261.png',
      '707846c0-61f0-11ee-a2c4-2d0067ba2771screenshot_2023-10-03T22-26-20-165697.png',
      '51dff0a0-61f0-11ee-8003-b1aee03f578ascreenshot_2023-10-03T22-25-28-852991.png',
      '39fbe980-61f0-11ee-9dc8-4759ad8f5060screenshot_2023-10-03T22-24-48-771882.png',
      '341fd2e0-61c0-11ee-832b-df88cc48fa06screenshot_2023-10-03T16-41-03-085505.png',
      '2be18880-61c0-11ee-9bb8-437b1ff84edcscreenshot_2023-10-03T16-40-49-268349.png',
      '234a96d0-61c0-11ee-90af-359f3cebb11fscreenshot_2023-10-03T16-40-34-850762.png',
      '175c15b0-61c0-11ee-9162-272be535a54cscreenshot_2023-10-03T16-40-14-833911.png',
      '0b07cde0-61c0-11ee-b2c8-7f95e2f615dfscreenshot_2023-10-03T16-39-54-150145.png',
      'c8cf7130-61bf-11ee-8c25-37e3d602345escreenshot_2023-10-03T16-38-03-045859.png',
      'd3d36b40-61bf-11ee-b27c-e14f7384c230screenshot_2023-10-03T16-38-21-528327.png',
      'decb7e70-61bf-11ee-908d-5df13e724e1dscreenshot_2023-10-03T16-38-39-932722.png',
      'dfb73a90-625a-11ee-971a-63dbd4d1e06fscreenshot_2023-10-04T11-08-13-454432.png',
      'ba8cedf0-61bf-11ee-a832-5dc9cd50e6c3screenshot_2023-10-03T16-37-39-114808.png',
      'ac4ded20-61bf-11ee-9273-ad09e82a167escreenshot_2023-10-03T16-37-15-216340.png',
      'ef6ed510-61bf-11ee-8356-83a5c2fa036dscreenshot_2023-10-03T16-39-07-844944.png',
      '9178e090-61bf-11ee-b2aa-536eb54b7cf7screenshot_2023-10-03T16-36-30-207807.png',
      'be1dab40-61be-11ee-9fc4-cb4b8b6ac98bscreenshot_2023-10-03T16-30-35-611116.png',
      '87a4d070-61be-11ee-a86c-9f66b345b7acscreenshot_2023-10-03T16-29-04-224691.png',
      '5a0bd730-61be-11ee-8f58-a37c5cf20b75screenshot_2023-10-03T16-27-47-721165.png',
      '4ba2b920-61be-11ee-9848-c3d2c83b0da6screenshot_2023-10-03T16-27-23-543144.png',
      '62729120-61be-11ee-85c9-610133ae0bbescreenshot_2023-10-03T16-28-01-815282.png',
      '3a3047e0-625c-11ee-98bd-314e83a0ba43screenshot_2023-10-04T11-17-54-743665.png',
      'dd863ee0-625c-11ee-8da4-11144e5db155screenshot_2023-10-04T11-22-28-764200.png',
      'a7b182a0-61b4-11ee-8cb4-694c1960a38bscreenshot_2023-10-03T15-18-23-025086.png',
      'b24be570-61b4-11ee-b72f-49a7465dd922screenshot_2023-10-03T15-18-40-807362.png',
      '8dafcba0-61b4-11ee-abda-f5a737807cd1screenshot_2023-10-03T15-17-39-390526.png',
      '9cfdf280-61b4-11ee-ad42-5db28a144c28screenshot_2023-10-03T15-18-05-065118.png',
      'ea052f80-61b4-11ee-872c-1d7c0714d5fescreenshot_2023-10-03T15-20-14-286193.png',
      '2e14bd30-61b5-11ee-b9f5-33504961dddbscreenshot_2023-10-03T15-22-08-494742.png',
      '380a7b90-61b5-11ee-a2b0-97d6d827d4d2screenshot_2023-10-03T15-22-25-200075.png',
      '4223c780-61b5-11ee-93b7-77917b3b10b0screenshot_2023-10-03T15-22-42-123641.png',
      '19a03a50-61b5-11ee-8140-d9e7eced4be5screenshot_2023-10-03T15-21-34-153881.png',
      '24820660-61b5-11ee-8b9e-ffb3bafa227dscreenshot_2023-10-03T15-21-52-415502.png',
      'f61fa2a0-61b4-11ee-8853-81831fd627bescreenshot_2023-10-03T15-20-34-594977.png',
      '09ed1010-61b5-11ee-a389-659fac2ba706screenshot_2023-10-03T15-21-07-810921.png',
      'd469dfe0-61b4-11ee-9f9f-ef5e2361c7e0screenshot_2023-10-03T15-19-38-046362.png',
      'cc037410-61b4-11ee-b30d-1360e51efd94screenshot_2023-10-03T15-19-23-945703.png',
      'dacb53f0-61b4-11ee-9ca6-a162227e52bbscreenshot_2023-10-03T15-19-48-745744.png',
      'be0302e0-61b4-11ee-a3b8-d74cee2a3caescreenshot_2023-10-03T15-19-00-471858.png',
      '58997f50-61ba-11ee-aead-612b85fcea6ascreenshot_2023-10-03T15-59-07-303389.png',
      '39af5fb0-61ba-11ee-af3a-3f046826fdb1screenshot_2023-10-03T15-58-15-441899.png',
      '25b42b80-61ba-11ee-9d9a-8b0aa59e161ascreenshot_2023-10-03T15-57-41-923306.png',
      '62434090-61ba-11ee-97c2-df14c090bb27screenshot_2023-10-03T15-59-23-518806.png',
      '6a905800-61ba-11ee-b982-51435bfc9fdbscreenshot_2023-10-03T15-59-37-448207.png',
      'fdb73370-61b9-11ee-ab8c-877eef65c667screenshot_2023-10-03T15-56-34-834655.png',
      '11156450-61ba-11ee-b99e-15b9b2c5e143screenshot_2023-10-03T15-57-07-325830.png',
      'de8ab3a0-61b9-11ee-af0b-3b8bb4d34b9ascreenshot_2023-10-03T15-55-42-524573.png',
      '1aec9e30-61ba-11ee-b4be-f949f2309741screenshot_2023-10-03T15-57-23-839082.png',
      '4e697710-61ba-11ee-9421-2de8b2ea6805screenshot_2023-10-03T15-58-50-217594.png',
      'cab9fd20-6201-11ee-8a58-857453d28619screenshot_2023-10-04T00-30-33-051875.png',
      'b2c5f070-6201-11ee-b59a-d906f4e6df67screenshot_2023-10-04T00-29-52-858953.png',
      'a82c02d0-6201-11ee-9027-f3db972bea25screenshot_2023-10-04T00-29-35-074632.png',
      '86c30450-61b0-11ee-b405-0518ae7cd077screenshot_2023-10-03T14-48-49-775084.png',
      'a6adcb10-61b0-11ee-96f0-0fc9089a834escreenshot_2023-10-03T14-49-43-312366.png',
      '9a9e5470-61b0-11ee-8205-2718fb5b4d73screenshot_2023-10-03T14-49-23-081945.png',
      'f2ba2d50-61b0-11ee-aaed-4f6f978d8ae7screenshot_2023-10-03T14-51-50-907420.png',
      'eab78c60-61b0-11ee-93e6-a1c713131962screenshot_2023-10-03T14-51-37-467960.png',
      'd4edb2b0-61b0-11ee-bfe3-a735a67bb43fscreenshot_2023-10-03T14-51-00-925927.png',
      'e449c800-61cb-11ee-867d-f97f168508adscreenshot_2023-10-03T18-04-43-108079.png',
      'f25b7740-61cb-11ee-acfa-63bdde93ff6ascreenshot_2023-10-03T18-05-06-704295.png',
      'fedd10a0-61cb-11ee-bf87-3dff27cf8df7screenshot_2023-10-03T18-05-27-695484.png',
      '146b2330-61b3-11ee-905a-3911c824ce97screenshot_2023-10-03T15-07-06-443622.png',
      '229ad860-61cc-11ee-9c53-6b94701eeceescreenshot_2023-10-03T18-06-27-665164.png',
      '0a5ca350-61cc-11ee-811b-5f77ffd2953escreenshot_2023-10-03T18-05-46-985689.png',
      '1fb993c0-61b3-11ee-8f5f-315d880ed4a1screenshot_2023-10-03T15-07-25-413024.png',
      '2771e540-61b3-11ee-aee0-d78b630f861cscreenshot_2023-10-03T15-07-38-362348.png',
      'fd558fa0-61b2-11ee-9a16-e5bf9b0c45bfscreenshot_2023-10-03T15-06-27-715349.png',
      '069f5690-61b3-11ee-bbd5-09a432ace12fscreenshot_2023-10-03T15-06-43-299357.png',
      'f0c158a0-61b2-11ee-bed4-e77840bb0ff5screenshot_2023-10-03T15-06-06-607556.png',
      'e49950f0-61b2-11ee-9d0c-e79d5827721bscreenshot_2023-10-03T15-05-46-205032.png',
      'a2938940-61ef-11ee-a107-d364b8eca7a1screenshot_2023-10-03T22-20-34-747033.png',
      'b865c760-61ef-11ee-a83b-93e0b3d1ae71screenshot_2023-10-03T22-21-11-352905.png',
      'c03104a0-61ef-11ee-aa1b-5b522845aecfscreenshot_2023-10-03T22-21-24-435370.png',
      'ca099e10-61ef-11ee-95d7-e545d26646c8screenshot_2023-10-03T22-21-40-953148.png',
      '95912720-61ef-11ee-a120-b9f05af7b2b7screenshot_2023-10-03T22-20-12-922666.png',
      'f9a80c30-625b-11ee-a379-bb47d3edce4ascreenshot_2023-10-04T11-16-06-475403.png',
      '3650ff60-61ef-11ee-91e7-1b38d2b35122screenshot_2023-10-03T22-17-33-119498.png',
      '83b04770-61ef-11ee-bdd1-d70fca551c8ascreenshot_2023-10-03T22-19-42-932325.png',
      '17987a10-5cec-11ee-b75c-57156833403a20230927_131114.jpg',
      '40489280-61ef-11ee-9a87-8b7cd7303ca2screenshot_2023-10-03T22-17-49-838213.png',
      '2969c960-5cec-11ee-a861-25fd1f5fa2d220230927_131119.jpg',
      'd7bf2390-61ef-11ee-b305-29158391a558screenshot_2023-10-03T22-22-03-958609.png',
      'e2fe51e0-61ef-11ee-be72-1152297d3fe4screenshot_2023-10-03T22-22-22-824805.png',
      '6fb95900-61ef-11ee-86ff-d9b2c06a15b1screenshot_2023-10-03T22-19-09-434875.png',
      '58b04890-61ef-11ee-bc3a-3d273b852edascreenshot_2023-10-03T22-18-30-788649.png',
      '4da71e60-61ef-11ee-a716-5bb477eaef2bscreenshot_2023-10-03T22-18-12-273039.png',
      '67aeefe0-61ef-11ee-b9d0-73b6095837fescreenshot_2023-10-03T22-18-55-940977.png',
      '848d4ab0-61d3-11ee-86db-250297c90dcbscreenshot_2023-10-03T18-59-18-465562.png',
      '74a0c0f0-61d3-11ee-b3fd-e33c31494f14screenshot_2023-10-03T18-58-51-745481.png',
      '6f7e9260-61cd-11ee-a8a4-f3ea7edf8daascreenshot_2023-10-03T18-15-46-151879.png',
      '07c8f160-61d2-11ee-b5d6-b7f369d5c7e0screenshot_2023-10-03T18-48-39-648171.png',
      '609520c0-61cd-11ee-9377-515e6838e280screenshot_2023-10-03T18-15-21-136807.png',
      '48a42150-61cd-11ee-b100-f568995d8b07screenshot_2023-10-03T18-14-40-973403.png',
      '2d16e850-61cd-11ee-bb82-23e4ac00e750screenshot_2023-10-03T18-13-54-744166.png',
      '1abd5630-61cd-11ee-a966-3f81bea536b7screenshot_2023-10-03T18-13-23-954850.png',
      '0f04d930-61cd-11ee-8e56-0d0b72a0de94screenshot_2023-10-03T18-13-04-291224.png',
      '00f9e0b0-61cd-11ee-8dc6-1503f7e416d1screenshot_2023-10-03T18-12-40-734937.png',
      'c2dcb190-61cc-11ee-95b5-9d4e5702da5cscreenshot_2023-10-03T18-10-56-529860.png',
      'b714a430-61cc-11ee-9d71-1b0701a8db66screenshot_2023-10-03T18-10-36-756401.png',
      'af1b7920-61cc-11ee-b56f-59a157f5a0a6screenshot_2023-10-03T18-10-23-382612.png',
      '9f2db6e0-61cc-11ee-ac62-31ab7b60e930screenshot_2023-10-03T18-09-56-660989.png',
      '9512e450-61cc-11ee-94f6-15fe500cadf3screenshot_2023-10-03T18-09-39-705796.png',
      'f01dbb40-5cf4-11ee-afd0-2bbdac432e4320230927_141506.jpg',
      '81770e30-61cc-11ee-bac9-cbc7c015e4afscreenshot_2023-10-03T18-09-06-812441.png',
      '8a03edc0-61cc-11ee-8b75-5b84c62bfc19screenshot_2023-10-03T18-09-21-152731.png',
      '7604e900-61cc-11ee-b73b-4fef0105ffcbscreenshot_2023-10-03T18-08-47-603662.png',
      '6c7abdb0-61cc-11ee-98d2-5bcd073006a9screenshot_2023-10-03T18-08-31-596485.png',
      '611eb890-61cc-11ee-b894-d99cd943995bscreenshot_2023-10-03T18-08-12-543809.png',
      '4ad41620-61cc-11ee-8e54-e1b9eb368e7fscreenshot_2023-10-03T18-07-35-145393.png',
      '3efe4d20-61cc-11ee-b31a-7710725c4e18screenshot_2023-10-03T18-07-15-283710.png',
      '36823670-61cc-11ee-8836-67fcd34f279bscreenshot_2023-10-03T18-07-01-050700.png',
      '2af472f0-61cc-11ee-8dca-6b632f31ed32screenshot_2023-10-03T18-06-41-666487.png',
      '8ea43070-6135-11ee-a113-433f001e4519screenshot_2023-10-03T00-08-34-907803.png',
      'affb0a50-6135-11ee-aae4-b9b10a8bb025screenshot_2023-10-03T00-09-30-828919.png',
      'ce2a76f0-61ad-11ee-aa82-2dcc769bde21screenshot_2023-10-03T14-29-21-081216.png',
      'f4de9b50-61ad-11ee-916e-a7549b080714screenshot_2023-10-03T14-30-26-028235.png',
      'eabd3910-61ad-11ee-b875-8595fd581e8dscreenshot_2023-10-03T14-30-09-030983.png',
      '77126800-6135-11ee-aee5-e18cdad44eafscreenshot_2023-10-03T00-07-55-366045.png',
      '029b42a0-6133-11ee-9c02-e33a815b4c2cscreenshot_2023-10-02T23-50-20-978699.png',
      'f61f9cb0-6132-11ee-b69d-f19982cfbc4fscreenshot_2023-10-02T23-50-00-031281.png',
      '82fbcdb0-61b1-11ee-b1ba-494e8be35fccscreenshot_2023-10-03T14-55-52-914669.png',
      '781ff510-61b1-11ee-a3eb-c169f90bd9d4screenshot_2023-10-03T14-55-34-705845.png',
      'b86b00b0-61b1-11ee-a159-eb7e47e367d1screenshot_2023-10-03T14-57-22-566183.png',
      '695be5c0-61b1-11ee-b47a-bd62780ab318screenshot_2023-10-03T14-55-09-934700.png',
      '5f4c5dd0-61b1-11ee-a77f-f5b49d7afbcdscreenshot_2023-10-03T14-54-53-051480.png',
      '0432b5a0-61ae-11ee-871e-55a87fa0fe19screenshot_2023-10-03T14-30-51-740824.png',
      '2ee08af0-61b0-11ee-948c-85c0576548a2screenshot_2023-10-03T14-46-22-325260.png',
      '177ed330-61b0-11ee-b444-a72d9169d607screenshot_2023-10-03T14-45-43-099692.png',
      '40497b80-61b0-11ee-898e-370ad6b8a9eascreenshot_2023-10-03T14-46-51-547780.png',
      '0d8fa480-61b0-11ee-9b5a-2750f1d56002screenshot_2023-10-03T14-45-26-425023.png',
      '46820040-61af-11ee-aa9d-a7d6590e74aescreenshot_2023-10-03T14-39-52-488897.png',
      '3ec19870-61af-11ee-a331-c1aacba1aa4bscreenshot_2023-10-03T14-39-39-478371.png',
      'f9026980-61af-11ee-a210-2f0992912d57screenshot_2023-10-03T14-44-51-958638.png',
      'f1444ba0-61af-11ee-b735-33cf153a1e9dscreenshot_2023-10-03T14-44-38-968152.png',
      'dcc4a530-61af-11ee-96bc-395f5ee0b3e3screenshot_2023-10-03T14-44-04-575548.png',
      'e6e2ac10-61af-11ee-963c-c3f0c337134bscreenshot_2023-10-03T14-44-21-547643.png',
      'cc459f70-61af-11ee-995d-3f96e499c317screenshot_2023-10-03T14-43-36-913281.png',
      '30888b10-61af-11ee-846e-fb65cad0e9acscreenshot_2023-10-03T14-39-15-618282.png',
      '88a51cb0-61ae-11ee-b560-2b35d090e69escreenshot_2023-10-03T14-34-33-958257.png',
      'c64ad1e0-61ae-11ee-9a50-51904d09b1descreenshot_2023-10-03T14-36-17-381942.png',
      'a5954110-61ae-11ee-b3b8-d1ed44e0879dscreenshot_2023-10-03T14-35-22-485880.png',
      '9af90980-61ae-11ee-b550-9f7839ff4203screenshot_2023-10-03T14-35-04-696679.png',
      'be991aa0-61af-11ee-9830-d724209a318fscreenshot_2023-10-03T14-43-13-973487.png',
      'a6e01b20-61af-11ee-924b-95ea88397dafscreenshot_2023-10-03T14-42-34-170575.png',
      '9c6b41b0-61af-11ee-9af4-b3f4125dab89screenshot_2023-10-03T14-42-16-632690.png',
      '724fd670-61af-11ee-bb09-e19a48edde7cscreenshot_2023-10-03T14-41-05-981276.png',
      '67d2e6b0-61af-11ee-b14c-876c0125fc76screenshot_2023-10-03T14-40-48-383040.png',
      '5c22a710-61af-11ee-9c0f-a97ea10f3477screenshot_2023-10-03T14-40-28-767313.png',
      '80393d30-61af-11ee-8400-9df316ec2c50screenshot_2023-10-03T14-41-29-316169.png',
      '78b07ca0-61ae-11ee-9af0-073620f1b56dscreenshot_2023-10-03T14-34-07-190304.png',
      'e1949940-61ae-11ee-800a-2f79e2361b8bscreenshot_2023-10-03T14-37-03-164744.png',
      'd3e7ed60-61ae-11ee-bd5d-5d5ab934c7ffscreenshot_2023-10-03T14-36-40-200142.png',
      'baf47210-61ae-11ee-a101-9d4f4362e6c7screenshot_2023-10-03T14-35-58-355543.png',
      'ee4e3290-61ae-11ee-a482-b763362d612ascreenshot_2023-10-03T14-37-24-510731.png',
      '0123f990-61af-11ee-af95-9f8900c1376dscreenshot_2023-10-03T14-37-56-099019.png',
      '21f3a210-61af-11ee-aad6-872c408d2896screenshot_2023-10-03T14-38-51-164537.png',
      '2434fc00-61ae-11ee-b14b-e5de575a5f29screenshot_2023-10-03T14-31-45-445241.png',
      '2f0dee70-61ae-11ee-8da8-cf317d971061screenshot_2023-10-03T14-32-03-638389.png',
      '52b76ae0-61ae-11ee-80ee-c3fd52363fc1screenshot_2023-10-03T14-33-03-475378.png',
      '65117230-61ae-11ee-95a9-313795ba1908screenshot_2023-10-03T14-33-34-254928.png',
      '14d800b0-61b1-11ee-a96c-79545b42d462screenshot_2023-10-03T14-52-48-153515.png',
      '9f5d46a0-61b1-11ee-9731-397f2dd5e9f5screenshot_2023-10-03T14-56-40-541417.png',
      '2bba7650-61b1-11ee-9148-15d6940e3c86screenshot_2023-10-03T14-53-26-531154.png',
      'af1a2ac0-6136-11ee-8cd5-17490d04a734screenshot_2023-10-03T00-16-38-863886.png',
      'a36de2c0-6136-11ee-9374-f526be09a185screenshot_2023-10-03T00-16-19-285308.png',
      'bb78f9e0-6136-11ee-8ba6-e3031f4c8952screenshot_2023-10-03T00-16-59-615389.png',
      '91657de0-6136-11ee-bc0b-d9bb8713c714screenshot_2023-10-03T00-15-49-024424.png',
      '297473d0-6136-11ee-9242-cd7b2edcfd80screenshot_2023-10-03T00-12-54-629397.png',
      '38479e50-6136-11ee-8754-9d476a1c3dc8screenshot_2023-10-03T00-13-19-502363.png',
      '02ff2d30-6136-11ee-af7d-ab3cffb15c84screenshot_2023-10-03T00-11-50-111858.png',
      '3a4f5fc0-6137-11ee-b520-4dae190859d6screenshot_2023-10-03T00-20-32-405670.png',
      '2f56fe70-6137-11ee-b085-4f4a6fccba87screenshot_2023-10-03T00-20-14-006599.png',
      '22e9fe80-6137-11ee-a88c-4d13fe1f1558screenshot_2023-10-03T00-19-53-150565.png',
      '15066420-6137-11ee-908b-c5a56050a42dscreenshot_2023-10-03T00-19-29-851742.png',
      '5d77c550-6137-11ee-be82-51c5288c700cscreenshot_2023-10-03T00-21-31-388845.png',
      'a358b400-61ad-11ee-96c3-5574e49deabascreenshot_2023-10-03T14-28-09-239726.png',
      '84b31770-61ad-11ee-98e8-c76122062414screenshot_2023-10-03T14-27-17-838118.png',
      'b7403920-61ad-11ee-a3e7-2ff370366559screenshot_2023-10-03T14-28-42-637354.png',
      '9b4e7590-6137-11ee-b32f-21ba4ae75cc8screenshot_2023-10-03T00-23-15-151350.png',
      '869a0380-6137-11ee-a97c-ed86ae06687bscreenshot_2023-10-03T00-22-40-407703.png',
      '687b7140-6137-11ee-976e-0309095c185ascreenshot_2023-10-03T00-21-49-869491.png',
      '9b8dc4e0-61ad-11ee-bb72-079f7275b746screenshot_2023-10-03T14-27-56-169533.png',
      '8cb0d660-61ad-11ee-9fba-65f9e8de4b40screenshot_2023-10-03T14-27-31-232443.png',
      'adfe8880-61ad-11ee-9250-9df708df3433screenshot_2023-10-03T14-28-27-101927.png',
      'd654e440-6136-11ee-ade0-cde6c0bfe5fdscreenshot_2023-10-03T00-17-44-669986.png',
      'de9fd8d0-6136-11ee-9169-edf83e20778dscreenshot_2023-10-03T00-17-58-591398.png',
      'd86dcea0-6135-11ee-a1b2-69c495a2cceascreenshot_2023-10-03T00-10-38-665289.png',
      'f2182160-6136-11ee-81ff-6ff87fc4890cscreenshot_2023-10-03T00-18-31-245206.png',
      'fa3416b0-6136-11ee-aa63-3d007ea3e9f5screenshot_2023-10-03T00-18-44-853981.png',
      '02981180-6137-11ee-b590-99aefddfd357screenshot_2023-10-03T00-18-58-930431.png',
      '70d44550-6133-11ee-920a-c72e8fb6711bscreenshot_2023-10-02T23-53-25-894149.png',
      '9f79a580-6133-11ee-9245-b312ff5b01ebscreenshot_2023-10-02T23-54-44-158689.png',
      '1fe2e060-6134-11ee-bc8a-49738ee83386screenshot_2023-10-02T23-58-19-596406.png',
      'b531cbf0-6133-11ee-bd7d-8bc6f2f7ddd7screenshot_2023-10-02T23-55-20-584583.png',
      'cf0bafa0-6133-11ee-859f-f9a3295dc5a1screenshot_2023-10-02T23-56-03-981066.png',
      'f6efa170-6133-11ee-a940-adeb0ac9e2acscreenshot_2023-10-02T23-57-10-891467.png',
      '6065ba50-6133-11ee-a380-dfd8192be56bscreenshot_2023-10-02T23-52-58-338896.png',
      '4fd92000-6133-11ee-8a3f-13a483186d49screenshot_2023-10-02T23-52-30-554701.png',
      'cb5041b0-6259-11ee-9853-2b45ab52cec9screenshot_2023-10-04T11-00-29-723916.png',
      'ea3c8430-6259-11ee-a3a3-c765c70dc2fbscreenshot_2023-10-04T11-01-21-624907.png',
      '51aec150-625a-11ee-94bf-87f12ceafebascreenshot_2023-10-04T11-04-15-178290.png',
      '0808b0b0-625a-11ee-aba3-ed587f4695d3screenshot_2023-10-04T11-02-11-612081.png',
      '1f3379f0-625a-11ee-8205-799a5c13c02bscreenshot_2023-10-04T11-02-50-476495.png',
      '3deb17e0-625a-11ee-8fba-27ec8dfb9107screenshot_2023-10-04T11-03-42-013615.png',
      '621eef70-6259-11ee-b28f-5f6af258744cscreenshot_2023-10-04T10-57-33-258692.png',
      '978a78f0-6259-11ee-b0a7-95816efdc4fescreenshot_2023-10-04T10-59-02-878066.png',
      '2e6a16a0-6259-11ee-842d-1dff8879f499screenshot_2023-10-04T10-56-06-511031.png',
      '1750d990-6259-11ee-8a7d-b7f488a7fb50screenshot_2023-10-04T10-55-27-760221.png',
      '7b4711b0-601c-11ee-b985-010b8498cfafscreenshot_2023-10-01T14-36-33-836555.png',
      '726fe2b0-601c-11ee-81f1-2758b4eb8732screenshot_2023-10-01T14-36-19-001078.png',
      '61f019a0-601c-11ee-b2dc-5d0fd95f39cfscreenshot_2023-10-01T14-35-51-317457.png',
      '575a98d0-601c-11ee-af2b-1f4ce2fee026screenshot_2023-10-01T14-35-33-571111.png',
      '88237540-601c-11ee-bdfd-e1177ebb9205screenshot_2023-10-01T14-36-55-419915.png',
      '3f84cd10-601d-11ee-b738-89ed6a39cd2dscreenshot_2023-10-01T14-42-03-057642.png',
      '4ee395c0-601d-11ee-b0f4-c7ca33074b1escreenshot_2023-10-01T14-42-28-844042.png',
      '7a469c30-601d-11ee-bba0-bd9d2dea23ddscreenshot_2023-10-01T14-43-41-655703.png',
      '716fe260-601d-11ee-908a-ab00c7c6dd55screenshot_2023-10-01T14-43-26-826006.png',
      '661feb30-601d-11ee-96e7-ab5a018b6012screenshot_2023-10-01T14-43-07-849544.png',
      '35944960-601e-11ee-a73f-ed0a12642392screenshot_2023-10-01T14-48-55-882472.png',
      '2467e210-601d-11ee-94bf-bfa6241577eescreenshot_2023-10-01T14-41-17-590613.png',
      '311a2860-601d-11ee-bb71-053c0e79d44fscreenshot_2023-10-01T14-41-38-894122.png',
      '6e369430-5c4a-11ee-bc41-038532fc9504screenshot_2023-09-26T17-55-24-104160.png',
      'f493ecf0-601c-11ee-9ddd-ff88c506303fscreenshot_2023-10-01T14-39-57-351687.png',
      'd6035f00-601c-11ee-829c-bf035e664c9escreenshot_2023-10-01T14-39-06-073351.png',
      'e30ec1d0-601c-11ee-8fea-4b2e07b9700ascreenshot_2023-10-01T14-39-27-956393.png',
      'ece05660-601c-11ee-911c-33f1a6d42c1ascreenshot_2023-10-01T14-39-44-429239.png',
      'f2e57cd0-6020-11ee-b362-29d4c04bcef5screenshot_2023-10-01T15-08-32-499857.png',
      'fb62f310-6020-11ee-a77f-67770943e043screenshot_2023-10-01T15-08-46-712847.png',
      'e8898290-6020-11ee-bdca-ad001a04f5f4screenshot_2023-10-01T15-08-15-120016.png',
      'e01b2780-6020-11ee-824b-6335feb4d27escreenshot_2023-10-01T15-08-00-976776.png',
      'b9b45fd0-6020-11ee-9afd-f7c29ac39a3ascreenshot_2023-10-01T15-06-56-571228.png',
      'e90e3100-6022-11ee-b6b5-79c509b81d8dscreenshot_2023-10-01T15-22-34-992602.png',
      '3d7bfd60-6020-11ee-bb7f-f7e2a2cf0b31screenshot_2023-10-01T15-03-28-158488.png',
      '876642f0-6020-11ee-aa2f-5faac0dbadacscreenshot_2023-10-01T15-05-32-171466.png',
      '4ebe7a30-6020-11ee-abab-1fbb9a898c4cscreenshot_2023-10-01T15-03-57-116700.png',
      '6ccdca30-6020-11ee-8daa-590a0bb821c6screenshot_2023-10-01T15-04-47-549292.png',
      'e11cce20-6022-11ee-9753-558d00d5d066screenshot_2023-10-01T15-22-21-672642.png',
      'd4ccf320-6022-11ee-8b29-0f8f4c9a99b5screenshot_2023-10-01T15-22-01-009855.png',
      '2ef237f0-6020-11ee-b06e-b5bedbccd784screenshot_2023-10-01T15-03-03-780908.png',
      '0ad7aa30-6020-11ee-9d8c-3320fa614c69screenshot_2023-10-01T15-02-03-201701.png',
      '1d405780-6020-11ee-885e-2352ffbacb0fscreenshot_2023-10-01T15-02-34-081260.png',
      '12c8bef0-6020-11ee-aa4b-49ed9a591eefscreenshot_2023-10-01T15-02-16-521686.png',
      '0260eab0-6020-11ee-b568-0f28a1e281ecscreenshot_2023-10-01T15-01-49-000570.png',
      'd82c4030-6021-11ee-8b5c-e18756045220screenshot_2023-10-01T15-14-57-163967.png',
      'cefd5440-6021-11ee-8c22-a5c97740659ascreenshot_2023-10-01T15-14-41-753815.png',
      'e9ef37a0-6021-11ee-9a02-a7d81aa21decscreenshot_2023-10-01T15-15-26-955382.png',
      'f36c1c80-6021-11ee-b243-5fc11536d3e5screenshot_2023-10-01T15-15-42-871146.png',
      'ff726b60-6021-11ee-8c35-cf46dd7580c8screenshot_2023-10-01T15-16-03-052036.png',
      'fa12e180-6022-11ee-81e4-a5bdb973d90dscreenshot_2023-10-01T15-23-03-516576.png',
      '0598dcd0-6023-11ee-852c-89de78cc00f4screenshot_2023-10-01T15-23-22-883496.png',
      '34807620-6023-11ee-baa9-43fab26c6f21screenshot_2023-10-01T15-24-41-543211.png',
      '4c785360-6023-11ee-8d91-1b7876d70e46screenshot_2023-10-01T15-25-21-775933.png',
      '884243b0-6023-11ee-97ba-f1426b25f002screenshot_2023-10-01T15-27-02-067170.png',
      '101e7f20-6023-11ee-9624-05967dfa8464screenshot_2023-10-01T15-23-40-514350.png',
      '2ac68840-6023-11ee-b9f7-97965a8c7135screenshot_2023-10-01T15-24-25-237409.png',
      '1c49e230-6023-11ee-91a5-f15be5127da1screenshot_2023-10-01T15-24-00-926333.png',
      '440c4240-6023-11ee-a88b-6115a192e332screenshot_2023-10-01T15-25-07-650817.png',
      '7bfdb350-6023-11ee-ac57-851ca2c0c300screenshot_2023-10-01T15-26-41-497511.png',
      '629c5b00-6023-11ee-bab4-d73c4164cf74screenshot_2023-10-01T15-25-58-920140.png',
      '6a367620-6023-11ee-b576-95efc2c55721screenshot_2023-10-01T15-26-11-671989.png',
      'd0c4bbe0-6023-11ee-ba21-89e75abe5ab8screenshot_2023-10-01T15-29-03-738246.png',
      'a6ae0b90-6023-11ee-b56a-3343e431dfc3screenshot_2023-10-01T15-27-53-124050.png',
      '9b4d4b80-6023-11ee-a3c3-fd1edfc11eb5screenshot_2023-10-01T15-27-34-037195.png',
      '90f23ba0-6023-11ee-b69f-45b5cf2f0511screenshot_2023-10-01T15-27-16-667192.png',
      'b826b390-6023-11ee-8f93-6581cb1ab516screenshot_2023-10-01T15-28-22-430544.png',
      'c042f700-6023-11ee-891d-cfcb2c07ccbcscreenshot_2023-10-01T15-28-36-046165.png',
      'aff6e820-6023-11ee-8483-3f65f3c43b29screenshot_2023-10-01T15-28-08-705867.png',
      'a9efe590-6022-11ee-a87f-d97c51fad405screenshot_2023-10-01T15-20-49-095934.png',
      'a0968e40-6022-11ee-860d-cba409a5a274screenshot_2023-10-01T15-20-33-407569.png',
      '8cb7e2c0-6022-11ee-8088-bf7c1e4ce6a5screenshot_2023-10-01T15-20-00-071315.png',
      '7e5fdbb0-6022-11ee-b304-3784a0a16d42screenshot_2023-10-01T15-19-36-013066.png',
      '71d36ce0-6022-11ee-b639-a154d5c8f52dscreenshot_2023-10-01T15-19-14-960443.png',
      '62642970-6022-11ee-9535-db3056ba7933screenshot_2023-10-01T15-18-49-053794.png',
      '57625240-6022-11ee-9c0f-73c9838ded2dscreenshot_2023-10-01T15-18-30-576384.png',
      '36bc51d0-6022-11ee-94e4-83761fca4669screenshot_2023-10-01T15-17-35-826535.png',
      '25ced2d0-6022-11ee-a451-53e75a17bcadscreenshot_2023-10-01T15-17-07-422746.png',
      '192b3280-6022-11ee-bcad-1daa3c7d5636screenshot_2023-10-01T15-16-46-214594.png',
      '978c4150-6022-11ee-99f4-23fa0d6b3d29screenshot_2023-10-01T15-20-18-243858.png',
      '0b8f9310-6021-11ee-ad73-73964682ea32screenshot_2023-10-01T15-09-13-888182.png',
      'c4facf30-6022-11ee-a791-e5b1c6ee2590screenshot_2023-10-01T15-21-34-466587.png',
      '39832f70-6021-11ee-a38c-5d1537e1d87dscreenshot_2023-10-01T15-10-30-981157.png',
      '46e39010-6021-11ee-b3ed-7556eaa239bcscreenshot_2023-10-01T15-10-53-421370.png',
      '6554af20-6021-11ee-b202-fde5b40efeebscreenshot_2023-10-01T15-11-44-498096.png',
      '6ef65a10-6021-11ee-9b7c-9d4e212841eescreenshot_2023-10-01T15-12-00-659316.png',
      '1ee05670-6021-11ee-9aa7-1f506f7eb9fascreenshot_2023-10-01T15-09-46-303211.png',
      '1539c980-6021-11ee-a8a3-757551fc97afscreenshot_2023-10-01T15-09-30-106329.png',
      '51837120-6021-11ee-a5f2-2142a16ea2fascreenshot_2023-10-01T15-11-11-254195.png',
      '775aa300-6021-11ee-8d84-71ad2ee1f122screenshot_2023-10-01T15-12-14-739385.png',
      '85b80140-6021-11ee-a27e-f98cfd7e76d1screenshot_2023-10-01T15-12-38-835341.png',
      'b185dcf0-5c3b-11ee-bc17-a105741a9ae5screenshot_2023-09-26T16-09-54-573896.png',
      'ae6c9990-5c3c-11ee-b431-b151c5507e46screenshot_2023-09-26T16-16-58-883317.png',
      '4d24baf0-5c3c-11ee-866b-6ff731628e58screenshot_2023-09-26T16-14-15-682939.png',
      '5cbab030-6021-11ee-80b6-595b40b86205screenshot_2023-10-01T15-11-30-070029.png',
      '8def6dd0-6021-11ee-9ce9-094b37abac1dscreenshot_2023-10-01T15-12-52-616872.png',
      'e2520830-6132-11ee-afcb-9340390abb9escreenshot_2023-10-02T23-49-26-802095.png',
      '83583840-6132-11ee-8b33-e37b599d229cscreenshot_2023-10-02T23-46-47-465509.png',
      'a1b9c6f0-6132-11ee-90dd-1566d7cbdc5fscreenshot_2023-10-02T23-47-38-436342.png',
      '99360f20-6132-11ee-bb4b-3b3ff39cbeb1screenshot_2023-10-02T23-47-24-157576.png',
      'aaab34b0-6132-11ee-94d2-359617c1d999screenshot_2023-10-02T23-47-53-435094.png',
      'a8caf0e0-5c2d-11ee-9dc3-ebb2f31d3b1dscreenshot_2023-09-26T14-29-26-964531.png',
      '69705fc0-5c2d-11ee-99fc-a7ccf9511cb2screenshot_2023-09-26T14-27-40-666060.png',
      '38e52890-5c2d-11ee-bba7-81a987d5327bscreenshot_2023-09-26T14-26-19-221982.png',
      'ead09a40-5c2c-11ee-af47-e341f63f6bdfscreenshot_2023-09-26T14-24-08-238994.png',
      'bb11f750-5c2b-11ee-a334-43a21f50e00720230926_141346.jpg',
      '013e98a0-5c2c-11ee-b4a0-a5676bbb117ascreenshot_2023-09-26T14-17-36-378707.png',
      '3d20cbe0-5c2c-11ee-847f-fbd1b81daf52screenshot_2023-09-26T14-19-16-832514.png',
      '3752b3a0-5c2b-11ee-85a6-cdeb7c86b57fscreenshot_2023-09-26T14-11-57-616673.png',
      '21326ed0-5c26-11ee-b511-97b87d6d7a1dscreenshot_2023-09-26T13-35-32-991505.png',
      '07ed5440-5c2a-11ee-9c1a-d3816cc63592screenshot_2023-09-26T14-03-28-610670.png',
      '99c84430-5c28-11ee-b4a7-75907f5db835screenshot_2023-09-26T13-53-14-311755.png',
      '01a9e4f0-5c29-11ee-89dc-23a72a30ea2cscreenshot_2023-09-26T13-56-08-600418.png',
      'c29fa8a0-5c26-11ee-9367-bf538750feaescreenshot_2023-09-26T13-40-03-849807.png',
      '749ded80-5cbf-11ee-b1eb-6d3fc59095dc20230927_075256.jpg',
      'be1aa430-5cbf-11ee-8de4-550e7d75293720230927_075502.jpg',
      'd098ae40-5cbf-11ee-84e2-1915f467784020230927_075532.jpg',
      '01b76890-5c20-11ee-95a0-cf348f9f684320230926_125135.jpg',
      '6a4ec4c0-5c20-11ee-a4d9-3f01021e9eb220230926_125416.jpg',
      '63eb06c0-5c20-11ee-8f49-6b004d7d621420230926_125414.jpg',
      '43125d90-5c20-11ee-9874-c9364a0b509f20230926_125326.jpg',
      '653e9360-5c21-11ee-8bb9-ff3ff42527f320230926_130110.jpg',
      '27b86990-5c20-11ee-89dd-1da3bbe622ee20230926_125241.jpg',
      'e0bedb50-5c1f-11ee-8df2-f73fadb7d98e20230926_125041.jpg',
      'd0d20370-5c1f-11ee-85bd-fd5a23305bc620230926_125008.jpg',
      'bb748020-5c1f-11ee-bc9f-9bb868a1c4a620230926_124937.jpg',
      '001af6a0-5c20-11ee-814c-fde7221e313420230926_125108.jpg',
      'db50c7f0-5c1f-11ee-8da7-85122e08299320230926_125003.jpg',
      '0f40a670-601c-11ee-8615-273bce660d12screenshot_2023-10-01T14-33-32-574019.png',
      '42dba0b0-5c21-11ee-b628-e1621f95ef2b20230926_130022.jpg',
      'a1992060-5c20-11ee-923b-b1802a66625620230926_125545.jpg',
      '36e40cd0-601c-11ee-95e1-d169e97b413cscreenshot_2023-10-01T14-34-39-096823.png',
      'fc6ed710-601b-11ee-bc67-296eb577fcbfscreenshot_2023-10-01T14-33-01-028272.png',
      '1f220ca0-601c-11ee-980d-fbb16eaf2c25screenshot_2023-10-01T14-33-59-224538.png',
      '16dfcaa0-601c-11ee-b551-470df80b6691screenshot_2023-10-01T14-33-45-384745.png',
      'd9210f30-601b-11ee-8baf-a9f088337501screenshot_2023-10-01T14-32-01-801866.png',
      'f406a890-5c20-11ee-84a0-a32d8bc24c3f20230926_125704.jpg',
      'de5056e0-5c20-11ee-bc4b-794f569e006820230926_125708.jpg',
      '4e6fccd0-5c21-11ee-bf45-fff422339dba20230926_130024.jpg',
      '55afba00-5c21-11ee-a326-5b83774542db20230926_130024.jpg',
      '64992ba0-5c21-11ee-973a-ef6c055d10f820230926_130028.jpg',
      'aac0ce50-601b-11ee-a77d-096458dd4a03screenshot_2023-10-01T14-30-43-999029.png',
      '9ce76d20-601b-11ee-989d-0179afd185e8screenshot_2023-10-01T14-30-20-759216.png',
      '8f814020-601b-11ee-932f-691bc2aebda0screenshot_2023-10-01T14-29-58-280109.png',
      '78a05120-601b-11ee-8b3e-99c014701312screenshot_2023-10-01T14-29-19-885736.png',
      'b12cb4b0-5c20-11ee-8259-7777ab16ce5320230926_125551.jpg',
      '5d387000-5c21-11ee-b990-7f4bfc05011520230926_130026.jpg',
      'c4d3d570-5c20-11ee-a2ee-cd106fab780620230926_125557.jpg',
      'b03fee40-5c21-11ee-8dfe-efb536d3edf420230926_130234.jpg',
      'f5f17690-601b-11ee-9c6c-013418d3689fscreenshot_2023-10-01T14-32-50-138122.png',
      'eb09de20-601b-11ee-878e-3d5e8496df8cscreenshot_2023-10-01T14-32-31-844133.png',
      'd0a7deb0-601b-11ee-94ab-778333d3792dscreenshot_2023-10-01T14-31-47-585393.png',
      'c73b7490-601b-11ee-bc36-d3f88b3682d7screenshot_2023-10-01T14-31-31-780284.png',
      'bdd23ec0-601b-11ee-a084-9772e5cb76ffscreenshot_2023-10-01T14-31-15-981653.png',
      'b2e4d9f0-601b-11ee-b129-d12a4dd02cbbscreenshot_2023-10-01T14-30-57-645558.png',
      'eb4858c0-5c20-11ee-b146-01c4d3cb6b3520230926_125706.jpg',
      'd356e420-5c20-11ee-b37e-ad11e73916c420230926_125702.jpg',
      'a9ce6a10-5c20-11ee-ab46-67d6fb6f359820230926_125549.jpg',
      '82e998c0-5c20-11ee-9725-518fb355418c20230926_125504.jpg',
      '7052af80-5c20-11ee-8a19-cdfa603df50620230926_125418.jpg',
      '7d6da2b0-5c20-11ee-be7f-13a5b6fc239720230926_125502.jpg',
      '603096d0-5c20-11ee-bb4a-5beaf25fdb9920230926_125348.jpg',
      '6f9af840-5c20-11ee-a236-8d26fba1d76620230926_125351.jpg',
      'bb82bb80-5c20-11ee-8b7d-11d2bdcbfde320230926_125555.jpg',
      'd2301760-5c20-11ee-83e5-13c722a3151e20230926_125601.jpg',
      'a2ab3730-5c21-11ee-8965-bd50af703d4920230926_130230.jpg',
      'bc1c9510-5c21-11ee-a451-7b183c2e508720230926_130238.jpg',
      'c60e34c0-5c21-11ee-aa28-c926b29272b520230926_130243.jpg',
      '7bfcf450-5c23-11ee-a5f8-ad549cb62511screenshot_2023-09-26T13-16-36-853071.png',
      '85b761f0-5c24-11ee-91c2-efecf8274fcbscreenshot_2023-09-26T13-24-02-642960.png',
      '5138db10-5c25-11ee-a441-17d484b627acscreenshot_2023-09-26T13-29-44-057782.png',
      '647348c0-6132-11ee-a84e-87df44387605screenshot_2023-10-02T23-45-55-625399.png',
      '743937b0-6132-11ee-aa33-e3ec21478b48screenshot_2023-10-02T23-46-22-093656.png',
      '69dc8010-61b4-11ee-a400-e5215c6c445dscreenshot_2023-10-03T15-16-39-269795.png',
      '736b1830-61b4-11ee-bdd8-a9f8a593111bscreenshot_2023-10-03T15-16-55-304371.png',
      '5e64dca0-61b4-11ee-b4b7-79871175e92fscreenshot_2023-10-03T15-16-20-034603.png',
      '49d7c8b0-61b4-11ee-845e-abcf3e0dae2ascreenshot_2023-10-03T15-15-45-558708.png',
      '5445eb60-61b4-11ee-af6a-69332bc3a2ffscreenshot_2023-10-03T15-16-03-054275.png',
      '3d293b10-6134-11ee-a995-219c41c9c688screenshot_2023-10-02T23-59-08-716493.png',
      '97f69d00-5c1e-11ee-a771-d10473b84dc2screenshot_2023-09-26T12-41-36-265717.png',
      '71619960-5c1e-11ee-bc66-f30f2b8b581fscreenshot_2023-09-26T12-40-31-555689.png',
      '9a7a9ab0-5c1c-11ee-9be3-bb3a304f874escreenshot_2023-09-26T12-27-21-523280.png',
      '057206f0-5c1d-11ee-a6a0-c331cbe96844screenshot_2023-09-26T12-30-20-987001.png',
      '3c588d20-5c1c-11ee-9fb2-b1cdaddf1545screenshot_2023-09-26T12-24-43-593179.png',
      '0d6120e0-5c12-11ee-b230-917b977d2132screenshot_2023-09-26T11-11-49-830341.png',
      'db3ed980-5c12-11ee-80f5-5b61c900aae5screenshot_2023-09-26T11-17-35-220381.png',
      '1819f640-5c14-11ee-9230-97dd8fb02244screenshot_2023-09-26T11-26-26-815010.png',
      'ca4aae50-5c13-11ee-afd5-45165e0f8611screenshot_2023-09-26T11-24-16-274682.png',
      'd8b1b0e0-5c10-11ee-b04f-179b2c8d589cscreenshot_2023-09-26T11-03-11-940408.png',
      'f0bca0f0-5c10-11ee-88c9-a9687a84079220230926_110141.jpg',
      '48af46f0-5c11-11ee-aade-0100ff03ee8bscreenshot_2023-09-26T11-06-19-832876.png',
      '4a2b7c20-5c10-11ee-98c7-212e690f8de8screenshot_2023-09-26T10-59-12-829865.png',
      '240cb9f0-5c10-11ee-81d9-9328bfcad2a3screenshot_2023-09-26T10-58-08-878120.png',
      '0e6c3a30-5c10-11ee-baa9-13b28bd91233screenshot_2023-09-26T10-57-32-579469.png',
      'b53aeaf0-5c15-11ee-baa8-5d87d684f9c7screenshot_2023-09-26T11-37-59-921079.png',
      'ff6f6e00-5c17-11ee-bf9a-8bccabba199020230926_115417.jpg',
      '73305f90-5c16-11ee-b075-cbb53bc3d17dscreenshot_2023-09-26T11-43-18-634083.png',
      '82638ef0-5c17-11ee-be26-71589106a6eascreenshot_2023-09-26T11-50-53-604647.png',
      'b17b6000-5c17-11ee-8bca-fd5904a67cd7screenshot_2023-09-26T11-52-12-596104.png',
      'cbb3b760-5c17-11ee-9783-fdfefe5573eascreenshot_2023-09-26T11-52-56-585272.png',
      '6e540f70-5c17-11ee-8299-49151c1765b3screenshot_2023-09-26T11-50-19-957410.png',
      'b6a1f500-5c15-11ee-b766-77e65f97035bscreenshot_2023-09-26T11-38-02-287616.png',
      '4ca54b30-5c0f-11ee-ab54-a78311bca66bscreenshot_2023-09-26T10-52-07-486901.png',
      'b7f0a3d0-5c0f-11ee-8382-2fa1056a6264screenshot_2023-09-26T10-55-07-495662.png',
      'eedb2b30-5c1a-11ee-822c-bf9391bc4be5screenshot_2023-09-26T12-15-24-094902.png',
      '0014f340-5c0c-11ee-bdd0-af25d9780174screenshot_2023-09-26T10-28-30-534121.png',
      '3624ac00-5c0c-11ee-9556-4364a624c7a6screenshot_2023-09-26T10-30-01-243506.png',
      '190ec540-5c0e-11ee-8fb0-e9ceb558ed06screenshot_2023-09-26T10-43-31-437352.png',
      '25c99710-5c0e-11ee-913e-2355768a2626screenshot_2023-09-26T10-43-52-796600.png',
      '3bdfb0c0-6208-11ee-94a3-2ff125952b2escreenshot_2023-10-04T01-16-39-839046.png',
      '2dc1ba90-620a-11ee-9f1a-bb1cdb05e94escreenshot_2023-10-04T01-30-35-168492.png',
      '1df11d40-620a-11ee-8f2f-ff7002a2ef93screenshot_2023-10-04T01-30-08-626855.png',
      'eba98580-6208-11ee-9517-3dc28d551dadscreenshot_2023-10-04T01-21-34-765742.png',
      '00981a60-6209-11ee-89cd-439c1373b37dscreenshot_2023-10-04T01-22-09-896142.png',
      '39dac390-6209-11ee-b26a-f34e9b4accddscreenshot_2023-10-04T01-23-45-922931.png',
      '2ec7fc70-6209-11ee-a4cd-d12af38e04e5screenshot_2023-10-04T01-23-27-376254.png',
      '50417980-6209-11ee-9cde-b79a32778e02screenshot_2023-10-04T01-24-23-515686.png',
      '434bcc20-620a-11ee-b812-d78041c6156fscreenshot_2023-10-04T01-31-11-297953.png',
      '57884f10-620a-11ee-94a4-e9ab13adfcf1screenshot_2023-10-04T01-31-45-247679.png',
      '66733cc0-6209-11ee-bdcb-e517e7e22ab8screenshot_2023-10-04T01-25-00-744961.png',
      '75441d50-6209-11ee-9b1e-811755de45f1screenshot_2023-10-04T01-25-25-624038.png',
      '7ff822a0-6209-11ee-927e-29079220cbc3screenshot_2023-10-04T01-25-43-563406.png',
      '8e204010-6209-11ee-8cbd-0f89003fa914screenshot_2023-10-04T01-26-07-305622.png',
      '98ede7e0-6209-11ee-8336-f3a170deeed4screenshot_2023-10-04T01-26-25-428580.png',
      'e69d99e0-6209-11ee-bcfe-9396e59e9219screenshot_2023-10-04T01-28-35-763263.png',
      'ab6a9260-6209-11ee-811a-81220364cc2cscreenshot_2023-10-04T01-26-56-461101.png',
      '073828a0-620a-11ee-ae64-7742d3c189c5screenshot_2023-10-04T01-29-30-491087.png',
      'f5f8b910-6209-11ee-bf1c-e5399f7fe52ascreenshot_2023-10-04T01-29-01-557744.png',
      'd71242f0-6209-11ee-aa0c-45b304279a98screenshot_2023-10-04T01-28-09-704459.png',
      'cc425130-6209-11ee-828a-b9b5d8a639d1screenshot_2023-10-04T01-27-51-561187.png',
      'b6898e80-6209-11ee-b2a2-c1e8afdb0742screenshot_2023-10-04T01-27-15-104987.png',
      '1fc165e0-6209-11ee-b556-97f663e7c2cascreenshot_2023-10-04T01-23-02-145767.png',
      '50744180-5da4-11ee-950e-752726bd39ba20230928_111110.jpg',
      '7340cb70-5da4-11ee-93b7-d7c3acb9cef420230928_111103.jpg',
      '63a0d850-6208-11ee-bf25-e17355d3cc69screenshot_2023-10-04T01-17-46-523141.png',
      '4e0cb4a0-6208-11ee-bb46-dd93ea6f58e1screenshot_2023-10-04T01-17-10-319870.png',
      '2bd9d2a0-6208-11ee-9ea8-e9ea8cfd808ascreenshot_2023-10-04T01-16-12-926167.png',
      'cd7843b0-620a-11ee-9e12-5166a60e1d29screenshot_2023-10-04T01-35-03-123767.png',
      'd80b2c70-620a-11ee-8675-a9f7621c96b9screenshot_2023-10-04T01-35-20-868457.png',
      'ae6edc40-620a-11ee-96b8-098aec961fd4screenshot_2023-10-04T01-34-11-020419.png',
      'bc8baf10-620a-11ee-b5ad-b5db513e4d69screenshot_2023-10-04T01-34-34-679574.png',
      'ce98cee0-620a-11ee-9ef7-8febcda8b052screenshot_2023-10-04T01-35-04-975258.png',
      'd901a4f0-620b-11ee-868f-a19c0b9eb698screenshot_2023-10-04T01-42-31-972321.png',
      'ee3b73a0-620b-11ee-b850-7b4ff44c8940screenshot_2023-10-04T01-43-07-588727.png',
      '27eb3680-620c-11ee-a701-a3faf9948ff4screenshot_2023-10-04T01-44-44-324507.png',
      '424c4b90-620c-11ee-9a8d-27736b62ea65screenshot_2023-10-04T01-45-28-631791.png',
      '100b4e10-620c-11ee-9498-b9a09f39bf6cscreenshot_2023-10-04T01-44-04-312545.png',
      '0685ddb0-620c-11ee-ba2c-5b4da31263adscreenshot_2023-10-04T01-43-48-340139.png',
      '18538380-620c-11ee-9a2a-e5b86f511736screenshot_2023-10-04T01-44-18-212206.png',
      'fddf5ba0-620b-11ee-b156-35d96809247cscreenshot_2023-10-04T01-43-33-799819.png',
      'ea908980-620a-11ee-9bce-8d6a482fc1d2screenshot_2023-10-04T01-35-51-909728.png',
      'f176a170-620b-11ee-bc8b-e5cc9fdb0bfascreenshot_2023-10-04T01-43-12-968095.png',
      'f99b3ec0-620a-11ee-9e24-f53a7bb23210screenshot_2023-10-04T01-36-17-134489.png',
      '8420cd00-5d90-11ee-96cd-01f250b1713f20230928_084743.jpg',
      'd3119050-620b-11ee-a956-9924ef64692fscreenshot_2023-10-04T01-42-21-970472.png',
      'dee33aa0-620b-11ee-b7ca-89d797dd3f43screenshot_2023-10-04T01-42-41-816751.png',
      'd8742770-620a-11ee-8201-d1dbd4aed622screenshot_2023-10-04T01-35-21-536752.png',
      '39bab110-620c-11ee-9f39-05e2dd8e9b5cscreenshot_2023-10-04T01-45-14-256578.png',
      '2c5f8090-620c-11ee-9149-3f4df1193977screenshot_2023-10-04T01-44-51-845155.png',
      '165ae7d0-620c-11ee-9fc6-715fd3daf304screenshot_2023-10-04T01-44-14-867944.png',
      'efa8dbc0-620a-11ee-92eb-7738b7b8a4c5screenshot_2023-10-04T01-36-00-491642.png',
      'e2e99d20-620a-11ee-9906-e196e023d8c1screenshot_2023-10-04T01-35-39-096832.png',
      'd1493e50-6209-11ee-8c16-1dad8c662ae2screenshot_2023-10-04T01-28-00-033283.png',
      'c5741190-6209-11ee-a2a5-1dd116e88da8screenshot_2023-10-04T01-27-40-175660.png',
      'b91f7ba0-6209-11ee-9865-9b043b655486screenshot_2023-10-04T01-27-19-489153.png',
      'dc262860-6209-11ee-ae2e-adf1e309336ascreenshot_2023-10-04T01-28-18-252461.png',
      '9acfc740-6209-11ee-b0fe-6be6c1fd5473screenshot_2023-10-04T01-26-28-622430.png',
      'a49797d0-6209-11ee-9267-a74a406a3681screenshot_2023-10-04T01-26-45-046136.png',
      '7c987ce0-6209-11ee-a0df-15ce87fdbc95screenshot_2023-10-04T01-25-37-942990.png',
      '866aadb0-6209-11ee-9ad0-0b8c446b3ab8screenshot_2023-10-04T01-25-54-425260.png',
      '5ee333c0-6209-11ee-aa64-859f40fea0d6screenshot_2023-10-04T01-24-48-100743.png',
      '50b793e0-6209-11ee-8b7b-353df0326518screenshot_2023-10-04T01-24-24-325214.png',
      '6ee31e70-6209-11ee-8ee1-27849a4206b8screenshot_2023-10-04T01-25-14-938123.png',
      '08fd6a30-6208-11ee-a1c6-dde410be0cbdscreenshot_2023-10-04T01-15-14-495285.png',
      '31c1d0f0-6208-11ee-a3c2-d9f023ec99b4screenshot_2023-10-04T01-16-22-883098.png',
      '14c661f0-6208-11ee-a2ea-8bec8142bc71screenshot_2023-10-04T01-15-34-267434.png',
      'f4618930-6207-11ee-a7b6-db3ae78c35cdscreenshot_2023-10-04T01-14-39-910635.png',
      'ed91c2f0-6207-11ee-8567-e74c046a7594screenshot_2023-10-04T01-14-28-491089.png',
      'dc8682c0-6207-11ee-8d39-a91457d19afdscreenshot_2023-10-04T01-13-59-881903.png',
      'd22e5910-6207-11ee-b75d-533a720866c3screenshot_2023-10-04T01-13-42-534569.png',
      'a51a63c0-6206-11ee-ac7a-1d19c3720ea3screenshot_2023-10-04T01-05-17-408263.png',
      '5e2ce370-6206-11ee-9e6e-d5c5bc8c59cescreenshot_2023-10-04T01-03-18-419253.png',
      '94831b10-6206-11ee-b01e-072665b6c884screenshot_2023-10-04T01-04-49-564261.png',
      '5af4c610-620a-11ee-9bab-795609d73eaascreenshot_2023-10-04T01-31-51-012518.png',
      '3233d730-6209-11ee-b6a2-35cdba9febc8screenshot_2023-10-04T01-23-33-122980.png',
      '24458e70-6209-11ee-8a95-ab12a230167fscreenshot_2023-10-04T01-23-09-750173.png',
      '3df13630-6209-11ee-9c2b-0d867e329518screenshot_2023-10-04T01-23-52-827733.png',
      'aa45b6e0-6208-11ee-b1c9-ef19d35a9b17screenshot_2023-10-04T01-19-45-029834.png',
      '8c49a0c0-6208-11ee-8c8b-4f92d582f381screenshot_2023-10-04T01-18-54-745285.png',
      '97e3c050-6208-11ee-a4c8-df1c1fdb7fa1screenshot_2023-10-04T01-19-14-215623.png',
      'd3c70500-6208-11ee-9e48-f9a39a410420screenshot_2023-10-04T01-20-54-678403.png',
      'c96bce10-6208-11ee-8ed7-07d376b7a2bcscreenshot_2023-10-04T01-20-37-309221.png',
      '73bcd680-6208-11ee-9dcf-599d1f563866screenshot_2023-10-04T01-18-13-532442.png',
      'bbd3e2b0-6208-11ee-a220-378eb926ef3cscreenshot_2023-10-04T01-20-14-501111.png',
      'f8f41ec0-6209-11ee-84e8-6de30660ca02screenshot_2023-10-04T01-29-06-574407.png',
      '1d2c94c0-620a-11ee-af1a-df618ecc6b44screenshot_2023-10-04T01-30-07-350412.png',
      '23df3610-620a-11ee-b91a-675e44681827screenshot_2023-10-04T01-30-18-588156.png',
      '2b36a2e0-620a-11ee-86d5-f787e888064fscreenshot_2023-10-04T01-30-30-907037.png',
      '33d95460-620a-11ee-af58-f1b32efdf7fascreenshot_2023-10-04T01-30-45-397642.png',
      '09745d00-620a-11ee-8c13-ed2268d7f714screenshot_2023-10-04T01-29-34-272691.png',
      '0fd22790-620a-11ee-884b-c3427c832a61screenshot_2023-10-04T01-29-44-958523.png',
      'b36c2c70-620a-11ee-ae85-a1f63580ba4dscreenshot_2023-10-04T01-34-19-419384.png',
      'aa547200-620a-11ee-b479-e960e1f537e8screenshot_2023-10-04T01-34-04-173632.png',
      '9429b3a0-620a-11ee-9b2b-4fbf4decc893screenshot_2023-10-04T01-33-26-976962.png',
      '8c607230-620a-11ee-9daf-8d95a2215df9screenshot_2023-10-04T01-33-13-909016.png',
      '7c91a9a0-620a-11ee-9f80-a36003922b1ascreenshot_2023-10-04T01-32-47-388727.png',
      '701f7990-620a-11ee-83b4-1fc956583509screenshot_2023-10-04T01-32-26-512997.png',
      '6662f3a0-620a-11ee-9234-093323eeae85screenshot_2023-10-04T01-32-10-172196.png',
      '468fbe70-6208-11ee-bb53-cd1877945189screenshot_2023-10-04T01-16-57-780543.png',
      'a969d5d0-6208-11ee-843c-3951256e06c9screenshot_2023-10-04T01-19-43-637254.png',
      'b765b320-6208-11ee-9d79-a50b6db3d7c0screenshot_2023-10-04T01-20-07-088032.png',
      'e773a400-6208-11ee-8230-51dcd077bed2screenshot_2023-10-04T01-21-27-722457.png',
      'f1dfa3d0-6208-11ee-88cb-3d37099482b6screenshot_2023-10-04T01-21-45-202915.png',
      'de003500-6208-11ee-820e-913eda9d8608screenshot_2023-10-04T01-21-11-859154.png',
      'd1ed3bf0-6208-11ee-81e8-c93a3f99da19screenshot_2023-10-04T01-20-51-599580.png',
      'fd214320-6208-11ee-bf68-21b8c92cc102screenshot_2023-10-04T01-22-04-089136.png',
      '04105130-6209-11ee-870b-45e79572692cscreenshot_2023-10-04T01-22-15-725995.png',
      'c6dbfb70-6208-11ee-9bd5-b778ec3ac651screenshot_2023-10-04T01-20-33-027509.png',
      '809d58c0-6208-11ee-9844-07e52ba6e7c0screenshot_2023-10-04T01-18-35-177441.png',
      '721037f0-6208-11ee-8c51-dd90f5f37593screenshot_2023-10-04T01-18-10-768341.png',
      '982c6210-6208-11ee-80ff-3de3088bb9e5screenshot_2023-10-04T01-19-14-711334.png'
    ]


    var selectSql = "SELECT parents_idx , col_ae  FROM tb_gyebukjeonggyecheon_child";
    var resObj = await run("renameFile", selectSql);

    // var list2 = [];
    // var list3 = [];
    // for (var i = 0; i < resObj.length; i++) {
    //   list2.push(resObj[i].col_ae);
    // }


    for (var j = 0; j < resObj.length; j++) {

      var exten = resObj[j].col_ae.split(".");
      // console.log('./uploads/cameraPnu/'+resObj[i].parents_idx+'.'+exten[1]);
      fs.rename('./uploads/workedImgV2/' + resObj[j].col_ae, './uploads/workedImgV2/' + resObj[j].parents_idx + "." + exten[1], function (err) {
        if (err) throw err;
        console.log('File Renamed!');
      });
    }
    // for (var i = 0; i < list.length; i++) {
    //   // fs.cp('./uploads/' + list[i], './uploads/workedImgV2/'+list[i], { recursive: true });
    //   fs.copyFileSync('./uploads/' + list[i], './uploads/workedImgV2/'+list[i]);



    // }

    // workedImgV2

    //   result.setHeader('Access-Control-Expose-Headers', "Content-Disposition"); //IMPORTANT FOR React.js content-disposition get Name
    //   result.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    //   result.setHeader("Content-Disposition", "attachment; filename=4574033521104170002.xlsx");
    //   return workbook.xlsx.write(result)
    //     .then(function () {
    //       result.end();
    //     });
    //   // })
  } catch (err) {
    logger.error(err)
    //   console.error('tb_gyebukjeonggyecheon_output/select Error!!', err);
    //   res.code = 2;
    //   res.msg = 'tb_gyebukjeonggyecheon_output Error';
    //   res.result = '';
    //   console.log("error: ", err);
    //   result(err, null);
    //   return;
  }
};



module.exports = Property;



