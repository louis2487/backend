const { Client } = require('ssh2');
const password = process.env.DEPLOY_SSH_PASSWORD;
if (!password) process.exit(1);

const conn = new Client();
conn.on('ready', () => {
  conn.exec(
    `
echo "=== grep 60040 ==="
grep -r "60040" /etc 2>/dev/null | head -20 || true
grep -r "60040" /app 2>/dev/null | head -20 || true
iptables -t nat -L -n 2>/dev/null | grep 60040 || true
echo "=== jangsucrops logs ==="
podman logs jangsucrops-backend 2>&1 | tail -10
echo "=== jangsucrops db config ==="
podman exec jangsucrops-backend sh -c 'grep -r "HOST\\|PORT\\|DB" /web/back_end/app/config/db.config.js 2>/dev/null | head -10' || true
`,
    (err, stream) => {
      stream.on('data', (d) => process.stdout.write(d));
      stream.on('close', () => conn.end());
    },
  );
}).connect({ host: '61.35.161.124', port: 60014, username: 'root', password });
