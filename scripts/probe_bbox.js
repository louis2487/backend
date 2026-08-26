const { Client } = require('ssh2');

const password = process.env.DEPLOY_SSH_PASSWORD;
if (!password) {
  console.error('DEPLOY_SSH_PASSWORD required');
  process.exit(1);
}

const bboxes = [
  ['jangsu_tight', '127.45', '35.60', '127.58', '35.70'],
  ['jangsu_wide', '127.35', '35.52', '127.55', '35.65'],
  ['sunchang', '127.10', '35.30', '127.25', '35.45'],
];

const conn = new Client();
conn
  .on('ready', () => {
    const curls = bboxes
      .map(([name, minx, miny, maxx, maxy]) => {
        const url = `http://127.0.0.1:24009/v1/jangsu/getBoundsList?minx=${minx}&miny=${miny}&maxx=${maxx}&maxy=${maxy}`;
        return `echo --- ${name}; curl -s -m 15 '${url}' | head -c 220; echo`;
      })
      .join('\n');

    conn.exec(
      `echo === internal API ===\n${curls}\necho === external 60027 ===\ncurl -s -m 15 -o /dev/null -w 'http_code:%{http_code}\n' 'http://127.0.0.1:60027/v1/jangsu/getBoundsList?minx=127.45&miny=35.60&maxx=127.58&maxy=35.70' || echo external_failed`,
      (err, stream) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        stream.on('data', (d) => process.stdout.write(d));
        stream.stderr.on('data', (d) => process.stderr.write(d));
        stream.on('close', () => conn.end());
      },
    );
  })
  .on('error', (e) => {
    console.error(e);
    process.exit(1);
  })
  .connect({ host: '61.35.161.124', port: 60014, username: 'root', password });
