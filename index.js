import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";
import path from "path";
import chalk from "chalk";
import open from "open";

const __dirname = path.resolve();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  // for remote acces ?
  cors: {
    origins: ["*"],
  },
});

const log = console.log;
const error = chalk.bold.red;
const warn = chalk.hex("#FFA500"); // Orange color
const info = chalk.blue;
const ok = chalk.green;

import { Atcher } from "./modules/atcher/index.js";
import { Fsld } from "./modules/fsld/index.js";

let atcher = new Atcher({ io: io });
let fsld = new Fsld({ io: io });

app.get("/", (req, res) => {
  res.sendFile("public/index.html", { root: __dirname });
});

io.on("connection", (socket) => {
  log(info("a user connected"));
  // socket.broadcast.emit("hi");

  socket.on("action", (msg) => {
    msg = msg.trim();
    let msg_split = msg.split(" ");
    log(warn("### action: " + msg));
    if (
      fsld[msg_split[0]] != undefined &&
      typeof fsld[msg_split[0]] == "function"
    ) {
      fsld[msg_split[0]]({ socket: socket, args: msg_split.slice(1) });
    }
    io.emit("action", msg);
  });

  socket.on("disconnect", () => {
    log(info("user disconnected"));
  });
});

server.listen(3000, () => {
  log(warn("\n##########\nlistening on *:3000"));
  // open('http://localhost:3000');
});
