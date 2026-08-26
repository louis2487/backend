/**
 * 60040 → propcrops-backend(24009) socat 포워딩 복구
 * 60027과 동일하게 Node API가 응답하도록 설정합니다.
 *
 * 사용:
 *   set DEPLOY_SSH_PASSWORD=비밀번호
 *   node fix_port_60040_socat.js
 */
const { Client } = require('ssh2');

const password = process.env.DEPLOY_SSH_PASSWORD;
if (!password) {
  console.error('DEPLOY_SSH_PASSWORD required');
  process.exit(1);
}

const conn = new Client();
conn
  .on('ready', () => {
    conn.exec(
      `
echo "=== before ==="
ss -lntp | grep -E '60027|60040|24009' || true
command -v socat >/dev/null 2>&1 || dnf install -y socat 2>&1 | tail -3 || true
pkill -f 'socat TCP-LISTEN:60040' 2>/dev/null || true
nohup socat TCP-LISTEN:60040,fork,reuseaddr TCP:127.0.0.1:24009 >/tmp/socat-60040.log 2>&1 &
sleep 1
echo "=== after ==="
ss -lntp | grep -E '60027|60040|24009' || true
echo "=== internal 24009 ==="
curl -s -m 15 "http://127.0.0.1:24009/v1/jangsu/getBoundsList?minx=127.45&miny=35.60&maxx=127.58&maxy=35.70" | head -c 180; echo
echo "=== host 60040 ==="
curl -s -m 15 "http://127.0.0.1:60040/v1/jangsu/getBoundsList?minx=127.45&miny=35.60&maxx=127.58&maxy=35.70" | head -c 180; echo
echo "=== host 60027 ==="
curl -s -m 15 "http://127.0.0.1:60027/v1/jangsu/getBoundsList?minx=127.45&miny=35.60&maxx=127.58&maxy=35.70" | head -c 180; echo
`,
      (err, stream) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        stream.on('data', (d) => process.stdout.write(d));
        stream.stderr.on('data', (d) => process.stderr.write(d));
        stream.on('close', () => conn.end());
      },
    );
  })
  .on('error', (e) => {
    console.error(e);
    process.exit(1);
  })
  .connect({ host: '61.35.161.124', port: 60014, username: 'root', password });
