const JSZip = require('jszip');
const fs = require('fs');

(async () => {
  const z = await JSZip.loadAsync(
    fs.readFileSync('./app/templates/chungju_land_survey_template.hwpx')
  );
  const sec = await z.file('Contents/section0.xml').async('string');
  const cells = [...sec.matchAll(/<hp:tc\b[^>]*>([\s\S]*?)<\/hp:tc>/g)];
  for (const i of [171, 172, 173, 174]) {
    console.log('\n===== cell', i, '=====\n');
    console.log(cells[i][1]);
  }
})();
