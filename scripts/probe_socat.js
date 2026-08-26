const { Client } = require('ssh2');
const password = process.env.DEPLOY_SSH_PASSWORD;
if (!password) { console.error('DEPLOY_SSH_PASSWORD required'); process.exit(1); }

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`
which socat || echo no_socat
cat /tmp/socat-60027.log 2>/dev/null || true
podman inspect propcrops-backend --format '{{.HostConfig.PortBindings}}'
`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '61.35.161.124', port: 60014, username: 'root', password });
conn.on('error', e => { console.error(e); process.exit(1); });
