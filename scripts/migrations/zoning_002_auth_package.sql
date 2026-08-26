-- Zoning auth + package management (additive migration)

CREATE TABLE IF NOT EXISTS zb_user (
  user_id     TEXT PRIMARY KEY,
  user_pw     TEXT NOT NULL,
  user_uuid   TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'inspector'
              CHECK (role IN ('admin', 'inspector', 'reviewer')),
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zb_package (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  sido          TEXT NOT NULL DEFAULT '',
  sigungu       TEXT NOT NULL DEFAULT '',
  theme         TEXT NOT NULL DEFAULT '',
  target_id     TEXT REFERENCES zb_inspection_target(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'in_progress', 'closed')),
  assigned_role TEXT,
  note          TEXT NOT NULL DEFAULT '',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Demo accounts (plain text to match existing tb_user style; migrate hashing later)
INSERT INTO zb_user (user_id, user_pw, user_uuid, display_name, role) VALUES
  ('admin', '1', 'zu-admin-001', '시스템관리자', 'admin'),
  ('inspector01', '1', 'zu-insp-001', '1차 검수자', 'inspector'),
  ('reviewer01', '1', 'zu-rev-001', '심사 담당자', 'reviewer')
ON CONFLICT (user_id) DO UPDATE SET
  user_pw = EXCLUDED.user_pw,
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  active = TRUE;

INSERT INTO zb_package (id, name, sido, sigungu, theme, target_id, status, assigned_role, note) VALUES
  ('pkg1', '안동시 용도지역 1차 검수', '경상북도', '안동시', '용도지역', 't1', 'in_progress', 'inspector', '풍산·와룡 등'),
  ('pkg2', '안동시 용도지구 검수', '경상북도', '안동시', '용도지구', 't2', 'open', 'inspector', ''),
  ('pkg3', '예천군 용도지역 심사', '경상북도', '예천군', '용도지역', 't3', 'open', 'reviewer', '심사 단계')
ON CONFLICT (id) DO NOTHING;
