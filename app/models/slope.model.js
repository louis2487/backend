const sql = require('./db.js');
const run = require('./runQuery');
const crypto = require('../config/crypto');
const nodemailer = require('nodemailer');
const fs = require('fs');

const logger = require('../config/winston');
const nodeHtmlToImage = require('node-html-to-image')
const imgToPDF = require('image-to-pdf')
// var client = require('../config/elastic.config.js');

// constructor
const Slope = function (user) {
  this.uuid = user.uuid;
  this.userName = user.userName;
  this.userId = user.userId;
  this.userPw = user.userPw;
  this.deviceKey = user.deviceKey;

};
function getFormatDate(date) {
  var year = date.getFullYear();
  var month = (1 + date.getMonth());
  month = month > 10 ? month : '0' + month; // 10이 넘지 않으면 앞에 0을 붙인다
  var day = date.getDate();
  day = day > 10 ? day : '0' + day; // 10이 넘지 않으면 앞에 0을 붙인다
  var hours = date.getHours();
  hours = hours > 10 ? hours : '0' + hours; // 10이 넘지 않으면 앞에 0을 붙인다
  var minutes = date.getMinutes();
  minutes = minutes > 10 ? minutes : '0' + minutes; // 10이 넘지 않으면 앞에 0을 붙인다
  var seconds = date.getSeconds();
  seconds = seconds > 10 ? seconds : '0' + seconds; // 10이 넘지 않으면 앞에 0을 붙인다

  // return year + '-' + month + '-' + day;
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} `
}

let res = {
  code: 0,
  msg: '',
  // result: null
}

Slope.saveScore = async (body, result) => {
  try {
    var totalSum = parseInt(
      body.col_a +
      body.col_b +
      body.col_c +
      body.col_d +
      body.col_e +
      body.col_f +
      body.col_g +
      body.col_h +
      body.col_i +
      body.col_j +
      body.col_k +
      body.col_l +
      body.col_m +
      body.col_n +
      body.col_o +
      body.col_p +
      body.col_q +
      body.col_r +
      body.col_s +
      body.col_t +
      body.col_u +
      body.col_v +
      body.col_w +
      body.col_x +
      body.col_y +
      body.col_z
    );
    var sumClass = "";
    if (totalSum >= 0 && totalSum <= 20) {
      sumClass = "A";
    } else if (totalSum >= 21 && totalSum <= 40) {
      sumClass = "B";
    } else if (totalSum >= 41 && totalSum <= 60) {
      sumClass = "C";
    } else if (totalSum >= 61 && totalSum <= 80) {
      sumClass = "D";
    } else if (totalSum >= 81) {
      sumClass = "E";
    }
    var htmlText = '';
    htmlText += " <html>"
    htmlText += " <head>"
    htmlText += " <meta http-equiv=Content-Type content='text/html; charset=utf-8'>"
    htmlText += " <meta name=Generator content='Microsoft Word 15 (filtered)'>"
    htmlText += " <title>□ 개요</title>"
    htmlText += " <style>"
    htmlText += " <!--"
    htmlText += "  /* Font Definitions */"
    htmlText += "  @font-face"
    htmlText += " 	{font-family:Batang;"
    htmlText += " 	panose-1:2 3 6 0 0 1 1 1 1 1;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:Dotum;"
    htmlText += " 	panose-1:2 11 6 0 0 1 1 1 1 1;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:Gulim;"
    htmlText += " 	panose-1:2 11 6 0 0 1 1 1 1 1;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'Cambria Math';"
    htmlText += " 	panose-1:2 4 5 3 5 4 6 3 2 4;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'Arial Unicode MS';"
    htmlText += " 	panose-1:2 11 6 4 2 2 2 2 2 4;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'\@Gulim';"
    htmlText += " 	panose-1:2 11 6 0 0 1 1 1 1 1;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:GulimChe;"
    htmlText += " 	panose-1:2 11 6 9 0 1 1 1 1 1;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'\@GulimChe';}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'\@Dotum';"
    htmlText += " 	panose-1:2 11 6 0 0 1 1 1 1 1;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'Malgun Gothic';"
    htmlText += " 	panose-1:2 11 5 3 2 0 0 2 0 4;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'\@Malgun Gothic';}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:함초롬바탕;"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:함초롬돋움;"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'HCI Poppy';"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:휴먼명조;"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:HYHeadLine-Medium;"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:-윤고딕320;"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:-윤명조120;"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:HYSinMyeongJo-Medium;"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:HYGothic-Medium;"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'HCI Hollyhock';"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:휴먼고딕;"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:한컴바탕;"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'\@宋?';"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'\@함초롬바탕';"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'\@HYSinMyeongJo-Medium';"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'\@Batang';"
    htmlText += " 	panose-1:2 3 6 0 0 1 1 1 1 1;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'\@HYGothic-Medium';"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'\@한컴바탕';"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'\@휴먼고딕';"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'\@-윤명조120';"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'\@-윤고딕320';"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'\@HYHeadLine-Medium';"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'\@휴먼명조';"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += " @font-face"
    htmlText += " 	{font-family:'\@함초롬돋움';"
    htmlText += " 	panose-1:0 0 0 0 0 0 0 0 0 0;}"
    htmlText += "  /* Style Definitions */"
    htmlText += "  p.MsoNormal, li.MsoNormal, div.MsoNormal"
    htmlText += " 	{margin:0in;"
    htmlText += " 	text-autospace:none;"
    htmlText += " 	word-break:break-all;"
    htmlText += " 	font-size:11.0pt;"
    htmlText += " 	font-family:'Malgun Gothic',sans-serif;}"
    htmlText += " p.a, li.a, div.a"
    htmlText += " 	{mso-style-name:바탕글;"
    htmlText += " 	margin:0in;"
    htmlText += " 	text-align:justify;"
    htmlText += " 	text-justify:inter-ideograph;"
    htmlText += " 	line-height:103%;"
    htmlText += " 	text-autospace:none;"
    htmlText += " 	word-break:break-all;"
    htmlText += " 	font-size:10.0pt;"
    htmlText += " 	font-family:'함초롬바탕',serif;"
    htmlText += " 	color:black;}"
    htmlText += " p.a0, li.a0, div.a0"
    htmlText += " 	{mso-style-name:본문;"
    htmlText += " 	margin-top:0in;"
    htmlText += " 	margin-right:0in;"
    htmlText += " 	margin-bottom:0in;"
    htmlText += " 	margin-left:15.0pt;"
    htmlText += " 	text-align:justify;"
    htmlText += " 	text-justify:inter-ideograph;"
    htmlText += " 	line-height:103%;"
    htmlText += " 	text-autospace:none;"
    htmlText += " 	word-break:break-all;"
    htmlText += " 	font-size:10.0pt;"
    htmlText += " 	font-family:'함초롬바탕',serif;"
    htmlText += " 	color:black;}"
    htmlText += " p.xl277, li.xl277, div.xl277"
    htmlText += " 	{mso-style-name:xl277;"
    htmlText += " 	margin:0in;"
    htmlText += " 	text-align:center;"
    htmlText += " 	text-autospace:none;"
    htmlText += " 	font-size:9.0pt;"
    htmlText += " 	font-family:'Malgun Gothic',sans-serif;"
    htmlText += " 	color:black;}"
    htmlText += " p.a1, li.a1, div.a1"
    htmlText += " 	{mso-style-name:그림제목;"
    htmlText += " 	margin:0in;"
    htmlText += " 	text-align:center;"
    htmlText += " 	line-height:116%;"
    htmlText += " 	text-autospace:none;"
    htmlText += " 	font-size:11.0pt;"
    htmlText += " 	font-family:'HYGothic-Medium',serif;"
    htmlText += " 	color:black;"
    htmlText += " 	font-weight:bold;}"
    htmlText += " .MsoChpDefault"
    htmlText += " 	{font-family:'Malgun Gothic',sans-serif;}"
    htmlText += "  /* Page Definitions */"
    htmlText += "  @page WordSection1"
    htmlText += " 	{size:595.25pt 841.85pt;"
    htmlText += " 	margin:70.85pt 56.65pt 70.85pt 56.65pt;}"
    htmlText += " div.WordSection1"
    htmlText += " 	{page:WordSection1;}"
    htmlText += "  /* List Definitions */"
    htmlText += "  ol"
    htmlText += " 	{margin-bottom:0in;}"
    htmlText += " ul"
    htmlText += " 	{margin-bottom:0in;}"
    htmlText += " -->"
    htmlText += " </style>"
    htmlText += " </head>"
    htmlText += " <body lang=EN-US link=blue vlink=purple style='word-wrap:break-word'>"
    htmlText += " <div class=WordSection1>"
    htmlText += " <div align=center>"
    htmlText += " <br><br>"
    htmlText += " <table class=MsoNormalTable border=0 cellspacing=0 cellpadding=0"
    htmlText += "  style='border-collapse:collapse'>"
    htmlText += "  <tr style='height:12.55pt'>"
    htmlText += "   <td width=222 colspan=7 style='width:166.2pt;border:solid #7F7F7F 1.0pt;"
    htmlText += "   border-bottom:double #7F7F7F 4.5pt;padding:0in 0in 0in 0in;height:12.55pt'>"
    htmlText += "   <p class=xl277 style='margin-top:0in;margin-right:3.0pt;margin-bottom:0in;"
    htmlText += "   margin-left:3.0pt;margin-bottom:.0001pt'><b><span lang=ZH-CN"
    htmlText += "   style='font-size:11.0pt;font-family:'Dotum',sans-serif;letter-spacing:-.25pt'>구</span></b><b><span"
    htmlText += "   style='font-size:11.0pt;font-family:'Dotum',sans-serif;letter-spacing:-.25pt'>  "
    htmlText += "   <span lang=ZH-CN>분</span></span></b></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=381 colspan=22 style='width:285.45pt;border-top:solid #7F7F7F 1.0pt;"
    htmlText += "   border-left:none;border-bottom:double #7F7F7F 4.5pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:12.55pt'>"
    htmlText += "   <p class=xl277 style='margin-top:0in;margin-right:3.0pt;margin-bottom:0in;"
    htmlText += "   margin-left:3.0pt;margin-bottom:.0001pt'><b><span lang=ZH-CN"
    htmlText += "   style='font-size:11.0pt;font-family:'Dotum',sans-serif;letter-spacing:-.25pt'>평"
    htmlText += "   가 기 준</span></b><b><span style='font-size:11.0pt;font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>  <span lang=ZH-CN>및</span>  <span lang=ZH-CN>배 점</span></span></b></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 style='width:32.0pt;border-top:solid #7F7F7F 1.0pt;border-left:"
    htmlText += "   none;border-bottom:double #7F7F7F 4.5pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:12.55pt'>"
    htmlText += "   <p class=xl277 style='margin-top:0in;margin-right:3.0pt;margin-bottom:0in;"
    htmlText += "   margin-left:3.0pt;margin-bottom:.0001pt'><b><span lang=ZH-CN"
    htmlText += "   style='font-size:11.0pt;font-family:'Dotum',sans-serif;letter-spacing:-.25pt'>점수</span></b></p>"
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=28 rowspan=25 style='width:21.1pt;border:solid #7F7F7F 1.0pt;"
    htmlText += "   border-top:none;padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a align=center style='text-align:center;line-height:normal;"
    htmlText += "   word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>붕</span></p>"
    htmlText += "   <p class=a align=center style='text-align:center;line-height:normal;"
    htmlText += "   word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>괴</span></p>"
    htmlText += "   <p class=a align=center style='text-align:center;line-height:normal;"
    htmlText += "   word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>위</span></p>"
    htmlText += "   <p class=a align=center style='text-align:center;line-height:normal;"
    htmlText += "   word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>험</span></p>"
    htmlText += "   <p class=a align=center style='text-align:center;line-height:normal;"
    htmlText += "   word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>성</span></p>"
    htmlText += "   <p class=a align=center style='text-align:center;line-height:normal;"
    htmlText += "   word-break:normal'><span style='font-family:'Dotum',sans-serif;letter-spacing:"
    htmlText += "   -.25pt'>(70)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=42 rowspan=8 style='width:31.7pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.25pt'>지형</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>(23)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=151 colspan=5 rowspan=2 style='width:113.4pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>경사각</span><span style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>(</span><span style='font-family:"
    htmlText += "   'Arial Unicode MS',serif;letter-spacing:-.7pt'>°</span><span"
    htmlText += "   style='font-family:'Dotum',sans-serif;letter-spacing:-.7pt'>)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=76 colspan=3 style='width:57.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>20 <span lang=ZH-CN>미만</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=76 colspan=6 style='width:57.15pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>20~33</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=76 colspan=7 style='width:57.1pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>34~43</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=78 colspan=5 style='width:58.75pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>44~53</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=74 style='width:55.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>54 <span lang=ZH-CN>이상</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_a + "</span></p>"
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=76 colspan=3 style='width:57.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>2</span></p>";
    if (body.col_a == 2) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9313; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=76 colspan=6 style='width:57.15pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>4</span></p>";
    if (body.col_a == 4) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9315; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=76 colspan=7 style='width:57.1pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>6</span></p>";
    if (body.col_a == 6) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9317; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=78 colspan=5 style='width:58.75pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>8</span></p>";
    if (body.col_a == 8) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9319; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=74 style='width:55.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>10</span></p>";
    if (body.col_a == 10) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9321; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=151 colspan=5 rowspan=2 style='width:113.4pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>높 이</span><span style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>(m)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=76 colspan=3 style='width:57.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>25 <span lang=ZH-CN>미만</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=76 colspan=6 style='width:57.15pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>25~49</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=76 colspan=7 style='width:57.1pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>50~59</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=78 colspan=5 style='width:58.75pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>60~69</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=74 style='width:55.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>70 <span lang=ZH-CN>이상</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_b + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=76 colspan=3 style='width:57.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>1</span></p>";
    if (body.col_b == 1) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9312; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=76 colspan=6 style='width:57.15pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>2</span></p>";
    if (body.col_b == 2) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9313; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=76 colspan=7 style='width:57.1pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-.7pt'>bhiz893</span></p>"
    var dummyTxt = "   letter-spacing:-.7pt'>3</span></p>";
    if (body.col_b == 3) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9314; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=78 colspan=5 style='width:58.75pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-.7pt'>bhiz894</span></p>"
    var dummyTxt = "   letter-spacing:-.7pt'>4</span></p>";
    if (body.col_b == 4) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9315; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=74 style='width:55.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-.7pt'>bhiz895</span></p>"
    var dummyTxt = "   letter-spacing:-.7pt'>5</span></p>";
    if (body.col_b == 5) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9316; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=151 colspan=5 rowspan=2 style='width:113.4pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>급경사지 종단형상</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>철형</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=7 style='width:71.3pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>직선형</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>요형</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=3 style='width:71.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>복합형</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_c + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>1</span></p>";
    if (body.col_c == 1) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9312; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=7 style='width:71.3pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>2</span></p>";
    if (body.col_c == 2) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9313; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>3</span></p>";
    if (body.col_c == 3) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9314; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=3 style='width:71.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>4</span></p>";
    if (body.col_c == 4) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9315; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=151 colspan=5 rowspan=2 style='width:113.4pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>자연비탈면 횡단형상</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>하강형</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=7 style='width:71.3pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>평행형</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>상승형</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=3 style='width:71.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>복합형</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_d + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>1</span></p>";
    if (body.col_d == 1) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9312; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=7 style='width:71.3pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>2</span></p>";
    if (body.col_d == 2) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9313; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>3</span></p>";
    if (body.col_d == 3) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9314; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=3 style='width:71.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>4</span></p>";
    if (body.col_d == 4) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9315; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=42 rowspan=8 style='width:31.7pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.25pt'>지반</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Arial Unicode MS',serif;"
    htmlText += "   letter-spacing:-.25pt'>‧</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.25pt'>지질</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>(28)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=151 colspan=5 rowspan=2 style='width:113.4pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>지반 변형ㆍ균열</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=190 colspan=13 style='width:142.65pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>없음</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=190 colspan=9 style='width:142.8pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>있음</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_e + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=190 colspan=13 style='width:142.65pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>0</span></p>";
    if (body.col_e == 0) {
      dummyTxt = "   letter-spacing:-.7pt'> ⓪ </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=190 colspan=9 style='width:142.8pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>5</span></p>";
    if (body.col_e == 5) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9316; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=151 colspan=5 rowspan=2 style='width:113.4pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>토층심도</span><span style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>(<span lang=ZH-CN>㎝</span>)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=76 colspan=3 style='width:57.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>0~20</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=76 colspan=6 style='width:57.15pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>21~50</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=76 colspan=7 style='width:57.1pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>51~70</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=78 colspan=5 style='width:58.75pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>71~90</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=74 style='width:55.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>91 <span lang=ZH-CN>이상</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_f + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=76 colspan=3 style='width:57.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>1</span></p>";
    if (body.col_f == 1) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9312; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=76 colspan=6 style='width:57.15pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>2</span></p>";
    if (body.col_f == 2) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9313; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=76 colspan=7 style='width:57.1pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>3</span></p>";
    if (body.col_f == 3) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9314; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=78 colspan=5 style='width:58.75pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>4</span></p>";
    if (body.col_f == 4) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9315; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=74 style='width:55.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>5</span></p>";
    if (body.col_f == 5) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9316; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=151 colspan=5 rowspan=2 style='width:113.4pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>상부외력</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=22 style='width:16.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>없음</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=63 colspan=4 style='width:47.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>전</span><span style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>, <span lang=ZH-CN>답</span>, <span"
    htmlText += "   lang=ZH-CN>묘지</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=67 colspan=4 style='width:50.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>송전탑</span><span style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>, <span lang=ZH-CN>주택</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=32 colspan=3 style='width:24.3pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>철도</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=32 colspan=3 style='width:24.3pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>도로</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=164 colspan=7 style='width:122.7pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-1.3pt'>임도</span><span style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-1.3pt'>, <span lang=ZH-CN>인위적 개발훼손</span>(<span"
    htmlText += "   lang=ZH-CN>태양광</span>, <span lang=ZH-CN>벌채 등</span>)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_g + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=22 style='width:16.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>0</span></p>";
    if (body.col_g == 0) {
      dummyTxt = "   letter-spacing:-.7pt'> ⓪ </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=63 colspan=4 style='width:47.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>2</span></p>";
    if (body.col_g == 2) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9313; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=67 colspan=4 style='width:50.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>4</span></p>";
    if (body.col_g == 4) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9315; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=32 colspan=3 style='width:24.3pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>6</span></p>";
    if (body.col_g == 6) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9317; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=32 colspan=3 style='width:24.3pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>8</span></p>";
    if (body.col_g == 8) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9319; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=164 colspan=7 style='width:122.7pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>10</span></p>";
    if (body.col_g == 10) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9321; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=151 colspan=5 rowspan=2 style='width:113.4pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>붕괴ㆍ유실이력</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=71 colspan=2 style='width:53.15pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>없음</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=71 colspan=6 style='width:53.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>낙석</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=71 colspan=6 style='width:53.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>10% <span lang=ZH-CN>미만</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=94 colspan=7 style='width:70.15pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>10%~20%<span lang=ZH-CN>미만</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=74 style='width:55.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>20% <span lang=ZH-CN>이상</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_h + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=71 colspan=2 style='width:53.15pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>0</span></p>";
    if (body.col_h == 0) {
      dummyTxt = "   letter-spacing:-.7pt'> ⓪ </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=71 colspan=6 style='width:53.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>2</span></p>";
    if (body.col_h == 2) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9313; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=71 colspan=6 style='width:53.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>4</span></p>";
    if (body.col_h == 4) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9315; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=94 colspan=7 style='width:70.15pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>6</span></p>";
    if (body.col_h == 6) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9317; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=74 style='width:55.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>8</span></p>";
    if (body.col_h == 8) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9319; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=42 rowspan=2 style='width:31.7pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.25pt'>시설</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>(5)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=151 colspan=5 rowspan=2 style='width:113.4pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>보호시설상태</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>양호</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=7 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>불량</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>매우 불량</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=3 style='width:71.4pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>없음</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_i + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>0</span></p>";
    if (body.col_i == 0) {
      dummyTxt = "   letter-spacing:-.7pt'> ⓪ </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=7 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>2</span></p>";
    if (body.col_i == 2) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9313; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>4</span></p>";
    if (body.col_i == 4) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9315; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=3 style='width:71.4pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>5</span></p>";
    if (body.col_i == 5) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9316; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=42 rowspan=6 style='width:31.7pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.25pt'>강우</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>(14)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=45 colspan=3 rowspan=4 style='width:33.85pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>비탈면 </span></p>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>계곡</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=106 colspan=2 rowspan=2 style='width:79.55pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>계곡 연장</span><span style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>(m)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>0~10</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=7 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>11~30</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>31~50</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=3 style='width:71.4pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>51 <span lang=ZH-CN>이상</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_j + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>1</span></p>";
    if (body.col_j == 1) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9312; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=7 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>2</span></p>";
    if (body.col_j == 2) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9313; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>3</span></p>";
    if (body.col_j == 3) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9314; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=3 style='width:71.4pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>4</span></p>";
    if (body.col_j == 4) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9315; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=106 colspan=2 rowspan=2 style='width:79.55pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a1 style='margin-right:-2.7pt;line-height:normal'><span lang=ZH-CN"
    htmlText += "   style='font-size:10.0pt;font-family:'Dotum',sans-serif;letter-spacing:-.7pt;"
    htmlText += "   font-weight:normal'>계곡 폭</span><span style='font-size:10.0pt;font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt;font-weight:normal'>(m)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a1 style='margin-right:-2.7pt;text-indent:9.6pt;line-height:normal'><span"
    htmlText += "   style='font-size:10.0pt;font-family:'Dotum',sans-serif;letter-spacing:-.7pt;"
    htmlText += "   font-weight:normal'>3 <span lang=ZH-CN>이상</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=7 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>2~3</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>1~2</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=3 style='width:71.4pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>1 <span lang=ZH-CN>미만</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_k + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>1</span></p>";
    if (body.col_k == 1) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9312; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=7 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>2</span></p>";
    if (body.col_k == 2) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9313; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>3</span></p>";
    if (body.col_k == 3) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9314; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=3 style='width:71.4pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>4</span></p>";
    if (body.col_k == 4) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9315; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=151 colspan=5 rowspan=2 style='width:113.4pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>지하수 상태</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>건조</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>(<span lang=ZH-CN>흐름흔적 없음</span>)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=7 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>습윤</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>(<span lang=ZH-CN>흐름흔적 하</span>)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>표면수</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>(<span lang=ZH-CN>흐름흔적 중</span>)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=3 style='width:71.4pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>용수</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>(<span lang=ZH-CN>흐름흔적 상</span>)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_l + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>0</span></p>";
    if (body.col_l == 0) {
      dummyTxt = "   letter-spacing:-.7pt'> ⓪ </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=7 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>2</span></p>";
    if (body.col_l == 2) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9313; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>4</span></p>";
    if (body.col_l == 4) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9315; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=3 style='width:71.4pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>6</span></p>";
    if (body.col_l == 6) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9317; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=574 colspan=28 style='width:430.55pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>소</span><span style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>  <span lang=ZH-CN>계</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 style='width:32.0pt;border-top:none;border-left:none;border-bottom:"
    htmlText += "   solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>&nbsp;</span></p>"
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=28 rowspan=17 style='width:21.1pt;border-top:none;border-left:solid gray 1.0pt;"
    htmlText += "   border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>사</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>회</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>적</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>영</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>향</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>도</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>(30)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=68 colspan=3 rowspan=14 style='width:51.05pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>주요 보호대상시설</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>중 택</span><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'> 1</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=68 colspan=2 rowspan=4 style='width:51.1pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>공원시설</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-.7pt'>(18)  </span></p>"

    var dummyTxt = "   letter-spacing:-.7pt'>(18)</span></p>";
    if (body.col_m_txt == '공원시설') {
      dummyTxt = "   letter-spacing:-.7pt'> &#9329; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=57 rowspan=2 style='width:42.95pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>용도</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>기타</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=7 style='width:71.3pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>조경</span><span style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>, <span lang=ZH-CN>유희</span>, <span"
    htmlText += "   lang=ZH-CN>편익시설</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=190 colspan=9 style='width:142.8pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>탐방로</span><span style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>, <span lang=ZH-CN>도로</span>, <span"
    htmlText += "   lang=ZH-CN>광장</span>, <span lang=ZH-CN>휴양</span>, <span lang=ZH-CN>운동</span>,"
    htmlText += "   <span lang=ZH-CN>교양시설</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_n + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>1</span></p>";
    if (body.col_n == 1) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9312; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=7 style='width:71.3pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>2</span></p>";
    if (body.col_n == 2) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9313; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=190 colspan=9 style='width:142.8pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>3</span></p>";
    if (body.col_n == 3) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9314; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=57 rowspan=2 style='width:42.95pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>피해예상</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>이용객수</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>0<span lang=ZH-CN>명</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=7 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>1~10<span lang=ZH-CN>명 미만</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.3pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>10~20<span lang=ZH-CN>명 미만</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=3 style='width:71.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>20<span lang=ZH-CN>명 이상</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_o + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=95 colspan=6 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>0</span></p>";
    if (body.col_o == 0) {
      dummyTxt = "   letter-spacing:-.7pt'> ⓪ </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=7 style='width:71.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>5</span></p>";
    if (body.col_o == 5) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9316; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=6 style='width:71.3pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>10</span></p>";
    if (body.col_o == 10) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9321; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=95 colspan=3 style='width:71.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>15</span></p>";
    if (body.col_o == 15) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9326; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=68 colspan=2 rowspan=6 style='width:51.1pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>도로ㆍ철도</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-.7pt'>(20)</span></p>"
    var dummyTxt = "   letter-spacing:-.7pt'>(20)</span></p>";
    if (body.col_m_txt == '도로ㆍ철도') {
      dummyTxt = "   letter-spacing:-.7pt'> &#9331; </span></p>"
    }
    htmlText += dummyTxt;


    htmlText += "   </td>"
    htmlText += "   <td width=57 rowspan=2 style='width:42.95pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>입지</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=7 style='width:95.15pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>산지</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=11 style='width:95.1pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>농어촌</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=4 style='width:95.2pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>시가지</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_p + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=127 colspan=7 style='width:95.15pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>1</span></p>";
    if (body.col_p == 1) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9312; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=11 style='width:95.1pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>3</span></p>";
    if (body.col_p == 3) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9314; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=4 style='width:95.2pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>5</span></p>";
    if (body.col_p == 5) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9316; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=57 rowspan=2 style='width:42.95pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>도로차로수</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>(<span lang=ZH-CN>편도</span>)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=7 style='width:95.1pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>1<span lang=ZH-CN>차로 이하</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=11 style='width:95.2pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>2<span lang=ZH-CN>차로</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=4 style='width:95.15pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>3<span lang=ZH-CN>차로 이상</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_q + "</span></p>"
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=127 colspan=7 style='width:95.1pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>1</span></p>";
    if (body.col_q == 1) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9312; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=11 style='width:95.2pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>4</span></p>";
    if (body.col_q == 4) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9315; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=4 style='width:95.15pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>7</span></p>";
    if (body.col_q == 7) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9318; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=57 rowspan=2 style='width:42.95pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>교통량</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>(<span lang=ZH-CN>대</span>/<span lang=ZH-CN>일</span>)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=85 colspan=5 style='width:63.8pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-1.0pt'>500 <span lang=ZH-CN>미만</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=74 colspan=6 style='width:55.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-1.0pt'>500~5,000</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=74 colspan=6 style='width:55.4pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-1.0pt'>5,001~20,000</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=74 colspan=4 style='width:55.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-1.0pt'>20,001~35,000</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=74 style='width:55.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-1.0pt'>35,001 <span lang=ZH-CN>이상</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_r + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=85 colspan=5 style='width:63.8pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-.7pt'>bhiz89</span><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-1.0pt'>1</span></p>"
    var dummyTxt = "   letter-spacing:-.7pt'>1</span></p>";
    if (body.col_r == 1) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9312; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=74 colspan=6 style='width:55.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-.7pt'>bhiz89</span><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-1.0pt'>2</span></p>"
    var dummyTxt = "   letter-spacing:-.7pt'>2</span></p>";
    if (body.col_r == 2) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9313; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=74 colspan=6 style='width:55.4pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-.7pt'>bhiz89</span><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-1.0pt'>4</span></p>"
    var dummyTxt = "   letter-spacing:-.7pt'>4</span></p>";
    if (body.col_r == 4) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9315; </span></p>"
    }
    htmlText += dummyTxt;

    htmlText += "   </td>"
    htmlText += "   <td width=74 colspan=4 style='width:55.35pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-.7pt'>bhiz89</span><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-1.0pt'>6</span></p>"
    var dummyTxt = "   letter-spacing:-.7pt'>6</span></p>";
    if (body.col_r == 6) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9317; </span></p>"
    }
    htmlText += dummyTxt;

    htmlText += "   </td>"
    htmlText += "   <td width=74 style='width:55.45pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-.7pt'>bhiz89</span><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-1.0pt'>8</span></p>"
    var dummyTxt = "   letter-spacing:-.7pt'>8</span></p>";
    if (body.col_r == 8) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9319; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=68 colspan=2 rowspan=4 style='width:51.1pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>택지 등</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-.7pt'>(20)  </span></p>"

    var dummyTxt = "   letter-spacing:-.7pt'>(20)</span></p>";
    if (body.col_m_txt == '택지등') {
      dummyTxt = "   letter-spacing:-.7pt'> &#9331; </span></p>"
    }
    htmlText += dummyTxt;

    htmlText += "   </td>"
    htmlText += "   <td width=57 rowspan=2 style='width:42.95pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>용도</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=7 style='width:95.1pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>상업용ㆍ공업용 시설</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=11 style='width:95.2pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>단독주택</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=4 style='width:95.15pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>공동주택ㆍ다중이용시설 등</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_s + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=127 colspan=7 style='width:95.1pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>1</span></p>";
    if (body.col_s == 1) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9312; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=11 style='width:95.2pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>3</span></p>";
    if (body.col_s == 3) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9314; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=4 style='width:95.15pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>5</span></p>";
    if (body.col_s == 5) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9316; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=57 rowspan=2 style='width:42.95pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>피해예상</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>인구수</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=7 style='width:95.1pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>0<span lang=ZH-CN>명</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=11 style='width:95.2pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>1~4<span lang=ZH-CN>명</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=4 style='width:95.15pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>5<span lang=ZH-CN>명 이상</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_t + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=127 colspan=7 style='width:95.1pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-.7pt'>bhiz890</span></p>"
    var dummyTxt = "   letter-spacing:-.7pt'>0</span></p>";
    if (body.col_t == 0) {
      dummyTxt = "   letter-spacing:-.7pt'> ⓪ </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=11 style='width:95.2pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-.7pt'>bhiz8910</span></p>"
    var dummyTxt = "   letter-spacing:-.7pt'>10</span></p>";
    if (body.col_t == 10) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9321; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=127 colspan=4 style='width:95.15pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:"
    htmlText += "   0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    // htmlText += "   letter-spacing:-.7pt'>bhiz8915</span></p>"
    var dummyTxt = "   letter-spacing:-.7pt'>15</span></p>";
    if (body.col_t == 15) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9326; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=193 colspan=6 rowspan=2 style='width:145.1pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=1 align=center style='text-align:center;line-height:normal;"
    htmlText += "   word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>급경사지와 인접 </span></p>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>보호대상시설과의 거리</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>(10)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=84 colspan=4 style='width:62.65pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>시설물 없음</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=72 colspan=6 style='width:54.3pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>비탈면높이 </span></p>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>2<span lang=ZH-CN>배 초과</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=72 colspan=6 style='width:54.25pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>비탈면높이 </span></p>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>2<span lang=ZH-CN>배 이내</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=72 colspan=4 style='width:54.25pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>비탈면높이</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>이내</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=80 colspan=2 style='width:60.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>비탈면높이 </span></p>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>1/2<span lang=ZH-CN>배 이내</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 rowspan=2 style='width:32.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_u + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=84 colspan=4 style='width:62.65pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>0</span></p>";
    if (body.col_u == 0) {
      dummyTxt = "   letter-spacing:-.7pt'> ⓪ </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=72 colspan=6 style='width:54.3pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>1</span></p>";
    if (body.col_u == 1) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9312; </span></p>"
    }
    htmlText += dummyTxt;

    htmlText += "   </td>"
    htmlText += "   <td width=72 colspan=6 style='width:54.25pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>4</span></p>";
    if (body.col_u == 4) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9315; </span></p>"
    }
    htmlText += dummyTxt;

    htmlText += "   </td>"
    htmlText += "   <td width=72 colspan=4 style='width:54.25pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>7</span></p>";
    if (body.col_u == 7) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9318; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "   <td width=80 colspan=2 style='width:60.0pt;border-top:none;border-left:none;"
    htmlText += "   border-bottom:solid gray 1.0pt;border-right:solid gray 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    var dummyTxt = "   letter-spacing:-.7pt'>10</span></p>";
    if (body.col_u == 10) {
      dummyTxt = "   letter-spacing:-.7pt'> &#9321; </span></p>"
    }
    htmlText += dummyTxt;
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=574 colspan=28 style='width:430.55pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>소</span><span style='font-family:"
    htmlText += "   'Dotum',sans-serif;letter-spacing:-.7pt'>  <span lang=ZH-CN>계</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 style='width:32.0pt;border-top:none;border-left:none;border-bottom:"
    htmlText += "   solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='letter-spacing:-.25pt'>&nbsp;</span></p>"
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=28 rowspan=6 style='width:21.1pt;border:solid #7F7F7F 1.0pt;"
    htmlText += "   border-top:none;padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>조</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>사</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>자</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>&nbsp;</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>보</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>정</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>점</span></p>"
    htmlText += "   <p class=a0 align=center style='margin-left:0in;text-align:center;line-height:"
    htmlText += "   normal;word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'>수</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=46 colspan=2 rowspan=3 style='width:34.15pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=1 align=center style='text-align:center;line-height:normal;"
    htmlText += "   word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>강우 영향인자</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=529 colspan=26 style='width:396.4pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=1 style='line-height:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'> <span lang=ZH-CN>상부 산지에서 토석류 등이 발생하여 피해가 예상되는 지역</span>(+5)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 style='width:32.0pt;border-top:none;border-left:none;border-bottom:"
    htmlText += "   solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_v + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=529 colspan=26 style='width:396.4pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=1 style='line-height:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'> <span lang=ZH-CN>급경사지의 우수배수시설 여부 및 상태</span> : <span"
    htmlText += "   lang=ZH-CN>우수배수시설 없음</span>(+2), <span lang=ZH-CN>우수배수시설 있으나 시설상태 불량</span>(+1)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 style='width:32.0pt;border-top:none;border-left:none;border-bottom:"
    htmlText += "   solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_w + "</span></p>"
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=529 colspan=26 style='width:396.4pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=1 style='line-height:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'> </span><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.6pt'>급경사지 상부로부터 지표수</span><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.6pt'>(<span lang=ZH-CN>집수</span>)<span lang=ZH-CN>에 의한 피해가 우려되는"
    htmlText += "   지형</span>(+5), <span lang=ZH-CN>방재성능목표강우량 가점</span></span><sup><span"
    htmlText += "   style='font-family:'Dotum',sans-serif;letter-spacing:-.7pt'>*</span></sup><span"
    htmlText += "   style='font-family:'Dotum',sans-serif;letter-spacing:-.6pt'> <span"
    htmlText += "   lang=ZH-CN>부여</span></span></p>"
    htmlText += "   <p class=1 style='margin-left:16.85pt;text-indent:-16.85pt;line-height:normal'><span"
    htmlText += "   style='font-family:'Dotum',sans-serif;letter-spacing:-.7pt'> </span><span"
    htmlText += "   style='font-family:'Dotum',sans-serif;letter-spacing:-.6pt'> * </span><span"
    htmlText += "   style='font-family:'Arial Unicode MS',serif;letter-spacing:-.6pt'>①</span><span"
    htmlText += "   style='font-family:'Dotum',sans-serif;letter-spacing:-.6pt'> <span"
    htmlText += "   lang=ZH-CN>최근</span> 3<span lang=ZH-CN>년 이내</span> 1<span lang=ZH-CN>시간 방재성능목표강우량"
    htmlText += "   이상의 강우 발생</span>(+5), </span><span style='font-family:'Arial Unicode MS',serif;"
    htmlText += "   letter-spacing:-.6pt'>②</span><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.6pt'> <span lang=ZH-CN>최근</span> 5<span lang=ZH-CN>년 이내</span>"
    htmlText += "   1<span lang=ZH-CN>시간 방재성능목표강우량 이상의 강우 발생</span>(+2)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 style='width:32.0pt;border-top:none;border-left:none;border-bottom:"
    htmlText += "   solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_x + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=46 colspan=2 rowspan=2 style='width:34.15pt;border-top:none;"
    htmlText += "   border-left:none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=1 align=center style='text-align:center;line-height:normal;"
    htmlText += "   word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>사회적 영향인자</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=529 colspan=26 style='width:396.4pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=1 style='line-height:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'> <span lang=ZH-CN>노약자</span>(<span lang=ZH-CN>노인</span>,"
    htmlText += "   <span lang=ZH-CN>어린이</span>, <span lang=ZH-CN>장애인 등</span>)<span lang=ZH-CN>의"
    htmlText += "   피해가 예상되는 지역</span>: <span lang=ZH-CN>노약자</span> 1~4<span lang=ZH-CN>명</span>"
    htmlText += "   (+1), <span lang=ZH-CN>노약자</span> 5<span lang=ZH-CN>명 이상</span>(+2)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 style='width:32.0pt;border-top:none;border-left:none;border-bottom:"
    htmlText += "   solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_y + "</span></p>"
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=529 colspan=26 style='width:396.4pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=1 style='line-height:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'> </span><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.8pt'>관리주체가 불분명</span><sup><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.8pt'>*</span></sup><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.8pt'>한 지역 또는 자력정비가 어려운 재해취약계층</span><sup><span"
    htmlText += "   style='font-family:'Dotum',sans-serif;letter-spacing:-.8pt'>**</span></sup><span"
    htmlText += "   lang=ZH-CN style='font-family:'Dotum',sans-serif;letter-spacing:-.8pt'>이 거주하는"
    htmlText += "   지역</span><span style='font-family:'Dotum',sans-serif;letter-spacing:-.8pt'>:"
    htmlText += "   1~4<span lang=ZH-CN>명</span>(+3), 5<span lang=ZH-CN>명 이상</span>(+5)</span></p>"
    htmlText += "   <p class=1 style='margin-left:24.55pt;text-indent:-24.55pt;line-height:normal'><span"
    htmlText += "   style='font-family:'Dotum',sans-serif;letter-spacing:-.7pt'>    * </span><span"
    htmlText += "   style='font-family:'Arial Unicode MS',serif;letter-spacing:-.7pt'>①</span><span"
    htmlText += "   style='font-family:'Dotum',sans-serif;letter-spacing:-.7pt'> <span"
    htmlText += "   lang=ZH-CN>토지와 주택 등의 소유자와 사용자가 달라 관리주체를 정하기 어려운 경우</span>, </span><span"
    htmlText += "   style='font-family:'Arial Unicode MS',serif;letter-spacing:-.7pt'>②</span><span"
    htmlText += "   style='font-family:'Dotum',sans-serif;letter-spacing:-.7pt'> <span"
    htmlText += "   lang=ZH-CN>급경사지 소유자의 행방을 알 수 없는 경우</span>, </span><span style='font-family:"
    htmlText += "   'Arial Unicode MS',serif;letter-spacing:-.7pt'>③</span><span"
    htmlText += "   style='font-family:'Dotum',sans-serif;letter-spacing:-.7pt'> <span"
    htmlText += "   lang=ZH-CN>직접 거주를 하지 않아 방치되어 타인의 피해가 우려되는 경우</span>, </span><span"
    htmlText += "   style='font-family:'Arial Unicode MS',serif;letter-spacing:-.7pt'>④</span><span"
    htmlText += "   style='font-family:'Dotum',sans-serif;letter-spacing:-.7pt'> <span"
    htmlText += "   lang=ZH-CN>소유자ㆍ점유자가 다수인으로 관리주체를 정하기 어려운 경우 등</span></span></p>"
    htmlText += "   <p class=1 style='line-height:normal'><span style='font-family:'Dotum',sans-serif'> <span"
    htmlText += "   style='letter-spacing:-.7pt'>   </span>**<span lang=ZH-CN>「국민기초생활 보장법」제</span>2<span"
    htmlText += "   lang=ZH-CN>조제</span>10<span lang=ZH-CN>호에 따른 차상위계층</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 style='width:32.0pt;border-top:none;border-left:none;border-bottom:"
    htmlText += "   solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + body.col_z + "</span></p>"

    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=574 colspan=28 style='width:430.55pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=1 align=center style='text-align:center;line-height:normal;"
    htmlText += "   word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>소</span><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>  <span lang=ZH-CN>계</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 style='width:32.0pt;border-top:none;border-left:none;border-bottom:"
    htmlText += "   solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='letter-spacing:-.25pt'>&nbsp;</span></p>"
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:11.4pt'>"
    htmlText += "   <td width=222 colspan=7 rowspan=2 style='width:166.2pt;border:solid #7F7F7F 1.0pt;"
    htmlText += "   border-top:none;padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=1 align=center style='margin-right:-2.7pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span lang=ZH-CN style='font-size:12.0pt;"
    htmlText += "   font-family:'Dotum',sans-serif;letter-spacing:-.3pt'>재해위험도 평가 결과</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=381 colspan=22 style='width:285.45pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:11.4pt'>"
    htmlText += "   <p class=1 align=center style='text-align:center;line-height:normal;"
    htmlText += "   word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>합</span><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>  <span lang=ZH-CN>계</span></span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 style='width:32.0pt;border-top:none;border-left:none;border-bottom:"
    htmlText += "   solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:11.4pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + totalSum + "</span></p>"
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr style='height:10.0pt'>"
    htmlText += "   <td width=381 colspan=22 style='width:285.45pt;border-top:none;border-left:"
    htmlText += "   none;border-bottom:solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;"
    htmlText += "   padding:0in 0in 0in 0in;height:10.0pt'>"
    htmlText += "   <p class=1 align=center style='text-align:center;line-height:normal;"
    htmlText += "   word-break:normal'><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>등급</span><span lang=ZH-CN style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.25pt'> </span><span style='font-size:9.0pt;font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.2pt'>A(0~20<span lang=ZH-CN>점</span>), B(21~40<span"
    htmlText += "   lang=ZH-CN>점</span>), C(41~60<span lang=ZH-CN>점</span>), D(61~80<span"
    htmlText += "   lang=ZH-CN>점</span>), E(81<span lang=ZH-CN>점 이상</span>)</span></p>"
    htmlText += "   </td>"
    htmlText += "   <td width=43 style='width:32.0pt;border-top:none;border-left:none;border-bottom:"
    htmlText += "   solid #7F7F7F 1.0pt;border-right:solid #7F7F7F 1.0pt;padding:0in 0in 0in 0in;"
    htmlText += "   height:10.0pt'>"
    htmlText += "   <p class=a0 align=center style='margin-top:0in;margin-right:-2.7pt;"
    htmlText += "   margin-bottom:0in;margin-left:0in;margin-bottom:.0001pt;text-align:center;"
    htmlText += "   line-height:normal;word-break:normal'><span style='font-family:'Dotum',sans-serif;"
    htmlText += "   letter-spacing:-.7pt'>" + sumClass + "</span></p>"
    htmlText += "   </td>"
    htmlText += "  </tr>"
    htmlText += "  <tr height=0>"
    htmlText += "   <td width=28 style='border:none'></td>"
    htmlText += "   <td width=42 style='border:none'></td>"
    htmlText += "   <td width=3 style='border:none'></td>"
    htmlText += "   <td width=23 style='border:none'></td>"
    htmlText += "   <td width=19 style='border:none'></td>"
    htmlText += "   <td width=49 style='border:none'></td>"
    htmlText += "   <td width=57 style='border:none'></td>"
    htmlText += "   <td width=31 style='border:none'></td>"
    htmlText += "   <td width=49 style='border:none'></td>"
    htmlText += "   <td width=5 style='border:none'></td>"
    htmlText += "   <td width=8 style='border:none'></td>"
    htmlText += "   <td width=2 style='border:none'></td>"
    htmlText += "   <td width=10 style='border:none'></td>"
    htmlText += "   <td width=32 style='border:none'></td>"
    htmlText += "   <td width=15 style='border:none'></td>"
    htmlText += "   <td width=10 style='border:none'></td>"
    htmlText += "   <td width=4 style='border:none'></td>"
    htmlText += "   <td width=3 style='border:none'></td>"
    htmlText += "   <td width=26 style='border:none'></td>"
    htmlText += "   <td width=6 style='border:none'></td>"
    htmlText += "   <td width=23 style='border:none'></td>"
    htmlText += "   <td width=4 style='border:none'></td>"
    htmlText += "   <td width=11 style='border:none'></td>"
    htmlText += "   <td width=5 style='border:none'></td>"
    htmlText += "   <td width=21 style='border:none'></td>"
    htmlText += "   <td width=32 style='border:none'></td>"
    htmlText += "   <td width=15 style='border:none'></td>"
    htmlText += "   <td width=6 style='border:none'></td>"
    htmlText += "   <td width=74 style='border:none'></td>"
    htmlText += "   <td width=43 style='border:none'></td>"
    htmlText += "  </tr>"
    htmlText += " </table>"
    htmlText += " </div>"
    htmlText += " <p class=MsoNormal><span style='font-size:1.0pt'>&nbsp;</span></p>"
    htmlText += " <p class=a align=center style='text-align:center;line-height:116%;word-break:"
    htmlText += " normal'><b><span style='font-size:12.0pt;line-height:116%;font-family:'Dotum',sans-serif;"
    htmlText += " color:red'>&nbsp;</span></b></p>"
    htmlText += " <p class=1 align=right style='margin-left:68.75pt;text-align:right;text-indent:"
    htmlText += " -68.75pt;line-height:116%;word-break:normal'><span style='font-family:'Dotum',sans-serif'>&nbsp;</span></p>"
    htmlText += " </div>"
    htmlText += " </body>"
    htmlText += " </html>"
    var saveDate = getFormatDate(new Date());
    nodeHtmlToImage({
      output: './uploads/slopePdf/' + body.uuid + "_slopeRailway.png",
      html: htmlText
    })
      .then(async () => {
        const sql = `SELECT * FROM tb_slope_railway WHERE uuid = ? `;
        const param = [body.uuid];
        const resObj = await run('slopePdf select', sql, param);
        console.log(resObj)
        if (resObj.length == 0) {
          const insertSql = `insert into tb_slope_railway (uuid, col_a, col_b, col_c, col_d, col_e, col_f, col_g, col_h, col_i, col_j, col_k, col_l, col_m, col_n, col_o, col_p, col_q, col_r, col_s, col_t, col_u, col_v, col_w, col_x, col_y, col_z, col_a_txt, col_b_txt, col_c_txt, col_d_txt, col_e_txt, col_f_txt, col_g_txt, col_h_txt, col_i_txt, col_j_txt, col_k_txt, col_l_txt, col_m_txt, col_n_txt, col_o_txt, col_p_txt, col_q_txt, col_r_txt, col_s_txt, col_t_txt, col_u_txt, col_v_txt, col_w_txt, col_x_txt, col_y_txt, col_z_txt, totalSum, saveDate) value (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          const insertParam = [body.uuid, body.col_a, body.col_b, body.col_c, body.col_d, body.col_e, body.col_f, body.col_g, body.col_h, body.col_i, body.col_j, body.col_k, body.col_l, body.col_m, body.col_n, body.col_o, body.col_p, body.col_q, body.col_r, body.col_s, body.col_t, body.col_u, body.col_v, body.col_w, body.col_x, body.col_y, body.col_z, body.col_a_txt, body.col_b_txt, body.col_c_txt, body.col_d_txt, body.col_e_txt, body.col_f_txt, body.col_g_txt, body.col_h_txt, body.col_i_txt, body.col_j_txt, body.col_k_txt, body.col_l_txt, body.col_m_txt, body.col_n_txt, body.col_o_txt, body.col_p_txt, body.col_q_txt, body.col_r_txt, body.col_s_txt, body.col_t_txt, body.col_u_txt, body.col_v_txt, body.col_w_txt, body.col_x_txt, body.col_y_txt, body.col_z_txt, totalSum, saveDate];
          const insertResObj = await run('slopePdf insert', insertSql, insertParam);
          res.code = 1;
          res.msg = 'ok';
          // res.result = resObj[0].userUuid;
          result(null, res);
        } else {
          const updateSql = `update tb_slope_railway set col_a = ?, col_b = ?, col_c = ?, col_d = ?, col_e = ?, col_f = ?, col_g = ?, col_h = ?, col_i = ?, col_j = ?, col_k = ?, col_l = ?, col_m = ?, col_n = ?, col_o = ?, col_p = ?, col_q = ?, col_r = ?, col_s = ?, col_t = ?, col_u = ?, col_v = ?, col_w = ?, col_x = ?, col_y = ?, col_z = ?, col_a_txt = ?, col_b_txt = ?, col_c_txt = ?, col_d_txt = ?, col_e_txt = ?, col_f_txt = ?, col_g_txt = ?, col_h_txt = ?, col_i_txt = ?, col_j_txt = ?, col_k_txt = ?, col_l_txt = ?, col_m_txt = ?, col_n_txt = ?, col_o_txt = ?, col_p_txt = ?, col_q_txt = ?, col_r_txt = ?, col_s_txt = ?, col_t_txt = ?, col_u_txt = ?, col_v_txt = ?, col_w_txt = ?, col_x_txt = ?, col_y_txt = ?, col_z_txt = ?, totalSum = ?, saveDate = ? where uuid = ?`;
          const updateParam = [
            body.col_a
            , body.col_b
            , body.col_c
            , body.col_d
            , body.col_e
            , body.col_f
            , body.col_g
            , body.col_h
            , body.col_i
            , body.col_j
            , body.col_k
            , body.col_l
            , body.col_m
            , body.col_n
            , body.col_o
            , body.col_p
            , body.col_q
            , body.col_r
            , body.col_s
            , body.col_t
            , body.col_u
            , body.col_v
            , body.col_w
            , body.col_x
            , body.col_y
            , body.col_z
            , body.col_a_txt
            , body.col_b_txt
            , body.col_c_txt
            , body.col_d_txt
            , body.col_e_txt
            , body.col_f_txt
            , body.col_g_txt
            , body.col_h_txt
            , body.col_i_txt
            , body.col_j_txt
            , body.col_k_txt
            , body.col_l_txt
            , body.col_m_txt
            , body.col_n_txt
            , body.col_o_txt
            , body.col_p_txt
            , body.col_q_txt
            , body.col_r_txt
            , body.col_s_txt
            , body.col_t_txt
            , body.col_u_txt
            , body.col_v_txt
            , body.col_w_txt
            , body.col_x_txt
            , body.col_y_txt
            , body.col_z_txt
            , totalSum
            , saveDate
            , body.uuid];
          const updateResObj = await run('slopePdf update', updateSql, updateParam);
          res.code = 1;
          res.msg = 'ok';
          // res.result = resObj[0].userUuid;
          result(null, res);
        }

      }).catch(async (e) => {
        result(e, null);
      })
  } catch (err) {
    logger.error(err)
    console.error('slopePdf/_slopeRailway Error!!', err);
    res.code = 2;
    res.msg = '_slopeRailway Error';
    res.result = '';
    console.log('error: ', err);
    result(err, null);
    return;
  }
};


