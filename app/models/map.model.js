const sql = require("./db.js");
const run = require('./runQuery');
const crypto = require('../config/crypto');
const nodemailer = require('nodemailer');

const logger = require('../config/winston');
const convert = require('xml-js');
const nodeHtmlToImage = require('node-html-to-image')
const fs = require('fs');
const imgToPDF = require('image-to-pdf')


// var client = require('../config/elastic.config.js');

// constructor
const Map = function (user) {
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


Map.ladfrlService = async (body, result) => {
  try {
    var pnu = body.pnu;

    // let response = doRequestLadfrlService(pnu);
    var url = 'http://apis.data.go.kr/1611000/nsdi/eios/LadfrlService/ladfrlList.xml';
    var queryParams = '?' + encodeURIComponent('serviceKey') + '=juNY%2B%2F%2By4i59wtF8hxpQ5U02NqKkXB%2FnQv7MHRoYMKXdlAHvcQCtEoBn2zoKeQjdT%2BPLPBFprpLLP1CqK3hOqQ%3D%3D'; /* Service Key*/
    queryParams += '&' + encodeURIComponent('pnu') + '=' + encodeURIComponent(pnu); /* */
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10'); /* */
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* */
    const util = require('util')
    const request = require("request");

    const requestPromise = util.promisify(request);
    const response = await requestPromise(url + queryParams);
    // console.log('response', response.body);
    // console.log(response);
    var xmlToJson = convert.xml2json(response.body, { compact: true, spaces: 4 });
    var x = JSON.parse(xmlToJson);
    // console.log(JSON.stringify(x.fields))
    var pnu = x.fields.ladfrlVOList.pnu._text;
    var ldCode = x.fields.ladfrlVOList.ldCode._text;
    var ldCodeNm = x.fields.ladfrlVOList.ldCodeNm._text;
    var mnnmSlno = x.fields.ladfrlVOList.mnnmSlno._text;
    var regstrSeCode = x.fields.ladfrlVOList.regstrSeCode._text;
    var regstrSeCodeNm = x.fields.ladfrlVOList.regstrSeCodeNm._text;
    var lndcgrCode = x.fields.ladfrlVOList.lndcgrCode._text;
    var lndcgrCodeNm = x.fields.ladfrlVOList.lndcgrCodeNm._text;
    var lndpclAr = x.fields.ladfrlVOList.lndpclAr._text;
    var posesnSeCode = x.fields.ladfrlVOList.posesnSeCode._text;
    var posesnSeCodeNm = x.fields.ladfrlVOList.posesnSeCodeNm._text;
    var cnrsPsnCo = x.fields.ladfrlVOList.cnrsPsnCo._text;
    var ladFrtlSc = x.fields.ladfrlVOList.ladFrtlSc._text;
    var ladFrtlScNm = x.fields.ladfrlVOList.ladFrtlScNm._text;
    var lastUpdtDt = x.fields.ladfrlVOList.lastUpdtDt._text;
    var resJson = {
      pnu: pnu,
      ldCode: ldCode,
      ldCodeNm: ldCodeNm,
      mnnmSlno: mnnmSlno,
      regstrSeCode: regstrSeCode,
      regstrSeCodeNm: regstrSeCodeNm,
      lndcgrCode: lndcgrCode,
      lndcgrCodeNm: lndcgrCodeNm,
      lndpclAr: lndpclAr,
      posesnSeCode: posesnSeCode,
      posesnSeCodeNm: posesnSeCodeNm,
      cnrsPsnCo: cnrsPsnCo,
      ladFrtlSc: ladFrtlSc,
      ladFrtlScNm: ladFrtlScNm,
      lastUpdtDt: lastUpdtDt,
    }
    res.code = 1;
    res.msg = 'ok';
    res.result = JSON.stringify(resJson);
    result(null, res);
    return;
  } catch (err) {
    logger.error(err)
    console.error('ladfrlService Error!!', err);
    res.code = 0;
    res.msg = 'no';
    res.result = '';
    console.log("error: ", err);
    result(err, null);
    return;
  }
};




Map.roadCenterLine = async (body, result) => {
  try {
    // const sql = "SELECT * FROM tb_road_center_line;"
    var lat = body.lat;
    var lng = body.lng;
    console.log("body")
    console.log(body)
    console.log("body")
    var sql = "SELECT * , ";
    sql += `(6371 * acos(cos(radians(?)) * cos(radians(y)) * cos(radians(x) - radians(?)) + sin(radians(?)) * sin(radians(y)))) `
    // sql += "AS distance FROM tb_road_center_line HAVING distance <= 1; ORDER BY idx";
    sql += "AS distance FROM tb_road_center_line HAVING distance <= 0.5; ";
    // sql += "AS distance FROM tb_road_center_line HAVING distance <= 1 ORDER BY distance LIMIT 0, 5;";
    var param = [lat, lng, lat];
    const resObj = await run("roadCenterLine", sql, param);
    if (resObj.length > 0) {
      // console.log(resObj)
      res.code = 1;
      res.msg = 'ok';
      res.result = JSON.stringify(resObj);
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
    console.error('roadCenterLine Error!!', err);
    res.code = 2;
    res.msg = 'roadCenterLine Error';
    res.result = '';
    console.log("error: ", err);
    result(err, null);
    return;
  }
};


Map.buildingTotalLine = async (body, result) => {
  try {
    var sql = "SELECT * FROM tb_place_inteligence_building";
    // sql += "AS distance FROM tb_building_line HAVING distance <= 1 ORDER BY distance LIMIT 0, 10;";
    const resObj = await run("buildingTotalLine", sql, '');
    // console.log(resObj)
    if (resObj.length > 0) {
      result(null, resObj);
      return;
    } else if (resObj.length == 0) {
      result(null, []);
      return;
    }
  } catch (err) {
    logger.error(err)
    console.error('buildingTotalLine Error!!', err);
    result(err, []);
    return;
  }
};
Map.insertNewBldExitMk = async (req, result) => {
  try {
    var door_uuid = req.body.door_uuid;
    var x = req.body.x;
    var y = req.body.y;
    var user_uuid = req.body.user_uuid;
    var address = req.body.address;
    var pnu_addr = req.body.pnu_addr;
    var sqlFlag = req.body.sqlFlag;
    var sql = "";
    var param = [];
    if (sqlFlag == "add") {
      sql = "INSERT INTO tb_door_list (door_uuid ,x ,y ,user_uuid ,address ,pnu_addr) VALUE (?,?,?,?,?,?)";
      param = [door_uuid, x, y, user_uuid, address, pnu_addr];
    } else if (sqlFlag == "del") {
      sql = "DELETE FROM tb_exit_door_list WHERE doorUuid = ? ";
      param = [door_uuid];
    } else if (sqlFlag == 'edit') {
      sql = "UPDATE tb_door_list SET x = ? , y = ? WHERE door_uuid = ? ";
      param = [x, y, door_uuid];
    }
    const resObj = await run(sqlFlag + "_insertNewBldExitMk", sql, param);
    result(null, resObj);
    return;
  } catch (err) {
    logger.error(err)
    console.error(sqlFlag + "_insertNewBldExitMk Error!!", err);
    result(err, []);
    return;
  }
};

Map.getBldDoorInfo = async (body, result) => {
  try {
    var door_uuid = body.query.door_uuid;
    console.log(body.query);
    var sql = "SELECT * FROM tb_exit_door_list where doorUuid = ? ";
    console.log(sql);
    // sql += "AS distance FROM tb_building_line HAVING distance <= 1 ORDER BY distance LIMIT 0, 10;";
    const resObj = await run("buildingTotalLine", sql, door_uuid);
    console.log(resObj)
    var responseObj = {
      data: resObj
    }
    if (resObj.length > 0) {
      // result(null, responseObj);
      result(null, resObj);
      return;
    } else if (resObj.length == 0) {
      // result(null, responseObj.data = []);
      result(null, resObj);
      return;
    }
  } catch (err) {
    logger.error(err)
    console.error('buildingTotalLine Error!!', err);
    result(err, []);
    return;
  }
};
Map.getBldDoorList = async (body, result) => {
  try {
    // console.log(body);
    var pnu = body.query.pnu;
    console.log(pnu)
    var sql = "SELECT * FROM tb_exit_door_list where pnu = ?";
    // sql += "AS distance FROM tb_building_line HAVING distance <= 1 ORDER BY distance LIMIT 0, 10;";
    const resObj = await run("buildingTotalLine", sql, pnu);
    console.log("resObj")
    console.log(resObj)
    console.log("resObj")
    var responseObj = {
      data: resObj
    }
    if (resObj.length > 0) {
      // result(null, responseObj);
      result(null, resObj);
      return;
    } else if (resObj.length == 0) {
      // result(null, responseObj.data = []);
      result(null, resObj);
      return;
    }
  } catch (err) {
    logger.error(err)
    console.error('buildingTotalLine Error!!', err);
    result(err, []);
    return;
  }
};
Map.getAppInfo = async (body, result) => {
  try {
    // console.log(body);
    var flag = body.query.flag;
    console.log(flag)
    var sql = "";
    if (flag == "v") {
      sql = "SELECT infoValue FROM tb_place_inteligence_app_info where flagKey = 'appVersion' ";
    } else if (flag == "p") {
      sql = "SELECT infoValue FROM tb_place_inteligence_app_info where flagKey = 'appPw' ";
    } else {
      sql = "SELECT * FROM tb_place_inteligence_app_info where pnu = ?";
    }

    // sql += "AS distance FROM tb_building_line HAVING distance <= 1 ORDER BY distance LIMIT 0, 10;";
    const resObj = await run("getAppInfo", sql, []);
    console.log("resObj")
    console.log(resObj)
    console.log("resObj")
    var responseObj = {
      data: resObj
    }
    if (resObj.length > 0) {
      // result(null, responseObj);
      result(null, resObj);
      return;
    } else if (resObj.length == 0) {
      // result(null, responseObj.data = []);
      result(null, resObj);
      return;
    }
  } catch (err) {
    logger.error(err)
    console.error('buildingTotalLine Error!!', err);
    result(err, []);
    return;
  }
};



Map.saveDoorPositin = async (req, result) => {
  try {
    function dateFormat(date) {
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let hour = date.getHours();
      let minute = date.getMinutes();
      let second = date.getSeconds();

      month = month >= 10 ? month : '0' + month;
      day = day >= 10 ? day : '0' + day;
      hour = hour >= 10 ? hour : '0' + hour;
      minute = minute >= 10 ? minute : '0' + minute;
      second = second >= 10 ? second : '0' + second;

      return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    }
    // console.log(req);
    var list = req.body;
    let today = new Date();
    var insertList = [];
    if (list.length > 0) {
      for (var i = 0; i < list.length; i++) {
        var jsono = JSON.parse(list[i]);
        insertList.push([jsono.lat, jsono.lng, jsono.doorUuid, dateFormat(today), jsono.pnu + '', jsono.iconType])
      }
    }
    var insertSQL = "insert into tb_exit_door_list(lat ,lng ,doorUuid ,date ,pnu ,iconType) value ? ";
    // "insert into tb_exit_door_list(idx ,lat ,lng ,doorUuid ,date ,pnu ,iconType) value 
    // (36.4777267, 127.28805145457555, '1715412310042', '2024-05-11 17:20:10', 216, '화물승강기'), 
    // (36.47771797241175, 127.28794135655225, '1715412321122', '2024-05-11 17:20:10', 216, '회전문'),
    //  (36.47783723450992, 127.28798852965566, '1715412333152', '2024-05-11 17:20:10', 216, '여닫이문') "
    const resObj = await run("saveDoorPositin", insertSQL, [insertList]);
    console.log(resObj)
    // result(null, responseObj);
    result(null, true);
    return;
  } catch (err) {
    logger.error(err)
    console.error('saveDoorPositin Error!!', err);
    result(err, false);
    return;
  }
};
Map.saveDoorExitLine = async (req, result) => {
  try {
    // console.log(req);
    var uuid = req.body.uuid;
    console.log(req.body);
    var exitLoad = req.body.exitLoad;
    var updateSQL = "UPDATE tb_exit_door_list SET exitLoad = ?  WHERE doorUuid = ? ";
    var updateParm = [exitLoad, uuid]
    // "insert into tb_exit_door_list(idx ,lat ,lng ,doorUuid ,date ,pnu ,iconType) value 
    // (36.4777267, 127.28805145457555, '1715412310042', '2024-05-11 17:20:10', 216, '화물승강기'), 
    // (36.47771797241175, 127.28794135655225, '1715412321122', '2024-05-11 17:20:10', 216, '회전문'),
    //  (36.47783723450992, 127.28798852965566, '1715412333152', '2024-05-11 17:20:10', 216, '여닫이문') "
    const resObj = await run("saveDoorExitLine", updateSQL, updateParm);
    console.log(resObj)
    // result(null, responseObj);
    result(null, true);
    return;
  } catch (err) {
    logger.error(err)
    console.error('saveDoorExitLine Error!!', err);
    result(err, false);
    return;
  }
};


Map.getBuildingInfo = async (body, result) => {
  try {
    // console.log(body);
    var idx = body.query.idx;
    var sql = "SELECT * FROM tb_place_inteligence_building where idx = ?";
    // sql += "AS distance FROM tb_building_line HAVING distance <= 1 ORDER BY distance LIMIT 0, 10;";
    const resObj = await run("getBuildingInfo", sql, idx);
    console.log(resObj)
    var responseObj = {
      data: resObj
    }
    if (resObj.length > 0) {
      // result(null, responseObj);
      result(null, resObj);
      return;
    } else if (resObj.length == 0) {
      // result(null, responseObj.data = []);
      result(null, resObj);
      return;
    }
  } catch (err) {
    logger.error(err)
    console.error('getBuildingInfo Error!!', err);
    result(err, []);
    return;
  }
};

Map.buildingLine = async (body, result) => {
  try {
    // const sql = "SELECT * FROM tb_road_center_line;"
    var lat = body.lat;
    var lng = body.lng;
    // console.log(body)
    var sql = "SELECT * , ";
    sql += `(6371 * acos(cos(radians(?)) * cos(radians(y)) * cos(radians(x) - radians(?)) + sin(radians(?)) * sin(radians(y)))) `
    sql += "AS distance FROM tb_building_line HAVING distance <= 1 ORDER BY distance;";
    // sql += "AS distance FROM tb_building_line HAVING distance <= 1 ORDER BY distance LIMIT 0, 10;";
    var param = [lat, lng, lat];
    const resObj = await run("buildingLine", sql, param);
    // console.log(resObj)
    if (resObj.length > 0) {
      // console.log(resObj)
      res.code = 1;
      res.msg = 'ok';
      res.result = JSON.stringify(resObj);
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
    console.error('tb_building_line Error!!', err);
    res.code = 2;
    res.msg = 'tb_building_line Error';
    res.result = '';
    console.log("error: ", err);
    result(err, null);
    return;
  }
};


Map.mkpdf2 = async (req, result) => {
  try {
    function generateRandomCode(n) {
      let str = ''
      for (let i = 0; i < n; i++) {
        str += Math.floor(Math.random() * 10)
      }
      return str
    }
    console.log(req.body);
    var list1 = ['건물군', '건물'];
    var list2 = ["주출입구", "보조출입구", "동출입구", "주차창출입구", "주차장입구", "주차장출구"]
    var list3 = ["수평접근", "경사로", "계단", "계단/경사로", "자동계단", "엘리베이터", "사용안함", "화물승강기"];
    var list4 = ["여닫이문", "미닫이문", "회전문", "접이문", "개방형", "계단/경사로", "출입제한높이"];
    var list5 = ["자동", "수동"];
    var list6 = ["인원보안", "차량보안", "전체보안", "무"];

    var idx = req.body.idx;
    var lat = req.body.lat;
    var lng = req.body.lng;

    var doorUuid = req.body.doorUuid;
    var userUuid = req.body.userUuid;
    var date = req.body.date;
    var serialNumber = req.body.serialNumber;
    var team = req.body.team;
    var addr = req.body.addr;
    var pnu = req.body.pnu;
    var bldNm = req.body.bldNm;
    var bldNm2 = req.body.bldNm2;
    var doorPlace = req.body.doorPlace;
    var doorType = req.body.doorType;
    var enterType = req.body.enterType;
    var doorKind = req.body.doorKind;
    var openType = req.body.openType;
    var securityType = req.body.securityType;
    var doorNm = req.body.doorNm;
    var doorHeight = req.body.doorHeight;
    var doorFloor = req.body.doorFloor;
    var locationNm = req.body.locationNm;
    var planImg = req.body.planImg;
    var doorImg = req.body.doorImg;
    var pdfImg = req.body.pdfImg;
    var exitLoad = req.body.exitLoad;
    var iconType = req.body.iconType;
    {/* <p>check &#x2B1B;</p>

<p>unckeck &#x2B1C;</p> */}

    const file = "test.html";
    let today = new Date();
    var todayStr = today.toLocaleDateString();
    var randomNum = generateRandomCode(10);
    var data = "";
    var dumydata = "";
    data += ' <!DOCTYPE html>'
    data += ' <html>'
    data += ' <head>'
    data += ' <meta charset="utf-8" />'
    data += ' <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />'
    data += ' </head>'
    data += ' <body>'
    data += ' <style type="text/css">'
    data += ' .tg  {border-collapse:collapse;border-spacing:0;}'
    data += ' .tg td{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;'
    data += '   overflow:hidden;padding:10px 5px;word-break:normal;}'
    data += ' .tg th{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;'
    data += '   font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}'
    data += ' .tg .tg-baqh{text-align:center;vertical-align:top}'
    data += ' .tg .tg-bn4o{font-size:18px;font-weight:bold;text-align:center;vertical-align:top}'
    data += ' .tg .tg-u1yq{background-color:#c0c0c0;font-weight:bold;text-align:center;vertical-align:top}'
    data += ' .tg .tg-0lax{text-align:left;vertical-align:top}'
    data += ' </style>'
    data += ' <table class="tg" style="undefined;table-layout: fixed; width: 100%">'
    data += ' <colgroup>'
    data += ' <col style="width: 176px">'
    data += ' <col style="width: 176px">'
    data += ' <col style="width: 176px">'
    data += ' <col style="width: 176px">'
    data += ' </colgroup>'
    data += ' <thead>'
    data += '   <tr>'
    data += '     <th class="tg-bn4o" colspan="4">현장조사 보고서</th>'
    data += '   </tr>'
    data += ' </thead>'
    data += ' <tbody>'
    data += '  <tr>'
    data += '    <td class="tg-u1yq">조사일</td>'
    data += `    <td class="tg-0lax">${todayStr}</td>`
    data += '    <td class="tg-u1yq">일련번호</td>'
    data += `    <td class="tg-0lax">${randomNum}</td>`
    data += '  </tr>'
    data += '  <tr>'
    data += '    <td class="tg-u1yq">조사팀</td>'
    data += '    <td class="tg-0lax" colspan="3">1팀 (A,B)</td>'
    data += '  </tr>'
    data += '  <tr>'
    data += '    <td class="tg-u1yq">주소</td>'
    data += `    <td class="tg-0lax" colspan="3">${addr}</td>`
    data += '  </tr>'
    data += '  <tr>'
    data += '    <td class="tg-u1yq">견물명</td>'
    data += '    <td class="tg-0lax"></td>'
    data += '    <td class="tg-u1yq">부건물명</td>'
    data += '    <td class="tg-0lax"></td>'
    data += '  </tr>'
    data += '  <tr>'
    data += '    <td class="tg-u1yq">출입구 위치</td>'
    data += '    <td class="tg-0lax" colspan="3">'
    dumydata = "";
    for (var i = 0; i < list1.length; i++) {
      if (doorPlace == list1[i]) {
        dumydata += ' <span>&#x2B1B;</span> ' + list1[i]
        dumydata += ' &nbsp&nbsp&nbsp'
      } else {
        dumydata += ' <span>&#x2B1C;</sapn> ' + list1[i]
      }
    }
    data += dumydata;
    data += ' </td>'
    data += '  </tr>'
    data += '  <tr>'
    data += '    <td class="tg-u1yq">출입구 유형</td>'
    data += '    <td class="tg-0lax" colspan="3">'
    dumydata = "";
    for (var i = 0; i < list2.length; i++) {
      if (doorType == list2[i]) {
        dumydata += ' <span>&#x2B1B;</span> ' + list2[i]
        dumydata += ' &nbsp&nbsp&nbsp'
      } else {
        dumydata += ' <span>&#x2B1C;</sapn> ' + list2[i]
      }
    }
    data += dumydata;
    data += ' </td>'
    data += '  </tr>'
    data += '  <tr>'
    data += '    <td class="tg-u1yq">진입로 형태</td>'
    data += '    <td class="tg-0lax" colspan="3">'
    dumydata = "";
    for (var i = 0; i < list3.length; i++) {
      if (enterType == list3[i]) {
        dumydata += ' <span>&#x2B1B;</span> ' + list3[i]
        dumydata += ' &nbsp&nbsp&nbsp'
      } else {
        dumydata += ' <span>&#x2B1C;</sapn> ' + list3[i]
      }
    }
    data += dumydata;
    data += ' </td>'
    data += '  </tr>'
    data += '  <tr>'
    data += '    <td class="tg-u1yq">출입문 형태</td>'
    data += '    <td class="tg-0lax" colspan="3">'
    dumydata = "";
    for (var i = 0; i < list4.length; i++) {
      if (doorKind == list4[i]) {
        dumydata += ' <span>&#x2B1B;</span> ' + list4[i]
        dumydata += ' &nbsp&nbsp&nbsp'
      } else {
        dumydata += ' <span>&#x2B1C;</sapn> ' + list4[i]
      }
    }
    data += dumydata;
    data += ' </td>'
    data += '  </tr>'
    data += '  <tr>'
    data += '    <td class="tg-u1yq">개폐 방식</td>'
    data += '    <td class="tg-0lax" colspan="3">'
    dumydata = "";
    for (var i = 0; i < list5.length; i++) {
      if (openType == list5[i]) {
        dumydata += ' <span>&#x2B1B;</span> ' + list5[i]
        dumydata += ' &nbsp&nbsp&nbsp'
      } else {
        dumydata += ' <span>&#x2B1C;</sapn> ' + list5[i]
      }
    }
    data += dumydata;
    data += ' </td>'
    data += '  </tr>'
    data += '  <tr>'
    data += '    <td class="tg-u1yq">권한구분 </td>'
    data += '    <td class="tg-0lax" colspan="3">'
    dumydata = "";
    for (var i = 0; i < list6.length; i++) {
      if (securityType == list6[i]) {
        dumydata += ' <span>&#x2B1B;</span> ' + list6[i]
        dumydata += ' &nbsp&nbsp&nbsp'
      } else {
        dumydata += ' <span>&#x2B1C;</sapn> ' + list6[i]
      }
    }
    data += dumydata;
    data += ' </td>'
    data += '  </tr>'
    data += '  <tr>'
    data += '    <td class="tg-u1yq">출입구 명칭</td>'
    data += `    <td class="tg-0lax">${doorNm}</td>`
    data += '    <td class="tg-u1yq">출입구 제한 높이</td>'
    data += `    <td class="tg-0lax">${doorHeight}</td>`
    data += '  </tr>'
    data += '  <tr>'
    data += '    <td class="tg-u1yq">출입구 층수</td>'
    data += `    <td class="tg-0lax">${doorFloor}</td>`
    data += '    <td class="tg-u1yq">장소명</td>'
    data += `    <td class="tg-0lax">${locationNm}</td>`
    data += '  </tr>'
    data += '  <tr>'
    data += '    <td class="tg-u1yq" colspan="2">현장 위치 정보</td>'
    data += '    <td class="tg-u1yq" colspan="2">현장사진</td>'
    data += '  </tr>'
    data += '  <tr>'
    data += '    <td class="tg-baqh" colspan="2" rowspan="3">'
    data += ' <img style="max-width:100%; height:auto;"'
    data += ` src= "http://dosiwa.iptime.org:24000/camImg/placeInteligenceBuild/${planImg}"`
    data += ' alt="Grapefruit slice atop a pile of other slices"></td>'
    data += '    <td class="tg-baqh" colspan="2" rowspan="3">'
    data += ' <img style="max-width:100%; height:auto;"'
    data += ` src= "http://dosiwa.iptime.org:24000/camImg/placeInteligenceBuild/${doorImg}"`
    data += ' alt="Grapefruit slice atop a pile of other slices"></td>'
    data += '  </tr>'
    data += '  <tr>'
    data += '  </tr>'
    data += '  <tr>'
    data += '  </tr>'
    data += ' </tbody>'
    data += ' </table>'
    data += ' </body>'
    data += ' </html>;'
    // var thumbnailimage = doorUuid + userUuid + "_image"
    var thumbnailimage = doorUuid + "_image"

    nodeHtmlToImage({
      output: './uploads/placeInteligenceBuild/thumbnail/' + thumbnailimage + ".png",
      html: data
    })
      .then(async () => {
        const pages = [
          fs.readFileSync('./uploads/placeInteligenceBuild/thumbnail/' + thumbnailimage + ".png") // Buffer
        ]
        imgToPDF(pages, imgToPDF.sizes.A4)
          .pipe(fs.createWriteStream('./uploads/placeInteligenceBuild/thumbnail/' + thumbnailimage + '.pdf'));

        var formatedMysqlString = (new Date((new Date((new Date(new Date())).toISOString())).getTime() - ((new Date()).getTimezoneOffset() * 60000))).toISOString().slice(0, 19).replace('T', ' ');


        // const insertSql = `insert into tb_exit_door_list (
        //   lat
        //   ,lng
        //   ,doorUuid
        //   ,userUuid
        //   ,date
        //   ,serialNumber
        //   ,team
        //   ,addr
        //   ,pnu
        //   ,bldNm
        //   ,bldNm2
        //   ,doorPlace
        //   ,doorType
        //   ,enterType
        //   ,doorKind
        //   ,openType
        //   ,securityType
        //   ,doorNm
        //   ,doorHeight
        //   ,doorFloor
        //   ,locationNm
        //   ,planImg
        //   ,doorImg
        //   ,pdfImg
        //   ,exitLoad
        //   ,iconType
        // )
        // value (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        var insertSql = `
        INSERT INTO tb_exit_door_list (
          idx 
          ,lat
          ,lng
          ,doorUuid
          ,userUuid
          ,date
          ,serialNumber
          ,team
          ,addr
          ,pnu
          ,bldNm
          ,bldNm2
          ,doorPlace
          ,doorType
          ,enterType
          ,doorKind
          ,openType
          ,securityType
          ,doorNm
          ,doorHeight
          ,doorFloor
          ,locationNm
          ,planImg
          ,doorImg
          ,pdfImg
          ,exitLoad
          ,iconType
         ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ) ON DUPLICATE KEY UPDATE 
         lat = ?
         ,lng = ?
         ,doorUuid = ?
         ,userUuid = ?
         ,date = ?
         ,serialNumber = ?
         ,team = ?
         ,addr = ?
         ,pnu = ?
         ,bldNm = ?
         ,bldNm2 = ?
         ,doorPlace = ?
         ,doorType = ?
         ,enterType = ?
         ,doorKind = ?
         ,openType = ?
         ,securityType = ?
         ,doorNm = ?
         ,doorHeight = ?
         ,doorFloor = ?
         ,locationNm = ?
         ,planImg = ?
         ,doorImg = ?
         ,pdfImg = ?
         ,exitLoad = ?
         ,iconType = ? `;
        var param = [
          idx
          , lat
          , lng
          , doorUuid
          , userUuid
          , date
          , serialNumber
          , team
          , addr
          , pnu
          , bldNm
          , bldNm2
          , doorPlace
          , doorType
          , enterType
          , doorKind
          , openType
          , securityType
          , doorNm
          , doorHeight
          , doorFloor
          , locationNm
          , planImg
          , doorImg
          , thumbnailimage
          , exitLoad
          , iconType

          , lat
          , lng
          , doorUuid
          , userUuid
          , date
          , serialNumber
          , team
          , addr
          , pnu
          , bldNm
          , bldNm2
          , doorPlace
          , doorType
          , enterType
          , doorKind
          , openType
          , securityType
          , doorNm
          , doorHeight
          , doorFloor
          , locationNm
          , planImg
          , doorImg
          , thumbnailimage
          , exitLoad
          , iconType
        ];
        await run("mkpdf", insertSql, param);

        var updatesql = "UPDATE tb_place_inteligence_building SET workFlag = 1 WHERE pnu = ? ";
        var updateparam = [pnu];
        await run("mkpdf", updatesql, updateparam);
        res.code = 1;
        res.msg = 'ok';
        res.result = [];
        result(null, res);
        return;
        // fs.writeFile("./uploads/" + file, data, async (err) => {
        //   if (err) {
        //     res.code = 0;
        //     res.msg = 'file mkdir Error';
        //     res.result = err.message;
        //     console.log("error: ", err);
        //     result(err, null);
        //     return;
        //   } else {
        //     (async () => {
        //       try {

        //         // Create a browser instance
        //         const browser = await puppeteer.launch();

        //         // Create a new page
        //         const page = await browser.newPage();

        //         //Get HTML content from HTML file
        //         const html = fs.readFileSync('./uploads/' + file, 'utf-8');
        //         await page.setContent(html, { waitUntil: 'domcontentloaded' });

        //         // To reflect CSS used for screens instead of print
        //         await page.emulateMediaType('screen');

        //         // Downlaod the PDF
        //         const pdf = await page.pdf({
        //           path: './uploads/result.pdf',
        //           margin: { top: '50px', right: '50px', bottom: '50px', left: '50px' },
        //           printBackground: true,
        //           format: 'A4',
        //         });

        //         // Close the browser instance
        //         await browser.close();
        //       } catch (error) {
        //         console.loo(error)
        //       }
        //     })();
        //   }

        // });
      })


    // await run(updateSql, param);


  } catch (err) {
    logger.error(err)
    console.error('file change Error!!', err);
    res.code = 0;
    res.msg = 'file change Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};




module.exports = Map;
