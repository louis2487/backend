/**
 * 로컬 data/ 사진 일괄·감시 등록
 *
 * 사용:
 *   node scripts/import_data_photos.js
 *   node scripts/import_data_photos.js --watch
 *   set DATA_PHOTO_DIR=C:\j\jangsu\data
 *
 * 파일명: {관리번호}_1.png|jpg|jpeg
 *   _1 근경 / _2 원경 / _3 항공 / _4 지적
 */
const {
  DEFAULT_DATA_DIR,
  importAll,
  startWatch,
  SLOT_LABELS,
} = require('../app/utils/data_photo_import');

async function main() {
  const watch = process.argv.includes('--watch');
  const dataDir = process.env.DATA_PHOTO_DIR || DEFAULT_DATA_DIR;

  console.log('[data-photo] dataDir =', dataDir);
  console.log(
    '[data-photo] slots =',
    Object.entries(SLOT_LABELS)
      .map(([k, v]) => `_${k}:${v}`)
      .join(' ')
  );

  if (watch) {
    startWatch({ dataDir });
    return;
  }

  const results = await importAll({ dataDir });
  if (!results.length) {
    console.log('[data-photo] 처리할 파일 없음');
    process.exit(0);
  }

  let ok = 0;
  let fail = 0;
  for (const r of results) {
    if (r.ok) {
      ok += 1;
      console.log(
        `OK  ${r.fileName} → ${r.fpopKey} ${r.label}(_${r.slot}) ${r.img_path}/${r.img_name}`
      );
    } else {
      fail += 1;
      console.log(`FAIL ${r.fileName} → ${r.reason}`);
    }
  }
  console.log(`[data-photo] done ok=${ok} fail=${fail}`);
  process.exit(fail ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
