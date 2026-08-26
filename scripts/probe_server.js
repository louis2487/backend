const { Client } = require('ssh2');

const conn = new Client();
const password = process.env.DEPLOY_SSH_PASSWORD;
if (!password) { console.error('DEPLOY_SSH_PASSWORD required'); process.exit(1); }

conn.on('ready', () => {
  conn.exec(`
podman ps --format "table {{.Names}}\t{{.Ports}}" | head -20
echo "--- propcrops-backend ---"
podman inspect propcrops-backend --format '{{range .Mounts}}{{.Source}} => {{.Destination}}\n{{end}}' 2>/dev/null
ls -la /app/propcrops/backend/web 2>/dev/null | head -20
ls -la /app/propcrops/backend/web/back_end 2>/dev/null | head -15
echo "--- ports ---"
ss -lntp | grep -E '60027|24009|60028' || true
echo "--- nginx ---"
grep -r "60027" /etc/nginx 2>/dev/null | head -5 || true
podman exec propcrops-backend ls -la /web/back_end 2>/dev/null | head -15
podman exec propcrops-backend sh -c 'head -5 /web/back_end/server.js; grep -n PORT /web/back_end/server.js | head -3; ps aux | grep node | grep -v grep | head -5'
echo "--- curl internal ---"
curl -s -o /dev/null -w "24009:%{http_code}\n" http://127.0.0.1:24009/ || true
curl -s http://127.0.0.1:24009/v1/jangsu/getBoundsList?minx=127.35 2>&1 | head -3
echo "--- what listens 60027 ---"
iptables -t nat -L -n 2>/dev/null | grep 60027 || true
grep -r "60027" /app /etc 2>/dev/null | head -10 || true
curl -s http://127.0.0.1:60027/ 2>&1 | head -5
ss -lntp | head -30
`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '61.35.161.124', port: 60014, username: 'root', password });
conn.on('error', e => { console.error(e); process.exit(1); });
