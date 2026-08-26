const fs = require('fs');
const JSZip = require('jszip');
const path = require('path');

(async () => {
  const z = await JSZip.loadAsync(
    fs.readFileSync(path.join(__dirname, '../app/templates/chungju_land_survey_template.hwpx'))
  );
  const header = await z.file('Contents/header.xml').async('string');
  const re = /<hh:paraPr\b[^>]*id="(\d+)"[^>]*>([\s\S]*?)<\/hh:paraPr>/g;
  const items = [];
  let m;
  while ((m = re.exec(header))) {
    const id = m[1];
    const body = m[2];
    const align = (body.match(/horizontal="([^"]+)"/) || [])[1];
    const fp = body.replace(/horizontal="[^"]+"/, 'horizontal="?"').replace(/\s+/g, ' ');
    items.push({ id, align, fp });
  }
  const byFp = new Map();
  for (const it of items) {
    if (!byFp.has(it.fp)) byFp.set(it.fp, {});
    byFp.get(it.fp)[it.align] = it.id;
  }
  const pairs = [];
  for (const a of byFp.values()) {
    if (a.LEFT && a.CENTER) pairs.push([a.LEFT, a.CENTER]);
  }
  console.log('pairs', pairs.length);
  console.log(pairs.map((p) => p.join('->')).join('\n'));

  for (const id of ['7', '3', '28', '35', '97', '109']) {
    const hit = pairs.find((p) => p[0] === id);
    console.log('value cell', id, '-> center twin', hit && hit[1]);
  }
})().catch((e) => console.error(e));
