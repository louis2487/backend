const { Client } = require('ssh2');
const password = process.env.DEPLOY_SSH_PASSWORD;
if (!password) { console.error('DEPLOY_SSH_PASSWORD required'); process.exit(1); }

const py = `import socket, threading, select

def relay(a, b):
    socks = [a, b]
    while True:
        r, _, _ = select.select(socks, [], [], 60)
        if not r:
            return
        for x in r:
            data = x.recv(65536)
            if not data:
                return
            (b if x is a else a).sendall(data)

def handle(client):
    try:
        upstream = socket.create_connection(('127.0.0.1', 24009), timeout=10)
    except OSError:
        client.close()
        return
    t1 = threading.Thread(target=relay, args=(client, upstream), daemon=True)
    t2 = threading.Thread(target=relay, args=(upstream, client), daemon=True)
    t1.start(); t2.start()
    t1.join(); t2.join()
    client.close(); upstream.close()

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(('0.0.0.0', 60027))
server.listen(256)
while True:
    conn, _ = server.accept()
    threading.Thread(target=handle, args=(conn,), daemon=True).start()
`;

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
pkill -f '/tmp/portfwd_60027.py' 2>/dev/null || true
cat > /tmp/portfwd_60027.py <<'PYEOF'
${py}
PYEOF
nohup python3 /tmp/portfwd_60027.py >/tmp/portfwd_60027.log 2>&1 &
sleep 1
ss -lntp | grep -E '60027|24009' || true
curl -s -m 5 -o /dev/null -w "host60027:%{http_code}\\n" http://127.0.0.1:60027/ || true
curl -s -m 10 "http://127.0.0.1:60027/v1/jangsu/getBoundsList?minx=127.45&miny=35.60&maxx=127.58&maxy=35.70" | head -c 160; echo
`;
  conn.exec(cmd, (err, stream) => {
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '61.35.161.124', port: 60014, username: 'root', password });
conn.on('error', e => { console.error(e); process.exit(1); });
