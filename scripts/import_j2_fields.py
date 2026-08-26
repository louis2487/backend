# -*- coding: utf-8 -*-
"""J2.shp 조사 필드 → propcrops.tb_jangsu_info (PNU 매칭 UPDATE).

자격증명은 back/app/config/db.config.js 에서 읽습니다.
사용:
  py back/scripts/import_j2_fields.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

try:
    import psycopg2
except ImportError:
    print("psycopg2 설치 필요: py -m pip install psycopg2-binary")
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "app" / "config" / "db.config.js"
GEOJSON = Path(__file__).resolve().parent / "_j2_export.geojson"

# J2 속성 → tb_jangsu_info 컬럼 (P2_PDF_매핑.md 기준)
FIELD_MAP = {
    "지번": "col_b",
    "도로명": "col_f",
    "용도지역": "col_h",
    "지형높이": "col_m",
    "공부지목": "col_d",
    "현황지목": "col_ac",
    "실면적": "col_g",
    "이용상황": "col_k",
    "지형형상": "col_n",
    "도로접면": "col_l",
    "기준년도": "col_q",
    "기준가격": "col_r",
    "개별공시": "col_s",
    "표준공시": "col_t",
    "재산구분": "col_u",
    "회계구분": "col_v",
    "재산관리관": "col_w",
    "분업관리관": "col_x",
    "위임관리관": "col_y",
    "재산번호": "col_z",
    "공유지분": "col_aa",
    "공유인수": "col_ab",
    "변동일자": "col_o",
    "변동원인": "col_p",
    "취득일자": "col_ad",
    "취득부서": "col_j",
    "취득방법": "col_i",
    "취득가액": "col_c",
    "국토계획": "col_ae",
    "기타법령": "col_af",
    "대부여부": "col_ag",
    "피대부자": "col_ap",
    "무단여부": "col_aq",
    "무단점유자": "col_ar",
    "적합여부": "col_ah",
    "사용자명": "col_ai",
    "대부용도": "col_ax",
    "대부면적": "col_at",
    "사용시작": "col_al",
    "사용종료": "col_am",
    "대부료": "col_an",
    "시설물": "col_au",
    "점유현황": "col_av",
    "점유자명": "col_aw",
    "무단용도": "col_az",
    "무단면적": "col_ba",
    "점유시작": "col_ay",
    "점유종료": "col_bb",
    "변상금": "col_bc",
    "무단시설": "col_bd",
    "주변현황": "col_be",
    "활용방안": "col_bf",
    "특기사항": "col_bg",
    "종합의견_1": "col_bh",
}


def load_db_config() -> dict:
    text = CONFIG.read_text(encoding="utf-8")

    def grab(key: str) -> str:
        m = re.search(rf'{key}:\s*"([^"]*)"', text)
        if not m:
            raise RuntimeError(f"db.config.js 에서 {key} 를 찾지 못함")
        return m.group(1)

    port_m = re.search(r"PORT:\s*(\d+)", text)
    return {
        "host": grab("HOST"),
        "user": grab("USER"),
        "password": grab("PASSWORD"),
        "dbname": grab("DB"),
        "port": int(port_m.group(1)) if port_m else 5432,
    }


def to_text(v) -> str | None:
    if v is None:
        return None
    return str(v)


def main() -> int:
    if not GEOJSON.exists():
        print(f"[오류] GeoJSON 없음: {GEOJSON}")
        print("먼저: ogr2ogr -f GeoJSON _j2_export.geojson J2.shp -oo ENCODING=CP949")
        return 1

    data = json.loads(GEOJSON.read_text(encoding="utf-8"))
    features = data.get("features") or []
    print(f"J2 features: {len(features)}")

    cfg = load_db_config()
    conn = psycopg2.connect(
        host=cfg["host"],
        port=cfg["port"],
        user=cfg["user"],
        password=cfg["password"],
        dbname=cfg["dbname"],
    )
    conn.autocommit = False

    updated = 0
    missing: list[str] = []
    samples: list[tuple] = []

    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM propcrops.tb_jangsu_info")
            before = cur.fetchone()[0]
            print(f"DB parcels before: {before}")

            for feat in features:
                props = feat.get("properties") or {}
                pnu = (props.get("pnu") or "").strip()
                if not pnu:
                    continue

                sets = []
                params = []

                # 관리번호 = pnu
                sets.append("col_a = %s")
                params.append(pnu)

                # 소재지/위치: 도로명 우선, 없으면 지번
                addr = props.get("위치") or props.get("도로명") or props.get("지번")
                if addr is not None:
                    sets.append("addr = %s")
                    params.append(to_text(addr))

                for src, col in FIELD_MAP.items():
                    if src not in props:
                        continue
                    sets.append(f"{col} = %s")
                    params.append(to_text(props.get(src)))

                # 실면적 → land_area / av_area / col_e(공부면적 보조)
                # col_g 는 FIELD_MAP(실면적)에서 이미 설정됨
                area = props.get("실면적")
                if area is not None:
                    try:
                        area_i = int(round(float(area)))
                    except (TypeError, ValueError):
                        area_i = None
                    if area_i is not None:
                        sets.append("land_area = %s")
                        params.append(area_i)
                        sets.append("av_area = %s")
                        params.append(area_i)
                        sets.append("col_e = %s")
                        params.append(str(area_i))

                # 공부지목 코드 앞자리 → fm_land_cd
                land_cd = props.get("공부지목")
                if land_cd:
                    sets.append("fm_land_cd = %s")
                    params.append(str(land_cd)[:6])

                sets.append("mod_date = TO_CHAR(NOW(), 'YYYYMMDDHH24MISS')")

                sql = f"""
                    UPDATE propcrops.tb_jangsu_info
                    SET {', '.join(sets)}
                    WHERE pnu = %s
                    RETURNING pnu, addr, col_d, col_ac, col_ag
                """
                params.append(pnu)
                cur.execute(sql, params)
                row = cur.fetchone()
                if row:
                    updated += 1
                    if len(samples) < 3:
                        samples.append(row)
                else:
                    missing.append(pnu)

            # public 미러는 컬럼이 적을 수 있어 공통 컬럼만 동기화
            cur.execute(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'tb_jangsu_info'
                """
            )
            public_cols = {r[0] for r in cur.fetchall()}
            sync_cols = [
                c
                for c in [
                    "addr",
                    "col_b",
                    "col_c",
                    "col_d",
                    "col_e",
                    "col_f",
                    "col_g",
                    "col_h",
                    "col_i",
                    "col_j",
                    "col_k",
                    "col_l",
                    "col_m",
                    "col_n",
                    "col_o",
                    "col_p",
                    "col_q",
                    "col_r",
                    "col_s",
                    "col_t",
                    "col_u",
                    "col_v",
                    "col_w",
                    "col_x",
                    "col_y",
                    "col_z",
                    "col_aa",
                    "col_ab",
                    "col_ac",
                    "col_ad",
                    "col_ae",
                    "col_af",
                    "col_ag",
                    "col_ah",
                    "col_ai",
                    "col_al",
                    "col_am",
                    "col_an",
                    "col_ap",
                    "col_aq",
                    "col_ar",
                    "col_at",
                    "col_au",
                    "col_av",
                    "col_aw",
                    "col_ax",
                    "col_ay",
                    "col_az",
                    "col_ba",
                    "col_bb",
                    "col_bc",
                    "col_bd",
                    "col_be",
                    "col_bf",
                    "col_bg",
                    "col_bh",
                    "land_area",
                    "av_area",
                    "fm_land_cd",
                    "mod_date",
                ]
                if c in public_cols
            ]
            if sync_cols:
                set_clause = ", ".join(f"{c} = p.{c}" for c in sync_cols)
                pnu_list = [
                    f["properties"]["pnu"]
                    for f in features
                    if f.get("properties", {}).get("pnu")
                ]
                cur.execute(
                    f"""
                    UPDATE public.tb_jangsu_info t
                    SET {set_clause}
                    FROM propcrops.tb_jangsu_info p
                    WHERE t.pnu = p.pnu
                      AND p.pnu = ANY(%s)
                    """,
                    (pnu_list,),
                )
                print(f"public mirror synced cols: {len(sync_cols)}")
            else:
                print("public mirror skip (no common cols)")

            conn.commit()

        print(f"updated: {updated}")
        print(f"missing pnu (not in DB): {len(missing)}")
        for p in missing:
            print(f"  - {p}")
        for s in samples:
            print(f"sample: pnu={s[0]} addr={s[1]} col_d={s[2]} col_ac={s[3]} col_ag={s[4]}")
        return 0 if not missing else 0
    except Exception as e:
        conn.rollback()
        print(f"[오류] {e}")
        return 1
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
