import { spawn } from "node:child_process";
import net from "node:net";

const prismaSchema = "backend/prisma/schema.prisma";
const databaseUrl = process.env.DATABASE_URL;
const timeoutMs = Number(process.env.DB_WAIT_TIMEOUT_MS || 180000);

function databaseEndpoint() {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const parsed = new URL(databaseUrl);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
  };
}

function waitForDatabase({ host, port }) {
  const started = Date.now();
  console.log(`Waiting for PostgreSQL at ${host}:${port}...`);

  return new Promise((resolve, reject) => {
    function tryConnect() {
      const socket = net.createConnection({ host, port });
      let connected = false;
      socket.setTimeout(5000);

      socket.on("connect", () => {
        connected = true;
        socket.end();
        console.log(`PostgreSQL is reachable at ${host}:${port}`);
        resolve();
      });

      socket.on("timeout", () => {
        socket.destroy();
      });

      socket.on("error", () => {
        socket.destroy();
      });

      socket.on("close", () => {
        if (connected) {
          return;
        }
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for PostgreSQL at ${host}:${port} after ${timeoutMs}ms`));
          return;
        }
        setTimeout(tryConnect, 2000);
      });
    }

    tryConnect();
  });
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

function startServer() {
  const child = spawn("node", ["backend/src/server.js"], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => child.kill(signal));
  }

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}


const endpoint = databaseEndpoint();
await waitForDatabase(endpoint);
await run("npx", ["prisma", "migrate", "deploy", `--schema=${prismaSchema}`]);

if (process.env.RUN_DB_SEED === "true") {
  await run("npx", ["prisma", "db", "seed", `--schema=${prismaSchema}`]);
}

startServer();
