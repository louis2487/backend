/**
 * 시연용 연속지적·주제도 좌표 (zb_layer_catalog.overlays / 메모리 폴백 공용)
 * 안동 MAP_CENTER(36.5684, 128.7294) 주변에 불규칙 필지 격자
 */

function ring(south, west, north, east) {
  return [
    { lat: south, lng: west },
    { lat: south, lng: east },
    { lat: north, lng: east },
    { lat: north, lng: west },
  ];
}

/** 의사난수로 필지 모서리 살짝 비틀어 실제 지적처럼 보이게 */
function jitter(n, seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * n;
}

function parcelAt(i, j, originLat, originLng, dLat, dLng) {
  const south = originLat + i * dLat;
  const west = originLng + j * dLng;
  const north = south + dLat * (0.82 + (i % 3) * 0.05);
  const east = west + dLng * (0.78 + (j % 4) * 0.05);
  const s = i * 31 + j * 17;
  return [
    { lat: south + jitter(0.0008, s + 1), lng: west + jitter(0.0008, s + 2) },
    { lat: south + jitter(0.0008, s + 3), lng: east + jitter(0.0008, s + 4) },
    { lat: north + jitter(0.0008, s + 5), lng: east + jitter(0.0008, s + 6) },
    { lat: north + jitter(0.0008, s + 7), lng: west + jitter(0.0008, s + 8) },
  ];
}

function buildCadastralRings() {
  const rings = [];
  // 안동 중심 인근 — 화면 줌 13~15에서 필지선이 바로 보이게
  const originLat = 36.55;
  const originLng = 128.70;
  const dLat = 0.0032;
  const dLng = 0.0038;
  for (let i = 0; i < 14; i++) {
    for (let j = 0; j < 16; j++) {
      rings.push(parcelAt(i, j, originLat, originLng, dLat, dLng));
    }
  }
  return rings;
}

function buildThemeRings(side) {
  const shift = side === 'after' ? 0.004 : 0;
  return [ring(36.555, 128.705 + shift, 36.595, 128.755 + shift)];
}

function emptyGeoms() {
  return { cadastral: [], theme: [] };
}

function buildOverlays() {
  return {
    before: { cadastral: buildCadastralRings(), theme: buildThemeRings('before') },
    after: { cadastral: buildCadastralRings(), theme: buildThemeRings('after') },
  };
}

module.exports = { buildOverlays, emptyGeoms, buildCadastralRings, buildThemeRings };
