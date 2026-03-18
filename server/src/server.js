import http from "http";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { initializeSocket } from "./config/socket.js";

const startServer = async () => {
  await connectDatabase();

  const server = http.createServer(app);
  initializeSocket(server);

  server.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
};

startServer();
