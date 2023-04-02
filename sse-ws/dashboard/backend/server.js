import http from "http";
import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import cors from "cors";
import bodyParser from "body-parser";
import * as crypto from "crypto";
import { store as Store } from "./store/Store.js";

const app = express();

app.use(cors());
app.use(
  bodyParser.json({
    type(req) {
      return true;
    },
  })
);
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

const store = Store;

app.get("/", async (request, response) => {
  response.send(JSON.stringify({ data: store.instances })).end();
});

app.get("/sse", (request, response) => {
  console.log("sse connect");
  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  store.listen((item) => {
    response.write("event: message\n");
    response.write(`data: ${JSON.stringify(item)}\n\n`);
  });

  response.on("close", () => {
    console.log("sse close");
    response.end();
  });
});

app.post("/", async (request, response) => {
  const id = crypto.randomUUID();
  const log = {
    id,
    info: "Create command",
    timestamp: store.getTimestamp(),
  };

  store.sendEvent(log);
  setTimeout(() => {
    store.addInstance({
      id,
      state: "stopped",
    });
  }, 10000);

  return response
    .status(201)
    .send(JSON.stringify({ status: "OK" }))
    .end();
});

app.delete("/", (request, response) => {
  const { id } = request.query;

  const instance = store.instances.find((instance) => instance.id === id);
  if (!instance) {
    return response
      .status(404)
      .send(JSON.stringify({ message: "Instance not found" }))
      .end();
  }
  store.removeInstance(id);

  return response
    .status(200)
    .send(JSON.stringify({ status: "OK" }))
    .end();
});

const server = http.createServer(app);
const wsServer = new WebSocketServer({ server });
wsServer.on("connection", (ws) => {
  ws.on("message", (message) => {
    const { id } = JSON.parse(message);

    store.changeStatus(id);

    const eventData = JSON.stringify(
      store.instances.filter((item) => item.id === id)
    );

    [...wsServer.clients]
      .filter((client) => client.readyState === WebSocket.OPEN)
      .forEach((client) => {
        client.send(eventData);
      });
  });

  ws.send(JSON.stringify("connection"));
});

const port = process.env.PORT || 3000;

const bootstrap = async () => {
  try {
    server.listen(port, () =>
      console.log(`Server has been started on http://localhost:${port}`)
    );
  } catch (error) {
    console.error(error);
  }
};

bootstrap();
