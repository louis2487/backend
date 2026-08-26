const fs = require('fs');
const JSZip = require('jszip');
const path = require('path');

(async () => {
  const z = await JSZip.loadAsync(
    fs.readFileSync(path.join(__dirname, '../app/templates/chungju_land_survey_template.hwpx'))
  );
  const header = await z.file('Contents/header.xml').async('string');

  function block(id) {
    const m = header.match(
      new RegExp(`<hh:paraPr\\b[^>]*\\bid="${id}"[^>]*>[\\s\\S]*?</hh:paraPr>`)
    );
    return m ? m[0].replace(/\s+/g, ' ').slice(0, 400) : null;
  }
  for (const id of ['1', '6', '7', '3', '28', '35', '9', '11', '116', '117']) {
    console.log('====', id);
    console.log(block(id));
  }
})().catch((e) => console.error(e));
