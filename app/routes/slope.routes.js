const multer = require('multer')
const path = require('path')
const fs = require('fs');


const fileStorageEngine = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join('./', req.body.imgPath); // 절대경로 생성
    try {
      // await fs.promises.mkdir(uploadPath, { recursive: true });
      if (!fs.existsSync(uploadPath)) {
        await fs.promises.mkdir(uploadPath, { recursive: true });
      }
    } catch (err) {
      console.error("폴더 생성 오류:", err);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
    // console.log(file)
    // cb(null, req.body.fileName);
  }
});

const upload = multer({ storage: fileStorageEngine, limits: { fieldSize: 25 * 1024 * 1024 } });

const slope = require("../controllers/slope.controller.js");
module.exports = app => {




  var router = require("express").Router();

  router.post("/saveScore", slope.saveScore);
  router.get("/getSlopeRailwayInfo", slope.getSlopeRailwayInfo);
  router.get("/getJangsuDetailDataLoad", slope.getJangsuDetailDataLoad);
  router.post("/updateJangsuInfoData", slope.updateJangsuInfoData);
  router.get("/getJangsuImgData", slope.getJangsuImgData);


  router.post("/updateJangsuImg", upload.none(), slope.updateJangsuImg);
  router.get("/deleteJangsuImg", slope.deleteJangsuImg);


  router.post('/uploadGalleryJangsuImg', upload.array('files'), slope.uploadGalleryJangsuImg)
  router.post('/uploadCameraJangsuImg', upload.single('file'), slope.uploadCameraJangsuImg)

  app.use('/v1/slope', router);
};



// SELECT ;
//      a.idx as aIdx,
//      a.col_a as aCol_a,
//      a.col_b as aCol_b,
//      a.col_c as aCol_c,
//      a.col_d as aCol_d,
//      a.col_e as aCol_e,
//      a.col_f as aCol_f,
//      a.col_g as aCol_g,
//      a.col_h as aCol_h,
//      a.col_i as aCol_i,
//      a.col_j as aCol_j,
//      a.col_k as aCol_k,
//      a.col_l as aCol_l,
//      a.col_m as aCol_m,
//      a.col_n as aCol_n,
//      a.col_o as aCol_o,
//      a.col_p as aCol_p,
//      a.col_q as aCol_q,
//      a.col_r as aCol_r,
//      a.col_s as aCol_s,
//      a.col_t as aCol_t,
//      a.col_u as aCol_u,
//      a.col_v as aCol_v,
//      a.col_w as aCol_w,
//      a.col_x as aCol_x,
//      a.col_y as aCol_y,
//      a.col_z as aCol_z,
//      a.col_aa as aCol_aa,
//      a.col_ab as aCol_ab,
//      a.col_ac as aCol_ac,
//      a.col_ad as aCol_ad,
//      a.col_ae as aCol_ae,
//      a.col_af as aCol_af,
//      b.col_a as bCol_a,
//      b.col_b as bCol_b,
//      b.col_c as bCol_c,
//      b.col_d as bCol_d,
//      b.col_e as bCol_e,
//      b.col_f as bCol_f,
//      b.col_g as bCol_g,
//      b.col_h as bCol_h,
//      b.col_i as bCol_i,
//      b.col_j as bCol_j,
//      b.col_k as bCol_k,
//      b.col_l as bCol_l,
//      b.col_m as bCol_m,
//      b.col_n as bCol_n,
//      b.col_o as bCol_o,
//      b.col_p as bCol_p,
//      b.col_q as bCol_q,
//      b.col_r as bCol_r,
//      b.col_s as bCol_s,
//      b.col_t as bCol_t,
//      b.col_u as bCol_u,
//      b.col_v as bCol_v,
//      b.col_w as bCol_w,
//      b.col_x as bCol_x,
//      b.col_y as bCol_y,
//      b.col_z as bCol_z,
//      b.col_aa as bCol_aa,
//      b.col_ab as bCol_ab,
//      b.col_ac as bCol_ac,
//      b.col_ad as bCol_ad,
//      b.col_ae as bCol_ae,
//      b.col_af as bCol_af,
//      b.col_ag as bCol_ag,
//      b.col_ah as bCol_ah
//      FROM tb_gyebukjeonggyecheon_output as a inner join tb_gyebukjeonggyecheon_child as b ON a.col_a = b.parents_idx ;