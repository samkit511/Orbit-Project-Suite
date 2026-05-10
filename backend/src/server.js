import app from "./app.js";

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`API running on port ${port}`);
});

server.requestTimeout = 30000;
server.headersTimeout = 35000;
server.on("error", (error) => {
  console.error("Server error", error);
  process.exit(1);
});
