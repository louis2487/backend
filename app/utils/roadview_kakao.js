'use strict';

const axios = require('axios');
const kakaoConfig = require('../config/kakao.config');

const cache = new Map();

function getApiKey() {
  return kakaoConfig.restApiKey || '';
}

/**
 * 카카오 주소 검색 → WGS84
 * @returns {Promise<{ lon: number, lat: number } | null>}
 */
async function geocodeAddress(address) {
  const q = String(address || '').trim();
  if (!q) return null;
  if (cache.has(q)) return cache.get(q);

  const key = getApiKey();
  if (!key) {
    cache.set(q, null);
    return null;
  }

  try {
    const headers = {
      Authorization: `KakaoAK ${key}`,
      KA: 'sdk/1.0.0 os/javascript origin/http://192.168.50.192:60040',
    };
    let res = await axios.get('https://dapi.kakao.com/v2/local/search/address.json', {
      params: { query: q },
      headers,
      timeout: 10000,
    });
    let doc = res.data && res.data.documents && res.data.documents[0];

    if (!doc) {
      res = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
        params: { query: q, size: 1 },
        headers,
        timeout: 10000,
      });
      doc = res.data && res.data.documents && res.data.documents[0];
    }

    if (!doc) {
      cache.set(q, null);
      return null;
    }
    const lon = Number(doc.x);
    const lat = Number(doc.y);
    const out = Number.isFinite(lon) && Number.isFinite(lat) ? { lon, lat } : null;
    cache.set(q, out);
    return out;
  } catch (err) {
    const detail =
      (err.response && err.response.data && err.response.data.message) || err.message;
    console.warn('카카오 주소검색 실패:', q, detail);
    cache.set(q, null);
    return null;
  }
}

function buildAddressFromRow(row) {
  const jibeon = String(row['지번'] || row['JIBEON'] || row['jibeon'] || '').trim();
  if (jibeon) return jibeon;

  const sigun = String(row['시군'] || row['SIGUN'] || '').trim();
  const jibun = String(row['JIBUN'] || row['지번주소'] || '').trim();
  if (sigun && jibun) {
    return `경기도 ${sigun}시 ${jibun}`.replace(/시시/, '시');
  }
  if (jibun && jibun.length > 3) return jibun;
  return '';
}

module.exports = {
  geocodeAddress,
  buildAddressFromRow,
  getApiKey,
};
