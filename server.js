const express = require("express");
// const bodyParser = require("body-parser"); /* deprecated */
const cors = require("cors");
const bodyParser = require('body-parser');
var path = require('path');
const fs = require('fs')
const app = express();
const { Worker } = require("worker_threads");

const run = require('./app/models/runQuery');

// var client = require('./app/config/elastic.config.js');


// client.cluster.health({},function(err,resp, status){
//   console.log('-- client health -- ', resp.statusCode);
// })

var corsOptions = {
  // origin: "http://localhost:8081"
  origin: '*',
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

// --- log ---
const morgan = require('morgan');
const winston = require('./app/config/winston');
app.use(morgan('HTTP/:http-version :method :remote-addr :url :remote-user :status :res[content-length] :referrer :user-agent :response-time ms', { stream: winston.stream }));

// parse requests of content-type - application/json
app.use(express.json()); /* bodyParser.json() is deprecated */

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); /* bodyParser.urlencoded() is deprecated */
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));




// app.use(bodyParser.json())
// app.use(express.static(path.join(__dirname, '/uploads')));
app.use('/', express.static(path.join(__dirname, '/view/')));
app.use('/uploads/', express.static(path.join(__dirname, '/uploads/')));

// admin_web SPA (빌드 산출물 → back/admin/) 예: http://host:60040/admin/
const adminDir = path.join(__dirname, 'admin');
app.use('/admin', express.static(adminDir));
app.use('/admin', (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const indexHtml = path.join(adminDir, 'index.html');
  if (!fs.existsSync(indexHtml)) return next();
  res.type('html');
  res.sendFile(indexHtml, (err) => {
    if (err) next(err);
  });
});

// zoning-web SPA (빌드 산출물 → back/zoning-web/) 예: http://host:60040/zoning-web/
const zoningWebDir = path.join(__dirname, 'zoning-web');
app.use('/zoning-web', express.static(zoningWebDir));
app.use('/zoning-web', (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const indexHtml = path.join(zoningWebDir, 'index.html');
  if (!fs.existsSync(indexHtml)) return next();
  res.type('html');
  res.sendFile(indexHtml, (err) => {
    if (err) next(err);
  });
});

app.use(function (req, res, next) {
  // 브이월드 WMS 프록시는 PNG — JSON 헤더를 씌우면 MapLibre가 타일을 버림
  if (String(req.path || '').startsWith('/v1/zoning/vworld/wms')) {
    res.header('Access-Control-Allow-Origin', '*');
    return next();
  }
  res.header("Content-Type", 'application/json');
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
// simple route
app.get("/", (req, res) => {
  // create a dynamic file pathㅁㄴㅇㄹㄴㅇㄹ
  // let filePath = path.join(__dirname, 'uploads', req.url === '/' ? 'index.html' : req.url)
  // console.log(filePath)
  // // default content type
  // let contentType = 'text/html'

  // // extract the extension from the filepath
  // let mimeType = path.extname(filePath)

  // // load various image types
  // switch (mimeType) {
  //     case '.png': contentType = 'image/png'; break;
  //     case '.jpg': contentType = 'image/jpg'; break;
  //     case '.jpeg': contentType = 'image/jpeg'; break;
  // }

  // // read the target file and send to the client.
  // fs.readFile(filePath, (error, data) => {
  //     // stop the execution and send nothing if the requested file path does not exist.
  //     if (error) return

  //     // otherwise, fetch and show the target image
  //     res.writeHead(200, { 'Content-Type': contentType })
  //     res.end(data, 'utf8')

  // })
  res.send(__dirname + "/view/index.html")
  // res.json({ message: "Welcome to bezkoder application." });
});

require("./app/routes/tutorial.routes.js")(app);
require("./app/routes/construction.routes.js")(app);
require("./app/routes/user.routes.js")(app);
require("./app/routes/file.routes.js")(app);
require("./app/routes/map.routes.js")(app);
require("./app/routes/property.routes.js")(app);
require("./app/routes/slope.routes.js")(app);
require("./app/routes/jangsu.routes.js")(app);
require("./app/routes/property_crops.routes.js")(app);
require("./app/routes/load.routes.js")(app);
require("./app/routes/zoning.routes.js")(app); // 용도지역지구 검수 (이관 분리 모듈)
require("./app/routes/garlic.routes.js")(app); // 마늘양파 현장조사

// set port, listen for requests
const PORT = process.env.PORT || 24012;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  // functionJsonTest();
  // createGeoTable();
  // exampleAsync();
  // mkThread();
  // checkCnt();
  // homeCheck()
  // building_poly0503();
  // updateLows()
  // 로컬: DATA_PHOTO_WATCH=1 이면 data/ 폴더 감시 → tb_jangsu_img 자동 등록
  if (process.env.DATA_PHOTO_WATCH === '1') {
    try {
      require('./app/utils/data_photo_import').startWatch();
    } catch (e) {
      console.error('[data-photo] watch start failed', e);
    }
  }
});
// testCluster();


