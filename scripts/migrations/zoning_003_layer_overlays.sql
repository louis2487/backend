-- 연속지적·주제도 샘플 도형 (기존 zb_layer_catalog 테이블에 컬럼 추가)

ALTER TABLE zb_layer_catalog
  ADD COLUMN IF NOT EXISTS overlays JSONB NOT NULL DEFAULT '{}'::jsonb;
