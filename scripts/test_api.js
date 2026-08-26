const { Client } = require('ssh2');
const password = process.env.DEPLOY_SSH_PASSWORD;
conn = new Client();
conn.on('ready', () => {
  conn.exec(`
curl -s -o /dev/null -w "24009:%{http_code}\n" "http://127.0.0.1:24009/"
curl -s "http://127.0.0.1:24009/v1/jangsu/getBoundsList?minx=127.35&miny=35.52&maxx=127.55&maxy=35.65" | head -c 300
echo ""
`, (e, s) => {
    s.on('data', d => process.stdout.write(d));
    s.on('close', () => conn.end());
  });
}).connect({ host: '61.35.161.124', port: 60014, username: 'root', password });
conn.on('error', e => { console.error(e); process.exit(1); });
