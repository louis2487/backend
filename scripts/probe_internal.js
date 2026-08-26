const { Client } = require('ssh2');
const password = process.env.DEPLOY_SSH_PASSWORD;
if (!password) { console.error('DEPLOY_SSH_PASSWORD required'); process.exit(1); }

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`
echo "=== container logs tail ==="
podman logs propcrops-backend 2>&1 | tail -25
echo "=== inside container curl ==="
podman exec propcrops-backend sh -c 'curl -s -m 5 -o /dev/null -w "inside:%{http_code}\\n" http://127.0.0.1:24009/ || echo inside_failed'
podman exec propcrops-backend sh -c 'curl -s -m 10 "http://127.0.0.1:24009/v1/jangsu/getBoundsList?minx=127.35&miny=35.47&maxx=127.62&maxy=35.74" | head -c 180; echo'
echo "=== host curl 24009 ==="
curl -s -m 5 -o /dev/null -w "host24009:%{http_code}\\n" http://127.0.0.1:24009/ || true
echo "=== host curl 60027 ==="
curl -s -m 5 -o /dev/null -w "host60027:%{http_code}\\n" http://127.0.0.1:60027/ || true
`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '61.35.161.124', port: 60014, username: 'root', password });
conn.on('error', e => { console.error(e); process.exit(1); });
