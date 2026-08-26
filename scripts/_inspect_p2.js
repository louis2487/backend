const fs=require('fs');
const JSZip=require('jszip');
(async()=>{
  const zip=await JSZip.loadAsync(fs.readFileSync('app/templates/chungju_land_survey_template.hwpx'));
  const xml=await zip.file('Contents/section0.xml').async('string');
  // find 관리번호 / 소재지 / pageBreak contexts
  for (const key of ['관리번호','소재지','조사자','항공사진']) {
    let idx=0, n=0;
    while ((idx=xml.indexOf(key, idx))>=0 && n<3) {
      const slice=xml.slice(Math.max(0,idx-350), idx+120).replace(/\n/g,' ');
      console.log('\n==', key, n, '==');
      console.log(slice.slice(-450));
      idx+=key.length; n++;
    }
  }
  // pageBreak occurrences
  const breaks=[...xml.matchAll(/pageBreak="(\d+)"/g)].map(m=>m[1]);
  console.log('\npageBreak values count', breaks.length, 'ones', breaks.filter(b=>b==='1').length);
  // paragraphs with pageBreak=1
  const re=/<hp:p\b[^>]*pageBreak="1"[^>]*>/g; let m;
  while((m=re.exec(xml))) console.log('PBREAK', m[0].slice(0,180));
  // tables after 조사자
  const tblRe=/<hp:tbl\b[^>]*>/g; let t, ti=0;
  while((t=tblRe.exec(xml))) {
    const head=xml.slice(t.index, t.index+250).replace(/\n/g,' ');
    console.log('TBL', ti++, head.slice(0,220));
  }
})();
