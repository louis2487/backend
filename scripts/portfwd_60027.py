import socket
import threading
import select

TARGET_HOST = "127.0.0.1"
TARGET_PORT = 24009
LISTEN_PORT = 60027


def relay(a, b):
    socks = [a, b]
    while True:
        readable, _, _ = select.select(socks, [], [], 60)
        if not readable:
            return
        for sock in readable:
            data = sock.recv(65536)
            if not data:
                return
            (b if sock is a else a).sendall(data)


def handle(client):
    upstream = None
    try:
        upstream = socket.create_connection((TARGET_HOST, TARGET_PORT), timeout=10)
        t1 = threading.Thread(target=relay, args=(client, upstream), daemon=True)
        t2 = threading.Thread(target=relay, args=(upstream, client), daemon=True)
        t1.start()
        t2.start()
        t1.join()
        t2.join()
    finally:
        client.close()
        if upstream is not None:
            upstream.close()


def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(("0.0.0.0", LISTEN_PORT))
    server.listen(256)
    while True:
        conn, _ = server.accept()
        threading.Thread(target=handle, args=(conn,), daemon=True).start()


if __name__ == "__main__":
    main()
