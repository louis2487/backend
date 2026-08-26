/**
 * 브이월드 연속지적 프록시 (브라우저 CORS·DOMAIN 우회)
 * GET /v1/zoning/vworld/wms
 * GET /v1/zoning/vworld/cadastral
 */
const axios = require('axios');
const logger = require('../config/winston');

const KEY =
  process.env.VWORLD_KEY ||
  process.env.VITE_VWORLD_KEY ||
  '9A976F62-954C-366D-8CB2-C885909A6BC7';
const DOMAIN = (process.env.VWORLD_DOMAIN || '182.213.27.207')
  .replace(/^https?:\/\//i, '')
  .split('/')[0]
  .split(':')[0];

function lngLatToMercator(lng, lat) {
  const x = (Number(lng) * 20037508.34) / 180;
  let y = Math.log(Math.tan(((90 + Number(lat)) * Math.PI) / 360)) / (Math.PI / 180);
  y = (y * 20037508.34) / 180;
  return [x, y];
}

function resolveBbox(q) {
  if (q.bbox) return String(q.bbox);
  if (q.west != null && q.south != null && q.east != null && q.north != null) {
    const [minx, miny] = lngLatToMercator(q.west, q.south);
    const [maxx, maxy] = lngLatToMercator(q.east, q.north);
    return `${minx},${miny},${maxx},${maxy}`;
  }
  return null;
}

const DEFAULT_CADASTRAL_LAYERS = 'lp_pa_cbnd_bonbun,lp_pa_cbnd_bubun';
const DEFAULT_CADASTRAL_STYLES = 'lp_pa_cbnd_bonbun_line,lp_pa_cbnd_bubun_line';

function resolveWmsParams(query) {
  const layers = String(query.layers || DEFAULT_CADASTRAL_LAYERS).trim();
  const layerList = layers.split(',').map((s) => s.trim()).filter(Boolean);
  const stylesRaw = query.styles != null ? String(query.styles) : '';
  const styleList = stylesRaw
    ? stylesRaw.split(',').map((s) => s.trim())
    : layerList.map(() => '');
  while (styleList.length < layerList.length) styleList.push('');
  const isCadastral =
    layerList.length === 2 &&
    layerList[0] === 'lp_pa_cbnd_bonbun' &&
    layerList[1] === 'lp_pa_cbnd_bubun';
  const transparent =
    query.transparent === 'true'
      ? 'TRUE'
      : query.transparent === 'false'
        ? 'FALSE'
        : isCadastral
          ? 'FALSE'
          : 'TRUE';
  const bgcolor =
    query.bgcolor != null
      ? `&BGCOLOR=${encodeURIComponent(String(query.bgcolor))}`
      : isCadastral
        ? '&BGCOLOR=0xFFFFFF'
        : '';
  return {
    layers: encodeURIComponent(layerList.join(',')),
    styles: encodeURIComponent(styleList.join(',')),
    transparent,
    bgcolor,
  };
}

exports.proxyWms = async (req, res) => {
  try {
    const bbox = resolveBbox(req.query);
    if (!bbox) {
      res.status(400).type('text').send('bbox or west/south/east/north required');
      return;
    }
    const w = Math.min(2048, Math.max(64, Number(req.query.w || req.query.width || 1024)));
    const h = Math.min(2048, Math.max(64, Number(req.query.h || req.query.height || 1024)));
    const wms = resolveWmsParams(req.query);
    const url =
      'https://api.vworld.kr/req/wms?' +
      'SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0' +
      `&LAYERS=${wms.layers}&STYLES=${wms.styles}` +
      '&CRS=EPSG:3857' +
      `&BBOX=${bbox}&WIDTH=${w}&HEIGHT=${h}` +
      `&FORMAT=image/png&TRANSPARENT=${wms.transparent}${wms.bgcolor}&EXCEPTIONS=text/xml` +
      `&KEY=${encodeURIComponent(KEY)}&DOMAIN=${encodeURIComponent(DOMAIN)}`;

    const resp = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 20000,
      validateStatus: () => true,
    });
    const ctype = String(resp.headers['content-type'] || '');
    if (ctype.includes('xml') || ctype.includes('json') || resp.status >= 400) {
      logger.warn(`[zoning-vworld] WMS fail status=${resp.status} type=${ctype}`);
      res.status(502).type('text').send('vworld wms error');
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=30',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(Buffer.from(resp.data));
  } catch (err) {
    logger.error(`[zoning-vworld] WMS ${err.message}`);
    res.status(502).type('text').send(err.message);
  }
};

exports.proxyCadastral = async (req, res) => {
  try {
    const west = Number(req.query.west);
    const south = Number(req.query.south);
    const east = Number(req.query.east);
    const north = Number(req.query.north);
    if (![west, south, east, north].every(Number.isFinite)) {
      res.send({ code: 0, msg: 'bbox required', result: { type: 'FeatureCollection', features: [] } });
      return;
    }
    const params = new URLSearchParams({
      service: 'data',
      version: '2.0',
      request: 'GetFeature',
      format: 'json',
      errorformat: 'json',
      size: '1000',
      page: '1',
      geometry: 'true',
      attribute: 'true',
      crs: 'EPSG:4326',
      geomfilter: `BOX(${west},${south},${east},${north})`,
      data: 'lp_pa_cbnd_bubun',
      key: KEY,
      domain: DOMAIN,
    });
    const url = `https://api.vworld.kr/req/data?${params.toString()}`;
    const resp = await axios.get(url, { timeout: 20000, validateStatus: () => true });
    const fc =
      resp.data?.response?.status === 'OK'
        ? resp.data.response.result?.featureCollection
        : null;
    res.send({
      code: 1,
      msg: 'ok',
      result: fc || { type: 'FeatureCollection', features: [] },
    });
  } catch (err) {
    logger.error(`[zoning-vworld] data ${err.message}`);
    res.send({ code: 1, msg: err.message, result: { type: 'FeatureCollection', features: [] } });
  }
};
