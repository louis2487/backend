const { Client } = require('ssh2');
const password = process.env.DEPLOY_SSH_PASSWORD;
const endpoints = [
  ['24009', 'propcrops'],
  ['24010', 'publicproperty'],
  ['24012', 'crops'],
  ['24014', 'jangsucrops'],
];
if (!password) process.exit(1);

const conn = new Client();
conn.on('ready', () => {
  const curls = endpoints
    .map(
      ([port, name]) =>
        `echo "=== ${name}:${port} ==="; curl -s -m 10 "http://127.0.0.1:${port}/v1/jangsu/getBoundsList?minx=127.45&miny=35.60&maxx=127.58&maxy=35.70" | head -c 120; echo; curl -s -m 5 -o /dev/null -w "code:%{http_code} bytes:%{size_download}\\n" "http://127.0.0.1:${port}/v1/jangsu/getBoundsList?minx=127.45&miny=35.60&maxx=127.58&maxy=35.70"`,
    )
    .join('\n');
  conn.exec(curls, (err, stream) => {
    stream.on('data', (d) => process.stdout.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '61.35.161.124', port: 60014, username: 'root', password });
