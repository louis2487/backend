const { Client } = require('ssh2');
const password = process.env.DEPLOY_SSH_PASSWORD;
conn = new Client();
conn.on('ready', () => {
  conn.exec(`
podman logs propcrops-backend 2>&1 | tail -20
`, (e, s) => {
    s.on('data', d => process.stdout.write(d));
    s.stderr.on('data', d => process.stderr.write(d));
    s.on('close', () => conn.end());
  });
}).connect({ host: '61.35.161.124', port: 60014, username: 'root', password });
conn.on('error', e => { console.error(e); process.exit(1); });
