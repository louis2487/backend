const { Client } = require('ssh2');
const password = process.env.DEPLOY_SSH_PASSWORD;
if (!password) { console.error('DEPLOY_SSH_PASSWORD required'); process.exit(1); }

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`
set -e
if iptables -t nat -C PREROUTING -p tcp --dport 60027 -j REDIRECT --to-ports 24009 2>/dev/null; then
  echo "iptables rule already exists"
else
  iptables -t nat -A PREROUTING -p tcp --dport 60027 -j REDIRECT --to-ports 24009
  iptables -t nat -A OUTPUT -p tcp --dport 60027 -j REDIRECT --to-ports 24009
  echo "iptables rules added"
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
