const { Client } = require('ssh2');
const password = process.env.DEPLOY_SSH_PASSWORD;
if (!password) { console.error('DEPLOY_SSH_PASSWORD required'); process.exit(1); }

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`
echo "=== listeners 60027 24009 ==="
ss -lntp | grep -E '60027|24009' || true
echo "=== podman port propcrops-backend ==="
podman port propcrops-backend || true
echo "=== grep propcrops 60027 in /app ==="
grep -r "60027" /app/propcrops 2>/dev/null | head -20 || true
grep -r "60027" /etc/nginx 2>/dev/null | head -10 || true
echo "=== firewall ==="
iptables -t nat -L -n 2>/dev/null | grep -E '60027|24009' || true
`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '61.35.161.124', port: 60014, username: 'root', password });
conn.on('error', e => { console.error(e); process.exit(1); });
