const net = require("node:net");

const host = process.env.DB_HOST || "127.0.0.1";
const port = Number(process.env.DB_PORT || 5432);
const timeoutMs = Number(process.env.DB_WAIT_TIMEOUT_MS || 60000);
const started = Date.now();

function tryConnect() {
  const socket = net.createConnection({ host, port });

  socket.on("connect", () => {
    socket.end();
    console.log(`PostgreSQL is reachable at ${host}:${port}`);
  });

  socket.on("error", () => {
    socket.destroy();
    if (Date.now() - started > timeoutMs) {
      console.error(`Timed out waiting for PostgreSQL at ${host}:${port}`);
      process.exit(1);
    }
    setTimeout(tryConnect, 1000);
  });
}

tryConnect();
