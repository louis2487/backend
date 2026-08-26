const { Client } = require('ssh2');
const password = process.env.DEPLOY_SSH_PASSWORD;
if (!password) process.exit(1);
const conn = new Client();
conn.on('ready', () => {
  conn.exec(
    `podman exec jangsucrops-backend cat /web/back_end/app/config/db.config.js 2>/dev/null | head -15
echo ---
podman exec propcrops-backend cat /web/back_end/app/config/db.config.js 2>/dev/null | head -15`,
    (e, s) => {
      s.on('data', (d) => process.stdout.write(d));
      s.on('close', () => conn.end());
    },
  );
}).connect({ host: '61.35.161.124', port: 60014, username: 'root', password });