function testCluster() {
  const cluster = require('cluster');
  const numCPUs = require('os').cpus().length;

  if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died`);
    });
  } else {
    // 워커 프로세스에서 작업 처리
    async function processItems(items) {
      for (const item of items) {
        await processItem(item);
      }
    }

    var idx = 0;
    function processItem(item) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          idx += 1
          console.log(idx)
          var objectid = item.properties.OBJECTID;
          var sig_cd = item.properties.SIG_CD;
          var rds_man_no = item.properties.RDS_MAN_NO;
          var bsi_int_sn = item.properties.BSI_INT_SN;
          var odd_bsi_mn = item.properties.ODD_BSI_MN;
          var odd_bsi_sl = item.properties.ODD_BSI_SL;
          var eve_bsi_mn = item.properties.EVE_BSI_MN;
          var eve_bsi_sl = item.properties.EVE_BSI_SL;
          var mvm_res_cd = item.properties.MVM_RES_CD;
          var mvmn_resn = item.properties.MVMN_RESN;
          var mvmn_de = item.properties.MVMN_DE;
          var ope_man_id = item.properties.OPE_MAN_ID;
          var opert_de = item.properties.OPERT_DE;
          var start_x = item.properties.START_X;
          var center_x = item.properties.CENTER_X;
          var end_x = item.properties.END_X;
          var start_y = item.properties.START_Y;
          var center_y = item.properties.CENTER_Y;
          var end_y = item.properties.END_Y;
          var shape_length = item.properties.Shape_Length;
          var coordinates = JSON.stringify(item.geometry.coordinates);
          var x = item.geometry.coordinates[0][0];
          var y = item.geometry.coordinates[0][1];




          // 142++ insert
          const insertSql = `insert into tb_road_center_line (objectid,sig_cd ,rds_man_no,bsi_int_sn,odd_bsi_mn,odd_bsi_sl,eve_bsi_mn,eve_bsi_sl,mvm_res_cd,mvmn_resn ,mvmn_de ,ope_man_id,opert_de ,start_x ,center_x ,end_x ,start_y ,center_y ,end_y ,shape_length ,rings, x, y   ) value ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,? ,?)`;
          param = [objectid, sig_cd, rds_man_no, bsi_int_sn, odd_bsi_mn, odd_bsi_sl, eve_bsi_mn, eve_bsi_sl, mvm_res_cd, mvmn_resn, mvmn_de, ope_man_id, opert_de, start_x, center_x, end_x, start_y, center_y, end_y, shape_length, coordinates, x, y];
          // console.log(param)
          // const insertSql = 'update tb_place_inteligence_building set rings = ? where pnu = ?';

          // param = [bal8, bal4];

          const insertQuery = run("upload", insertSql, param);
          // if (i < idxMax) {
          //   console.log(i)
          //   setTimeout(() => {

          //     creatTable()
          //   }, 10);
          // }
          // console.log(item);
          resolve();
        }, 10);
      });
    }
    const jsonFile = fs.readFileSync('./T36110_gicho.json', 'utf8');
    const jsonData = JSON.parse(jsonFile);
    const fruits = jsonData.features;

    const items = fruits
    processItems(items).then(() => process.exit());
  }
}


var i = 0;
function building_poly0503() {
  const jsonFile = fs.readFileSync('./building_polyline_0503.json', 'utf8');
  const jsonData = JSON.parse(jsonFile);
  const fruits = jsonData.features;
  var idxMax = fruits.length;
  console.log(fruits[i].attributes.FID)
  var bal1 = fruits[i].attributes.FID;
  var bal2 = fruits[i].attributes.OBJECTID;
  var bal3 = fruits[i].attributes.BLD_NM;
  var bal4 = fruits[i].attributes.PNU;
  var bal5 = fruits[i].attributes.JUSO;
  var bal6 = fruits[i].attributes.X;
  var bal7 = fruits[i].attributes.Y;
  var bal8 = JSON.stringify(fruits[i].geometry.rings[0]);
  // const insertSql = 'insert into tb_place_inteligence_building (fid,objectId,bldNm,pnu,juso,pointX,pointY,rings ) value (?,?,?,?,?,?,?,?)';
  // param = [bal1, bal2, bal3, bal4, bal5, bal6, bal7, bal8];
  const insertSql = 'update tb_place_inteligence_building set rings = ? where pnu = ?';
  param = [bal8, bal4];

  const insertQuery = run("upload", insertSql, param);
  if (i <= idxMax) {
    i++
    console.log(i)
    setTimeout(() => {

      building_poly0503()
    }, 100);
  }

}

function geKoreanNumber(number) {
  const koreanUnits = ['억', ''];
  const unit = 10000;
  let answer = '';

  while (number > 0) {
    const mod = number % unit;
    const modToString = mod.toString().replace(/(\d)(\d{3})/, '$1,$2');
    number = Math.floor(number / unit);
    answer = `${modToString}${koreanUnits.pop()}${answer}`;
  }
  return answer;
}

function homeCheck() {
  const jsonFile = fs.readFileSync('./homeList.json', 'utf8');
  const jsonData = JSON.parse(jsonFile);

  const fruits = jsonData.data;
  var list = [];
  fruits.forEach(fruit => {
    var mon = geKoreanNumber(fruit.area.real_trade_price);
    var mon2 = geKoreanNumber(fruit.area.real_rent_price);
    var yy = parseInt(fruit.diffYearText.slice(-5, ((fruit.diffYearText).length) - 3));
    var ad = fruit.address.split(" ");

    var home = {
      // name : fruit.name,  //아파트이름
      // addr :fruit.address, //아파트주소
      // count :fruit.total_household , //세대
      // year :fruit.diffYearText, //년식
      // land:fruit.public_area, // 공급면적
      // price:fruit.area.real_trade_price, // 1개월 평균
      // rentPrice:fruit.area.real_rent_price
      '구': ad[1], //아파트주소
      '동': ad[2], //아파트주소
      '이름': fruit.name,  //아파트이름
      '주소': fruit.address, //아파트주소
      '세대수': fruit.total_household, //세대
      // '연식' :fruit.diffYearText, //년식
      '연식': yy, //년식
      '공급면적': fruit.area.public_area, // 공급면적
      // '매매가':fruit.area.real_trade_price, // 1개월 평균
      '매매가': mon, // 1개월 평균
      '매매가2': fruit.area.real_trade_price, // 1개월 평균
      // '전세가':fruit.area.real_rent_price
      '전세가': mon2,
      '전세가2': fruit.area.real_rent_price
    }
    list.push(home)
  });
  var myJson = JSON.stringify(list)

  const writeJosnFile = path.join(__dirname, 'homeFilterList.json');
  fs.writeFileSync(writeJosnFile, myJson)
}
const THREAD_COUNT = 2;



var geoJsonList = [
  "busan",
  "chungbuk_1",
  "chungbuk_2",
  "chungnam_1",
  "chungnam_2",
  "daegu",
  "daejeon",
  "gangwon",
  "gwangju",
  "gyeongbuk_1",
  "gyeongbuk_2",
  "gyeongbuk_3",
  "gyeonggi_1",
  "gyeonggi_2",
  "gyeonggi_3",
  "gyeongnam_1",
  "gyeongnam_2",
  "incheon",
  "jeonbuk_1",
  "jeonbuk_2",
  "jeonnam_1",
  "jeonnam_2",
  "jeonnam_3",
  "sejong",
  "seoul",
  "ulsan",
]

var totalList = [];


async function mkThread() {
  const workerPromises = [];
  // for (let i = 0; i < geoJsonList.length; i++) {
  // // for (let i = 0; i < 1; i++) {
  //   workerPromises.push(createWorker(geoJsonList[i]));
  // }
  // for (let i = 0; i < 1; i++) {
  for (let i = 0; i < 1; i++) {
    workerPromises.push(createWorker(geoJsonList[i]));
  }
  const thread_results = await Promise.all(workerPromises);
  const total =
    thread_results[0] +
    thread_results[1] +
    thread_results[2] +
    thread_results[3];

  console.log("total");
  console.log(total);
  console.log("total");
}




  

function createWorker(index) {
  return new Promise(function (resolve, reject) {
    // const worker = new Worker("./insertGeoJson.js", {
    // const worker = new Worker("./insertGeoTable.js", {
    // const worker = new Worker("./insertBuildJson.js", {
    // const worker = new Worker("./insertRoadJson.js", {
    // const worker = new Worker("./insertRailloadTable.js", {
    // const worker = new Worker("./inserJangSuJson.js", {
    // const worker = new Worker("./inserJangSuUpJson.js", {
    // const worker = new Worker("./insertRailloadJson.js", {
    const worker = new Worker("./mkExcel.js", {

      // const worker = new Worker("./mkPdf.js", {
      // const worker = new Worker("./filterJangSu.js", {
      // const worker = new Worker("./searchdateImg.js", {
      workerData: { thread_count: index },
    });
    worker.on("message", (data) => {
      console.log("message")
      resolve(data);
      console.log("message")
    });
    worker.on("error", (msg) => {
      reject(`An error ocurred: ${msg}`);
    });
  });
}


