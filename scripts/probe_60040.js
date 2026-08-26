const { Client } = require('ssh2');
const password = process.env.DEPLOY_SSH_PASSWORD;
if (!password) {
  console.error('DEPLOY_SSH_PASSWORD required');
  process.exit(1);
}

const conn = new Client();
conn
  .on('ready', () => {
    conn.exec(
      `
ss -lntp | grep -E '60027|60040|24009' || true
echo "--- bytes 60040 ---"
curl -s -m 15 "http://127.0.0.1:60040/v1/jangsu/getBoundsList?minx=127.45&miny=35.60&maxx=127.58&maxy=35.70" | wc -c
echo "--- bytes 60027 ---"
curl -s -m 15 "http://127.0.0.1:60027/v1/jangsu/getBoundsList?minx=127.45&miny=35.60&maxx=127.58&maxy=35.70" | wc -c
echo "--- bytes 24009 ---"
curl -s -m 15 "http://127.0.0.1:24009/v1/jangsu/getBoundsList?minx=127.45&miny=35.60&maxx=127.58&maxy=35.70" | wc -c
echo "--- socat log ---"
tail -5 /tmp/socat-60040.log 2>/dev/null || true
`,
      (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d));
        stream.stderr.on('data', (d) => process.stderr.write(d));
        stream.on('close', () => conn.end());
      },
    );
  })
  .connect({ host: '61.35.161.124', port: 60014, username: 'root', password });
