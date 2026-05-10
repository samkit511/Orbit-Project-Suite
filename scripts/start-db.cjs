const { execSync } = require("node:child_process");
const net = require("node:net");

const host = process.env.DB_HOST || "127.0.0.1";
const port = Number(process.env.DB_PORT || 5432);

function canConnect() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    socket.setTimeout(1000);
    socket.on("connect", () => {
      socket.end();
      resolve(true);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => resolve(false));
  });
}

async function main() {
  if (await canConnect()) {
    console.log(`PostgreSQL is already reachable at ${host}:${port}`);
    return;
  }

  try {
    execSync("docker info", { stdio: "ignore" });
  } catch {
    console.error("PostgreSQL is not running, and Docker Desktop is not started.");
    console.error("Start Docker Desktop, wait until it says it is running, then run: npm run dev:full");
    process.exit(1);
  }

  execSync("docker compose up -d postgres", { stdio: "inherit" });
}

main();
