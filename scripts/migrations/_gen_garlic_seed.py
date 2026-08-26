import json
from pathlib import Path

raw = json.loads(
    Path(r"C:\sejong\back\scripts\migrations\garlic_seed_geojson.json").read_text(
        encoding="utf-8"
    )
)


def esc(v):
    if v is None:
        return "NULL"
    return "'" + str(v).replace("'", "''") + "'"


def ring_wkt(ring):
    return ", ".join(f"{lon} {lat}" for lon, lat in ring)


lines = ["-- auto-generated seed for garlic_a"]
for row in raw:
    a = row["attrs"]
    id_ = str(a["ID"]).strip()
    coords = row["coords"]
    polys = [f"(({ring_wkt(ring)}))" for ring in coords]
    wkt = "MULTIPOLYGON(" + ",".join(polys) + ")"
    attrs_json = json.dumps(a, ensure_ascii=False).replace("'", "''")
    lines.append(
        f"""INSERT INTO garlic_a (
  id, uid, pnu, stdg_cd, stdg_addr, clsf_nm, clsf_cd, ldcg_cd, sb_pnu,
  area, source_nm, flight_ymd, attrs, geom, geo_center
) VALUES (
  {esc(id_)}, {esc(a.get('UID'))}, {esc(a.get('PNU'))}, {esc(a.get('STDG_CD'))},
  {esc(a.get('STDG_ADDR'))}, {esc(a.get('CLSF_NM'))}, {esc(a.get('CLSF_CD'))},
  {esc(a.get('LDCG_CD'))}, {esc(a.get('SB_PNU'))},
  {a.get('AREA') if a.get('AREA') is not None else 'NULL'},
  {esc(a.get('SOURCE_NM'))}, {esc(a.get('FLIGHT_YMD'))},
  '{attrs_json}'::jsonb,
  ST_Multi(ST_SetSRID(ST_GeomFromText('{wkt}'), 4326)),
  ST_PointOnSurface(ST_SetSRID(ST_GeomFromText('{wkt}'), 4326))
)
ON CONFLICT (id) DO UPDATE SET
  uid=EXCLUDED.uid, pnu=EXCLUDED.pnu, stdg_addr=EXCLUDED.stdg_addr,
  clsf_nm=EXCLUDED.clsf_nm, area=EXCLUDED.area, attrs=EXCLUDED.attrs,
  geom=EXCLUDED.geom, geo_center=EXCLUDED.geo_center;
"""
    )

out = Path(r"C:\sejong\back\scripts\migrations\garlic_002_seed.sql")
out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", len(raw), "inserts,", out.stat().st_size, "bytes")
