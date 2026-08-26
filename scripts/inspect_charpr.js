const fs = require('fs');
const JSZip = require('jszip');

(async () => {
  const z = await JSZip.loadAsync(
    fs.readFileSync('./app/templates/chungju_land_survey_template.hwpx')
  );
  const header = await z.file('Contents/header.xml').async('string');
  for (const id of ['5', '6', '7', '8', '24']) {
    const m = header.match(
      new RegExp(`<hh:charPr\\b[^>]*id="${id}"[^>]*>[\\s\\S]*?</hh:charPr>`)
    );
    if (!m) {
      console.log(id, 'missing');
      continue;
    }
    const s = m[0];
    const keys = [
      'textDirection',
      'vert',
      'upright',
      'rotate',
      'width',
      'height',
    ];
    const found = {};
    for (const k of keys) {
      const r = s.match(new RegExp(`${k}="([^"]*)"`));
      if (r) found[k] = r[1];
    }
    console.log('charPr', id, found, s.slice(0, 200).replace(/\s+/g, ' '));
  }
})().catch((e) => console.error(e));
