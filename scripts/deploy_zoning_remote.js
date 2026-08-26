/**
 * zoning-web SPA + zoning API 모듈 원격 배포
 * URL: http://182.213.27.207:60040/zoning-web/
 *
 * 사용:
 *   set DEPLOY_SSH_PASSWORD=비밀번호
 *   node deploy_zoning_remote.js
 *
 * 사전: zoning-web 빌드 산출물이 back/zoning-web/ 에 있어야 함
 *   (deploy_zoning_remote.bat 가 빌드+복사까지 수행)
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

const FILES = [
  'server.js',
  'app/routes/zoning.routes.js',
  'app/controllers/zoning.controller.js',
  'app/controllers/zoning.vworld.js',
  'app/models/zoning.model.js',
  'app/models/zoning.memory.js',
  'app/models/zoning.overlays.js',
];

function walkDir(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) files.push(...walkDir(full, base));
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

function collect() {
  const list = [];
  for (const rel of FILES) {
    const local = path.join(CONFIG.localBackDir, rel);
    if (!fs.existsSync(local)) {
      throw new Error(`missing: ${local}`);
    }
    list.push({
      local,
      remote: path.posix.join(CONFIG.remoteDir, rel.split(path.sep).join('/')),
    });
  }
  const zoningWebLocal = path.join(CONFIG.localBackDir, 'zoning-web');
  if (!fs.existsSync(path.join(zoningWebLocal, 'index.html'))) {
    throw new Error(`missing build: ${zoningWebLocal}/index.html — run build first`);
  }
  list.push(...walkDir(zoningWebLocal, CONFIG.localBackDir));
  return list;
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
  const files = collect();
  console.log(`SSH ${CONFIG.username}@${CONFIG.host}:${CONFIG.port}`);
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

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, s) => (err ? reject(err) : resolve(s)));
  });

  for (const f of files) {
    await ensureRemoteDir(sftp, path.posix.dirname(f.remote));
    process.stdout.write(`UP ${f.remote}\n`);
    await uploadFile(sftp, f.local, f.remote);
  }

  console.log('\n컨테이너 재시작...');
  const remoteScript = `
set +e
cd ${CONFIG.remoteDir}
pkill -x socat 2>/dev/null || true
fuser -k 60040/tcp 2>/dev/null || true
sleep 1
docker restart ${CONFIG.containerName}
sleep 6
docker ps --filter name=${CONFIG.containerName} --format "{{.Names}} {{.Status}} {{.Ports}}"
curl -s -m 5 -o /dev/null -w "zoning-web:%{http_code}\\n" "http://127.0.0.1:60040/zoning-web/" || true
curl -s -m 5 -o /dev/null -w "zoning-login:%{http_code}\\n" -X POST -H "Content-Type: application/json" -d '{"userId":"admin","userPw":"1"}' "http://127.0.0.1:60040/v1/zoning/auth/login" || true
curl -s -m 5 -X POST -H "Content-Type: application/json" -d '{"userId":"admin","userPw":"1"}' "http://127.0.0.1:60040/v1/zoning/auth/login" 2>&1 | head -c 200
echo ""
`;
  await exec(conn, remoteScript);
  conn.end();
  console.log('\n배포 완료 → http://182.213.27.207:60040/zoning-web/');
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
