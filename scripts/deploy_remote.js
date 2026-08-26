/**
 * jangsucrops-backend 컨테이너 배포
 * 대상: /app/jangsucrops/backend/web/back_end (호스트) = /web/back_end (컨테이너)
 *
 * 사용:
 *   set DEPLOY_SSH_PASSWORD=비밀번호
 *   node deploy_remote.js
 *   node deploy_remote.js --remote-only
 *
 * SSH 기본: 외부 182.213.27.207:60001
 * 내부망이면: set DEPLOY_SSH_HOST=192.168.50.192
 *
 * 권장: deploy_remote.bat 으로 실행
 */
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  host: process.env.DEPLOY_SSH_HOST || '182.213.27.207',
  port: Number(process.env.DEPLOY_SSH_PORT || 60001),
  username: process.env.DEPLOY_SSH_USER || 'root',
  password: process.env.DEPLOY_SSH_PASSWORD || '',
  remoteDir: '/app/jangsucrops/backend/web/back_end',
  containerName: 'jangsucrops-backend',
  localBackDir: path.resolve(__dirname, '..'),
};

const EXCLUDE = new Set([
  'node_modules',
  'uploads',
  'logs',
  'scripts',
  'admin', // admin_web 전용 배포(scripts/deploy_admin_remote.js)
  'zoning-web', // zoning-web 전용 배포(scripts/deploy_zoning_remote.js)
  '.env',
  'jsonData',
  'out',
  'node_server.zip',
  'merge_tileset_to_glb.cjs',
  'result.pdf',
]);

function walk(dir, base = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    if (EXCLUDE.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) files.push(...walk(full, base));
    else {
      files.push({
        local: full,
        remote: path.posix.join(
          CONFIG.remoteDir,
          path.relative(base, full).split(path.sep).join('/'),
        ),
      });
    }
  }
  return files;
}

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let errOut = '';
      stream
        .on('close', (code) => {
          if (code !== 0) reject(new Error(errOut || `exit ${code}`));
          else resolve();
        })
        .on('data', (d) => process.stdout.write(d))
        .stderr.on('data', (d) => {
          errOut += d.toString();
          process.stderr.write(d);
        });
    });
  });
}

function mkdirp(sftp, dir) {
  return new Promise((resolve, reject) => {
    sftp.mkdir(dir, (err) => {
      if (!err || err.code === 4) resolve();
      else reject(err);
    });
  });
}

async function ensureRemoteDir(sftp, remotePath) {
  const parts = remotePath.split('/').filter(Boolean);
  let cur = '';
  for (const p of parts) {
    cur += '/' + p;
    await mkdirp(sftp, cur);
  }
}

function uploadFile(sftp, local, remote) {
  return new Promise((resolve, reject) => {
    sftp.fastPut(local, remote, (err) => (err ? reject(err) : resolve()));
  });
}

async function main() {
  if (!CONFIG.password) {
    console.error('DEPLOY_SSH_PASSWORD 환경변수를 설정하세요.');
    process.exit(1);
  }
  console.log(`SSH ${CONFIG.username}@${CONFIG.host}:${CONFIG.port}`);
  const remoteOnly = process.argv.includes('--remote-only');
  const files = walk(CONFIG.localBackDir);
  console.log(`배포 ${files.length}개 → ${CONFIG.remoteDir}`);

  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect({
      host: CONFIG.host,
      port: CONFIG.port,
      username: CONFIG.username,
      password: CONFIG.password,
      readyTimeout: 30000,
    });
  });
  console.log('SSH 연결됨');

  if (!remoteOnly) {
    const sftp = await new Promise((resolve, reject) => {
      conn.sftp((err, s) => (err ? reject(err) : resolve(s)));
    });
    for (const f of files) {
      await ensureRemoteDir(sftp, path.posix.dirname(f.remote));
      process.stdout.write(`UP ${f.remote}\n`);
      await uploadFile(sftp, f.local, f.remote);
    }
  }

  console.log('\n컨테이너 재시작...');
  // 컨테이너가 host 60040->24012 직접 바인딩. socat이 60040을 가로채면
  // (1) docker start 실패 또는 (2) 빈 응답/네트워크 오류가 난다. socat 사용 금지.
  const remoteScript = `
set +e
cd ${CONFIG.remoteDir}
# 이전 배포에서 남은 socat 제거 (60040 충돌 방지)
pkill -x socat 2>/dev/null || true
fuser -k 60040/tcp 2>/dev/null || true
sleep 1
docker exec ${CONFIG.containerName} sh -c 'cd /web/back_end && npm install --omit=dev' 2>&1 | tail -15
docker restart ${CONFIG.containerName}
sleep 5
docker ps --filter name=${CONFIG.containerName} --format "{{.Names}} {{.Status}} {{.Ports}}"
ss -lntp | grep -E ':60040|:60039' || true
curl -s -m 5 -o /dev/null -w "via60040:%{http_code}\\n" "http://127.0.0.1:60040/v1/jangsu/getSimpleStati" || true
curl -s -m 5 "http://127.0.0.1:60040/v1/jangsu/getSimpleStati" 2>&1 | head -c 120
echo ""
curl -s -m 5 -o /dev/null -w "regionStati:%{http_code}\\n" "http://127.0.0.1:60040/v1/jangsu/getRegionStati" || true
curl -s -m 5 -o /dev/null -w "roadviewConvert:%{http_code}\\n" -X POST "http://127.0.0.1:60040/v1/load/roadview/convert" || true
`;
  await exec(conn, remoteScript);
  conn.end();
  console.log('\n배포 완료');
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
