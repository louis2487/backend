/**
 * 현장사진 슬롯 정렬
 * 파일명 *_1.* ~ *_4.* → 1근경 2원경 3항공 4지적, 그 외는 뒤로
 */
const JANGSU_IMG_ORDER_BY = `
  CASE
    WHEN img_name ~* '_[1-4]\\.(jpe?g|png)$'
    THEN CAST((regexp_match(img_name, '_([1-4])\\.(?:jpe?g|png)$', 'i'))[1] AS integer)
    ELSE 99
  END ASC,
  img_name ASC
`.replace(/\s+/g, ' ').trim();

const SLOT_LABELS = {
  1: '근경',
  2: '원경',
  3: '항공',
  4: '지적',
};

module.exports = { JANGSU_IMG_ORDER_BY, SLOT_LABELS };
