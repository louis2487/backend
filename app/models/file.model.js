const sql = require("./db.js");
const run = require('./runQuery');
const multer = require('multer');
const fs = require('fs');
const puppeteer = require('puppeteer');
const nodeHtmlToImage = require('node-html-to-image')
const imgToPDF = require('image-to-pdf')
const logger = require('../config/winston');

// constructor
const FileModel = function (user) {
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

// app.post('/route/api/upload', upload.single('image'), async (req, res, next) => {


//   let data = { companyName: req.body['companyName'], id: req.body['id'], imageUrl: req.file.path };

//   let sql = `INSERT INTO DataTable SET ? `;

//   db.query(sql, data, (insertionErr, insertionResult) => {
//     if (insertionErr) {
//       console.log(insertionErr);
//       throw insertionErr;
//     }
//     else {
//       console.log(insertionResult);
//       res.send(insertionResult);
//     }

//   });



// });

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname)
//   }
// })
FileModel.upload = async (body, result) => {
  var uuid = body.body.uuid;
  var uploadFlag = body.body.uploadFlag;
  var fileName = body.file.filename;
  var filePath = body.file.path;

  try {
    if (uploadFlag == -1) {

      const insertSql = "insert into tb_image_list (uuid, originFileName, originFilePath) value (?,?,?)";
      param = [uuid, fileName, filePath];
      const insertQuery = await run("upload",insertSql, param);
      console.log((insertQuery.insertId).toString());
      res.code = 1;
      res.msg = (insertQuery.insertId).toString();
      result(null, res);
    } else {
      const updateSql = "update tb_image_list set originFileName = ? , originFilePath = ? where idx = ?";
      param = [fileName, filePath, uploadFlag];
      const updateQuery = await run("upload",updateSql, param);
      res.code = 1;
      res.msg = 'ok';
      result(null, res);
      return;
    }
    // const selectSql = "select * from tb_image_list where uuid = ?";
    // var param = [uuid];
    // const selectQuery = await run(selectSql, param);
    // if (selectQuery.length > 0) {
    //   const updateSql = "update tb_image_list set originFileName = ? , originFilePath = ? where uuid = ?";
    //   param = [fileName, filePath, uuid];
    //   const updateQuery = await run(updateSql, param);
    //   res.code = 1;
    //   res.msg = 'ok';
    //   result(null, res);
    //   return;
    // } else if (selectQuery.length == 0) {
    //   const insertSql = "insert into tb_image_list (uuid, originFileName, originFilePath) value (?,?,?)";
    //   param = [uuid, fileName, filePath];
    //   const insertQuery = await run(insertSql, param);
    //   res.code = 1;
    //   res.msg = 'ok';
    //   result(null, res);
    // }
  } catch (error) {
    logger.error(error)
    console.error('file upload up/ insert Error!!', error);
    res.code = 0;
    res.msg = 'file upload up/ insert';
    res.result = [];
    result(null, res);
    return;
  }
};


