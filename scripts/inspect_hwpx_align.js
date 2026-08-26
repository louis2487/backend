const fs = require('fs');
const JSZip = require('jszip');
const path = require('path');

(async () => {
  const z = await JSZip.loadAsync(
    fs.readFileSync(path.join(__dirname, '../app/templates/chungju_land_survey_template.hwpx'))
  );
  const header = await z.file('Contents/header.xml').async('string');

  // find first few paraPr blocks
  const re = /<(?:hh:)?paraPr\b[^>]*>[\s\S]*?<\/(?:hh:)?paraPr>/g;
  let m;
  let i = 0;
  const centers = [];
  const lefts = [];
  while ((m = re.exec(header)) && i < 300) {
    const body = m[0];
    const idM = body.match(/\bid="(\d+)"/) || body.match(/\bid='(\d+)'/);
    const alignM = body.match(/horizontal="([^"]+)"/);
    if (idM && alignM) {
      if (alignM[1] === 'CENTER') centers.push(idM[1]);
      if (alignM[1] === 'LEFT') lefts.push(idM[1]);
      if (i < 15) console.log('paraPr', idM[1], alignM[1], body.slice(0, 120).replace(/\s+/g, ' '));
    }
    i++;
  }
  console.log('count scanned', i);
  console.log('CENTER', [...new Set(centers)].slice(0, 30).join(','));
  console.log('LEFT', [...new Set(lefts)].slice(0, 30).join(','));

  // specifically check ids used in value cells: 7,3,28,35,97,109
  for (const id of ['7', '3', '28', '35', '97', '109', '112', '118']) {
    const block = header.match(new RegExp(`<(?:hh:)?paraPr\\b[^>]*\\bid="${id}"[^>]*>[\\s\\S]*?</(?:hh:)?paraPr>`));
    if (!block) {
      console.log('id', id, 'NOT FOUND');
      continue;
    }
    const a = block[0].match(/horizontal="([^"]+)"/);
    console.log('id', id, 'align', a && a[1]);
  }
})().catch((e) => console.error(e));
