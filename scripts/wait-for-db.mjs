// Waits for Postgres to accept TCP connections before exiting successfully.
// Usage: node scripts/wait-for-db.mjs
// Reads DATABASE_URL or falls back to DB_HOST / DB_PORT env vars.

import net from "node:net";

function parseHostPort() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const match = url.match(/@([^:/]+):?(\d+)?\//) ;
    if (match) {
      return { host: match[1], port: Number(match[2] || 5432) };
    }
  }
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 5432),
  };
}

const { host, port } = parseHostPort();
const timeoutMs = Number(process.env.DB_WAIT_TIMEOUT_MS || 60000);
const started = Date.now();

console.log(`Waiting for PostgreSQL at ${host}:${port}...`);

function tryConnect() {
  const socket = net.createConnection({ host, port });

  socket.on("connect", () => {
    socket.end();
    console.log(`PostgreSQL is ready at ${host}:${port}`);
    process.exit(0);
  });

  socket.on("error", () => {
    socket.destroy();
    if (Date.now() - started > timeoutMs) {
      console.error(`Timed out waiting for PostgreSQL at ${host}:${port} after ${timeoutMs}ms`);
      process.exit(1);
    }
    setTimeout(tryConnect, 2000);
  });
}

tryConnect();
