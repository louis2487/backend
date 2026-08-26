const { Client } = require('ssh2');
const password = process.env.DEPLOY_SSH_PASSWORD;
if (!password) { console.error('DEPLOY_SSH_PASSWORD required'); process.exit(1); }

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`
set -e
if ss -lntp | grep -q ':60027'; then
  echo "60027 already listening"
else
  echo "starting socat 60027 -> 24009"
  nohup socat TCP-LISTEN:60027,fork,reuseaddr TCP:127.0.0.1:24009 >/tmp/socat-60027.log 2>&1 &
  sleep 1
fi
ss -lntp | grep -E '60027|24009' || true
curl -s -m 5 -o /dev/null -w "host60027:%{http_code}\\n" http://127.0.0.1:60027/ || true
curl -s -m 10 "http://127.0.0.1:60027/v1/jangsu/getBoundsList?minx=127.45&miny=35.60&maxx=127.58&maxy=35.70" | head -c 160; echo
`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '61.35.161.124', port: 60014, username: 'root', password });
conn.on('error', e => { console.error(e); process.exit(1); });
