/**
 * Apply garlic DDL + seed on remote DB via SSH.
 * Usage:
 *   set DEPLOY_SSH_PASSWORD=...
 *   node scripts/migrations/garlic_003_remote_apply.js
 */
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  host: process.env.DEPLOY_SSH_HOST || '182.213.27.207',
  port: Number(process.env.DEPLOY_SSH_PORT || 60001),
  username: process.env.DEPLOY_SSH_USER || 'root',
  password: process.env.DEPLOY_SSH_PASSWORD || '',
};

const schemaLocal = path.join(__dirname, 'garlic_001_schema.sql');
const seedLocal = path.join(__dirname, 'garlic_002_seed.sql');
const remoteDir = '/tmp/garlic_migrate';

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      let errOut = '';
      stream.on('data', (d) => {
        out += d.toString();
        process.stdout.write(d);
      });
      stream.stderr.on('data', (d) => {
        errOut += d.toString();
        process.stderr.write(d);
      });
      stream.on('close', (code) => {
        if (code !== 0) reject(new Error(errOut || out || `exit ${code}`));
        else resolve(out);
      });
    });
  });
}

function upload(sftp, local, remote) {
  return new Promise((resolve, reject) => {
    sftp.fastPut(local, remote, (err) => (err ? reject(err) : resolve()));
  });
}

async function main() {
  if (!CONFIG.password) {
    console.error('DEPLOY_SSH_PASSWORD required');
    process.exit(1);
  }
  if (!fs.existsSync(seedLocal)) {
    console.error('missing garlic_002_seed.sql — run _gen_garlic_seed.py first');
    process.exit(1);
  }

  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn
      .on('ready', resolve)
      .on('error', reject)
      .connect({
        host: CONFIG.host,
        port: CONFIG.port,
        username: CONFIG.username,
        password: CONFIG.password,
        readyTimeout: 30000,
      });
  });
  console.log('SSH connected');

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, s) => (err ? reject(err) : resolve(s)));
  });

  await exec(conn, `mkdir -p ${remoteDir}`);
  await upload(sftp, schemaLocal, `${remoteDir}/garlic_001_schema.sql`);
  await upload(sftp, seedLocal, `${remoteDir}/garlic_002_seed.sql`);

  // DB is typically reachable from host as 192.168.50.192:60039 or via docker network.
  // Try common patterns used by this stack.
  const applyCmd = `
set -e
SCHEMA=${remoteDir}/garlic_001_schema.sql
SEED=${remoteDir}/garlic_002_seed.sql
export PGPASSWORD=jangsucrops123

try_psql() {
  local host=\$1 port=\$2
  echo "TRY \$host:\$port"
  psql -h "\$host" -p "\$port" -U jangsucrops -d jangsucropsdb -v ON_ERROR_STOP=1 -f "\$SCHEMA" \\
    && psql -h "\$host" -p "\$port" -U jangsucrops -d jangsucropsdb -v ON_ERROR_STOP=1 -f "\$SEED" \\
    && psql -h "\$host" -p "\$port" -U jangsucrops -d jangsucropsdb -c "SELECT count(*) AS garlic_a_count FROM garlic_a;" \\
    && return 0
  return 1
}

if try_psql 192.168.50.192 60039; then exit 0; fi
if try_psql 127.0.0.1 60039; then exit 0; fi
if docker exec jangsucrops-backend sh -c 'command -v psql' >/dev/null 2>&1; then
  docker cp \$SCHEMA jangsucrops-backend:/tmp/garlic_001_schema.sql
  docker cp \$SEED jangsucrops-backend:/tmp/garlic_002_seed.sql
  docker exec -e PGPASSWORD=jangsucrops123 jangsucrops-backend \\
    psql -h 192.168.50.192 -p 60039 -U jangsucrops -d jangsucropsdb -v ON_ERROR_STOP=1 -f /tmp/garlic_001_schema.sql
  docker exec -e PGPASSWORD=jangsucrops123 jangsucrops-backend \\
    psql -h 192.168.50.192 -p 60039 -U jangsucrops -d jangsucropsdb -v ON_ERROR_STOP=1 -f /tmp/garlic_002_seed.sql
  docker exec -e PGPASSWORD=jangsucrops123 jangsucrops-backend \\
    psql -h 192.168.50.192 -p 60039 -U jangsucrops -d jangsucropsdb -c "SELECT count(*) AS garlic_a_count FROM garlic_a;"
  exit 0
fi
echo "Could not apply migration"
exit 1
`;
  await exec(conn, applyCmd);
  conn.end();
  console.log('remote apply done');
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
