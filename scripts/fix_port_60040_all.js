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
echo "=== all listeners (600xx) ==="
ss -lntp | grep -E ':600[0-9]{2}' || true
echo "=== podman ps ==="
podman ps --format "{{.Names}} {{.Ports}}" 2>/dev/null || true
echo "=== which socat ==="
command -v socat || echo socat_missing
echo "=== try start 60040 ==="
pkill -f 'socat TCP-LISTEN:60040' 2>/dev/null || true
if command -v socat >/dev/null 2>&1; then
  nohup socat TCP-LISTEN:60040,fork,reuseaddr TCP:127.0.0.1:24009 >/tmp/socat-60040.log 2>&1 &
  sleep 1
  ss -lntp | grep 60040 || echo socat_not_listening
else
  echo "socat not installed, trying python forward"
  cat > /tmp/portfwd_60040.py <<'PY'
import socket, threading
TARGET = ('127.0.0.1', 24009)
def handle(c):
    t = socket.create_connection(TARGET, 10)
    def pump(a,b):
        try:
            while True:
                d = a.recv(65536)
                if not d: break
                b.sendall(d)
        except Exception:
            pass
        finally:
            a.close(); b.close()
    threading.Thread(target=pump, args=(c,t), daemon=True).start()
    threading.Thread(target=pump, args=(t,c), daemon=True).start()
s = socket.socket()
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind(('0.0.0.0', 60040))
s.listen(128)
while True:
    c, _ = s.accept()
    threading.Thread(target=handle, args=(c,), daemon=True).start()
PY
  pkill -f '/tmp/portfwd_60040.py' 2>/dev/null || true
  nohup python3 /tmp/portfwd_60040.py >/tmp/portfwd-60040.log 2>&1 &
  sleep 1
  ss -lntp | grep 60040 || true
fi
curl -s -m 10 "http://127.0.0.1:60040/v1/jangsu/getBoundsList?minx=127.45&miny=35.60&maxx=127.58&maxy=35.70" | wc -c
`,
      (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d));
        stream.stderr.on('data', (d) => process.stderr.write(d));
        stream.on('close', () => conn.end());
      },
    );
  })
  .connect({ host: '61.35.161.124', port: 60014, username: 'root', password });