Slope.getSlopeRailwayInfo = async (req, result) => {
  try {
    // console.log(req)
    var uuid = req.query.idx;
    const selectSql = "select * from tb_slope_railway where uuid = ?";
    var param = [uuid];
    const resObj = await run("getSlopeRailwayInfo", selectSql, param);
    // res.code = 1;
    // res.msg = 'ok';
    var response = resObj.length > 0 ? resObj[0] : {};
    result(null, response);
  } catch (err) {
    logger.error(err)
    console.error('getSlopeRailwayInfo Error!!', err);
    res.code = 0;
    res.msg = 'getSlopeRailwayInfo Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};
Slope.getJangsuImgData = async (req, result) => {
  try {
    // console.log(req)
    var fpop_key = req.query.fpop_key;
    const selectSql = `select * from tb_jangsu_img where fpop_key = '${fpop_key}'`;
    const resObj = await run("getSlopeRailwayInfo", selectSql);
    // res.code = 1;
    // res.msg = 'ok';
    var list = [];
    list = resObj;
    result(null, list);
  } catch (err) {
    logger.error(err)
    console.error('getSlopeRailwayInfo Error!!', err);
    res.code = 0;
    res.msg = 'getSlopeRailwayInfo Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};

Slope.deleteJangsuImg = async (req, result) => {
  try {
    // console.log(req)
    var fpop_key = req.query.fpop_key;
    var img_name = req.query.fileNm;
    const sql = `DELETE FROM tb_jangsu_img WHERE fpop_key = '${fpop_key}' AND img_name = '${img_name}';`;
    // console.log(sql);
    const resObj = await run("deleteJangsuImg", sql);
    // res.code = 1;
    // res.msg = 'ok';
    result(null, resObj);
  } catch (err) {
    logger.error(err)
    console.error('deleteJangsuImg Error!!', err);
    res.code = 0;
    res.msg = 'deleteJangsuImg Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};
Slope.updateJangsuInfoData = async (req, result) => {
  try {
    // console.log(req.body)
    var { col_ac, col_ag, col_ap, col_aq, col_ar, col_ah, col_ai, col_ax, col_at, col_al, col_am, col_an, col_au, col_av, col_aw, col_az, col_ba, col_ay, col_bb, col_bc, col_bd, col_be, col_bf, col_bg, col_bh, pidx } = req.body;
    var date1 = '';
    var date2 = '';
    var date3 = '';
    var date4 = '';
    if (col_al != '') {
      date1 = col_al.replace(/(\d{4})년\s*(\d{2})월\s*(\d{2})일/, '$1-$2-$3');
    }
    if (col_am != '') {
      date2 = col_am.replace(/(\d{4})년\s*(\d{2})월\s*(\d{2})일/, '$1-$2-$3');
    }
    if (col_ay != '') {
      date3 = col_ay.replace(/(\d{4})년\s*(\d{2})월\s*(\d{2})일/, '$1-$2-$3');
    }
    if (col_bb != '') {
      date4 = col_bb.replace(/(\d{4})년\s*(\d{2})월\s*(\d{2})일/, '$1-$2-$3');
    }
    const sql = `update field set 
      col_ac = '${col_ac}',
      col_ag = '${col_ag}',
      col_ap = '${col_ap}',
      col_aq = '${col_aq}',
      col_ar = '${col_ar}',
      col_ah = '${col_ah}',
      col_ai = '${col_ai}',
      col_ax = '${col_ax}',
      col_at = '${col_at}',
      col_al = '${date1}',
      col_am = '${date2}',
      col_an = '${col_an}',
      col_au = '${col_au}',
      col_av = '${col_av}',
      col_aw = '${col_aw}',
      col_az = '${col_az}',
      col_ba = '${col_ba}',
      col_ay = '${date3}',
      col_bb = '${date4}',
      col_bc = '${col_bc}',
      col_bd = '${col_bd}',
      col_be = '${col_be}',
      col_bf = '${col_bf}',
      col_bg = '${col_bg}',
      col_bh = '${col_bh}' where fpop_key = '${pidx}'
      `
    // var uuid = req.body.idx;
    // const selectSql = "select * from tb_slope_railway where uuid = ?";
    // var param = [uuid];
    // console.log(sql)
    const resObj = await run("updateJangsuInfoData", sql);
    // // res.code = 1;
    // // res.msg = 'ok';
    // var response = resObj.length > 0 ? resObj[0] : {};
    result(null, resObj);
  } catch (err) {
    logger.error(err)
    console.error('getSlopeRailwayInfo Error!!', err);
    res.code = 0;
    res.msg = 'getSlopeRailwayInfo Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};
Slope.getJangsuDetailDataLoad = async (req, result) => {
  try {
    // console.log(req)
    var info_uuid = req.query.info_uuid;
    const selectSql = `select col_a,col_b,col_c,col_d,col_e,col_f,col_g,col_h,col_i,col_j,col_k,col_l,col_m,col_n,col_o,col_p,col_q,col_r,col_s,col_t,col_u,col_v,col_w,col_x,col_y,col_z,col_aa,col_ab,col_ac,col_ad,col_ae,col_af,col_ag,col_ah,col_ai,col_aj,col_ak,col_al,col_am,col_an,col_ao,col_ap,col_aq,col_ar,col_ax,col_at,col_au,col_av,col_aw,col_az,col_ba,col_ay,col_bb,col_bc,col_bd,col_be,col_bf,col_bg,col_bh from field where fpop_key = '${info_uuid}'`;
    // var param = [uuid];
    const resObj = await run("getJangsuDetailDataLoad", selectSql);
    // console.log(resObj)
    // res.code = 1;
    // res.msg = 'ok';
    // var response = resObj.length > 0 ? resObj[0] : {};
    result(null, resObj);
  } catch (err) {
    logger.error(err)
    console.error('getJangsuDetailDataLoad Error!!', err);
    res.code = 0;
    res.msg = 'getJangsuDetailDataLoad Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};


Slope.updateJangsuImg = async (req, result) => {
  try {
    var fpop_key = req.body.fpop_key;
    var fileName = req.body.fileName;
    var imgPath = req.body.imgPath;
    var originFileName = req.body.originFileName;
    var originFilePath = req.body.originFilePath;
    var pngBase64 = req.body.pngBase64;
    var base64Data = pngBase64.replace(/^data:image\/png;base64,/, "");
    fs.writeFile(imgPath + "/" + fileName, base64Data, 'base64', async function (fsErr) {
      if (fsErr) {
        result(fsErr, null);
      }
      const selectSql = `update tb_jangsu_img set img_path = '${imgPath}', img_name = '${fileName}' where fpop_key = '${fpop_key}' and img_name = '${originFileName}' and img_path = '${originFilePath}'`;
      const resObj = await run("updateJangsuImg", selectSql);
      result(null, resObj);
    });
  } catch (err) {
    logger.error(err)
    console.error('updateJangsuImg Error!!', err);
    res.code = 0;
    res.msg = 'updateJangsuImg Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};
Slope.uploadCameraJangsuImg = async (req, result) => {
  try {
    const { uuid, fileName, imgPath } = req.body;

    // 1️⃣ 이미지 테이블 INSERT
    const imgSql = `
      INSERT INTO tb_jangsu_img (fpop_key, img_path, img_name)
      VALUES ('${uuid}', '${imgPath}', '${fileName}');
    `;
    const resObj = await run("uploadCameraJangsuImg - insert tb_jangsu_img", imgSql);
    result(null, resObj);
  } catch (err) {
    logger.error(err)
    console.error('uploadCameraJangsuImg Error!!', err);
    res.code = 0;
    res.msg = 'uploadCameraJangsuImg Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};
Slope.uploadGalleryJangsuImg = async (req, result) => {
  try {
    const { uuid } = req.body;
    const insertValues = req.files.map(file => {
      const img_path = file.destination; // ex: uploads/
      const img_name = file.filename;
      const fpop_key = uuid;
      return `('${fpop_key}', '${img_path}', '${img_name}')`;
    }).join(", ");

    // 최종 쿼리
    const insertQuery = `
      INSERT INTO tb_jangsu_img (fpop_key, img_path, img_name)
      VALUES ${insertValues};
    `;
    const resObj = await run("uploadCameraJangsuImg - insert tb_jangsu_img", insertQuery);
    result(null, resObj);
  } catch (err) {
    logger.error(err)
    console.error('uploadCameraJangsuImg Error!!', err);
    res.code = 0;
    res.msg = 'uploadCameraJangsuImg Error';
    res.result = err.message;
    console.log("error: ", err);
    result(err, null);
    return;
  }
};


module.exports = Slope;