FileModel.uploadPaint = async (req, result) => {
  try {
    // var workName = req.body.workName;
    // var workType = req.body.workType;
    // var workCont = req.body.workCont;
    // var workDate = req.body.workDate;
    // var location = req.body.location;
    // var selectedImage = req.body.selectedImage;
    // var originFileName = req.body.originFileName;
    // var constructionUuid = req.body.constructionUuid;
    console.log("uploadPaint")
    console.log(req.body.uuid)
    console.log("uploadPaint")
    var uuid = req.body.uuid;
    var pngBase64 = req.body.pngBase64;
    var fileName = req.body.fileName;
    var base64Data = pngBase64.replace(/^data:image\/png;base64,/, "");
    fs.writeFile("./uploads/" + fileName, base64Data, 'base64', function (err) {
      // console.log("ASasdfasdfasdfasdfasdfasdf")
      // console.log(err);
      // console.log("ASasdfasdfasdfasdfasdfasdf")
      if (!err) {
        const updateSQL = "update tb_image_list set paintFileName = ?, paintFilePath = ?  where uuid = ?";
        var param = [fileName, "uploads/" + fileName, uuid];
        const upObj = run("uploadPaint",updateSQL, param);
        // console.log(updateSQL);
        // console.log(upObj);
        res.code = 1;
        res.msg = 'ok';
        res.result = upObj;
        result(null, res);
        return;
      } else {
        res.code = 0;
        res.msg = 'no';
        console.log(err)
        result(err, null);
        return;
      }
    });
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

FileModel.uploadBldImg = async (req, result) => {
  try {
    var idx = req.body.idx;
    var uuid = req.body.uuid;
    var pngBase64 = req.body.pngBase64;
    var fileName = req.body.fileName;
    var saveFlag = req.body.saveFlag;
    var delecteIdx = "select * from tb_exit_door_list where idx = ?";
    var delectParm = [idx];
    var delCnt = await run("delCtn",delecteIdx, delectParm);
    var delPath = "";
    if(delCnt.length > 0 ){
      if(saveFlag == "planImg"){
        delPath = "./uploads/placeInteligenceBuild/"+delCnt[0].planImg;
      }else if(saveFlag == "doorImg"){
        delPath = "./uploads/placeInteligenceBuild/"+delCnt[0].doorImg;
      }
  
    }
    // return;
    var base64Data = pngBase64.replace(/^data:image\/png;base64,/, "");
    fs.writeFile("./uploads/placeInteligenceBuild/" + fileName, base64Data, 'base64', function (err) {
      // console.log("ASasdfasdfasdfasdfasdfasdf")
      // console.log(err);
      // console.log("ASasdfasdfasdfasdfasdfasdf")
      if (!err) {
        const updateSQL = "INSERT INTO tb_exit_door_list (idx, "+saveFlag+" ) VALUES ( ?, ? ) ON DUPLICATE KEY UPDATE "+saveFlag+" = ? "
        // var param = [fileName, "uploads/placeInteligenceBuild/" + fileName, uuid];
        var param = [idx,  fileName, fileName];
        const upObj = run("uploadPaint",updateSQL, param);
        console.log(updateSQL);
        // console.log(upObj);
        res.code = 1;
        res.msg = 'ok';
        res.result = upObj;
        result(null, res);
        try {
          fs.unlinkSync(delPath);
        } catch (error) {
          
        }
        return;
      } else {
        res.code = 0;
        res.msg = 'no';
        console.log(err)
        result(err, null);
        try {
          fs.unlinkSync(delPath);
        } catch (error) {
          
        }
        return;
      }
    });
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

FileModel.mkSticker = async (req, result) => {
  try {
    var byte = req.body.pngByte;
    var name = req.body.name;

    fs.writeFile('./uploads/' + name + '.png', Buffer.from(byte), 'binary', (err) => {
      if (err) {
        res.code = 0;
        res.msg = 'file mkSticker Error';
        res.result = err.message;
        result(err, null);
        return;
      }
      else {
        res.code = 1;
        res.msg = 'ok';
        result(null, res);
        return;
      }
    });
  } catch (err) {
    logger.error(err)
    console.error('file mkSticker uploadPaint up/ update Error!!', err);
    res.code = 0;
    res.msg = 'file mkSticker Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};

FileModel.delete = async (req, result) => {
  try {
    var idx = req.body.idx;
    const selectSql = "select * from tb_image_list where idx = ?";
    var param = [idx];
    const resObj = await run("delete",selectSql, param);
    try {
      if (resObj.length > 0) {
        // fs.unlinkSync("./" + resObj[0].originFilePath);
        const deleteSql = "update tb_image_list set deleteFlag = 'del', uuid = concat(uuid,'_del') where idx = ?";
        param = [idx];
        await run("delete",deleteSql, param);
        res.code = 1;
        res.msg = 'ok';
        res.result = [];
        result(null, res);
        return;
      }

    } catch (error) {
      logger.error(error)
      res.code = 0;
      res.msg = 'file delete Error';
      res.result = error.message;
      console.log("error: ", error);
      result(error, null);
      return;
    }
  } catch (err) {
    logger.error(err)
    console.error('file delete Error!!', err);
    res.code = 0;
    res.msg = 'file delete Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};

FileModel.change = async (req, result) => {
  try {
    var boadUuid = req.body.boadUuid;
    var idx = req.body.idx;
    const updateSql = "update tb_image_list set uuid = ? where idx = ?";
    param = [boadUuid, idx];
    await run("change",updateSql, param);
    res.code = 1;
    res.msg = 'ok';
    res.result = [];
    result(null, res);
    return;

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


FileModel.mkpdf = async (req, result) => {
  try {
    function generateRandomCode(n) {
      let str = ''
      for (let i = 0; i < n; i++) {
        str += Math.floor(Math.random() * 10)
      }
      return str
    }
    var list1 = ['건물군', '건물'];
    var list2 = ["혼용(차량+보행)", "차량", "보행"];
    var list3 = ["수평접근", "경사로", "계단", "계단/경사로"];
    var list4 = ["여닫이문", "미닫이문", "회전문", "접이문", "기타(개방형)", "계단/경사로"];
    var list5 = ["자동", "수동"];
    var list6 = ["유", "무"];
    var imageDoorPointAddr = req.body.imageDoorPointAddr;
    var doorPlaceControllerText = req.body.doorPlaceControllerText;
    var doorTypeControllerText = req.body.doorTypeControllerText;
    var enterTypeControllerText = req.body.enterTypeControllerText;
    var doorKindControllerText = req.body.doorKindControllerText;
    var openTypeControllerText = req.body.openTypeControllerText;
    var userTypeControllerText = req.body.userTypeControllerText;
    var locationControllerText = req.body.locationControllerText;
    var imageServerAddr = req.body.imageServerAddr;
    var clickedBuildingIdx = req.body.clickedBuildingIdx;
    var clickedGeoPnu = req.body.clickedGeoPnu;
    var clickedGooIndex = req.body.clickedGooIndex;
    var doorX = req.body.doorX;
    var doorY = req.body.doorY;
    var userUuid = req.body.userUuid;
    var doorUuid = req.body.doorUuid;
    console.log(imageServerAddr)
    console.log(imageServerAddr)
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
    data += `    <td class="tg-0lax" colspan="3">${locationControllerText}</td>`
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
      if (doorPlaceControllerText == list1[i]) {
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
      if (doorTypeControllerText == list2[i]) {
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
      if (enterTypeControllerText == list3[i]) {
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
      if (doorKindControllerText == list4[i]) {
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
      if (openTypeControllerText == list5[i]) {
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
    data += '    <td class="tg-u1yq">사용자 구분 </td>'
    data += '    <td class="tg-0lax" colspan="3">'
    dumydata = "";
    for (var i = 0; i < list6.length; i++) {
      if (userTypeControllerText == list6[i]) {
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
    data += '    <td class="tg-u1yq" colspan="2">현장 위치 정보</td>'
    data += '    <td class="tg-u1yq" colspan="2">현장사진</td>'
    data += '  </tr>'
    data += '  <tr>'
    data += '    <td class="tg-baqh" colspan="2" rowspan="3">'
    data += ' <img style="max-width:100%; height:auto;"'
    data += ` src= "${imageDoorPointAddr}"`
    data += ' alt="Grapefruit slice atop a pile of other slices"></td>'
    data += '    <td class="tg-baqh" colspan="2" rowspan="3">'
    data += ' <img style="max-width:100%; height:auto;"'
    data += ` src= "${imageServerAddr}"`
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
    var thumbnailimage = doorUuid + userUuid + "_image"

    nodeHtmlToImage({
      output: './uploads/' + thumbnailimage + ".png",
      html: data
    })
      .then(async () => {
        const pages = [
          fs.readFileSync('./uploads/' + thumbnailimage + ".png") // Buffer
        ]
        imgToPDF(pages, imgToPDF.sizes.A4)
          .pipe(fs.createWriteStream('./uploads/' + thumbnailimage + '.pdf'));

        var formatedMysqlString = (new Date((new Date((new Date(new Date())).toISOString())).getTime() - ((new Date()).getTimezoneOffset() * 60000))).toISOString().slice(0, 19).replace('T', ' ');


        const insertSql = `insert into tb_door_list (
        x,
        y,
        door_uuid,
        user_uuid,
        geocode_uuid,
        building_uuid,
        date,
        serial_number,
        team,
        address,
        pnu_addr,
        building_name,
        building_name_2,
        door_place,
        door_type,
        enter_type,
        door_kind,
        open_type,
        user_type,
        foor_plan_image,
        door_image,
        thumbnail)
        value ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        var param = [
          doorX,
          doorY,
          doorUuid,
          userUuid,
          clickedGooIndex,
          clickedBuildingIdx,
          formatedMysqlString,
          randomNum,
          "1팀 (A,B)",
          locationControllerText,
          clickedGeoPnu,
          "",
          "",
          doorPlaceControllerText,
          doorTypeControllerText,
          enterTypeControllerText,
          doorKindControllerText,
          openTypeControllerText,
          userTypeControllerText,
          imageDoorPointAddr,
          imageServerAddr,
          thumbnailimage
        ];
        await run("mkpdf",insertSql, param);
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

module.exports = FileModel;
