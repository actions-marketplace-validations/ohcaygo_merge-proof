"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { ensure } = require("./common");
class Store {
  constructor(root) {
    this.root = root;
    fs.mkdirSync(root, { recursive: true, mode: 0o700 });
    fs.chmodSync(root, 0o700);
    this.file = path.join(root, "state.json");
    this.lock = path.join(root, "server.lock");
    this.fd = fs.openSync(this.lock, "wx", 0o600);
    fs.writeFileSync(this.fd, String(process.pid));
    this.data = fs.existsSync(this.file)
      ? JSON.parse(fs.readFileSync(this.file, "utf8"))
      : { orders: {}, events: [], exceptions: [] };
    for (const o of Object.values(this.data.orders))
      if (o.state === "RUNNING") {
        o.state = "RETRY";
        o.failure = "RUN_FAILED";
      }
    this.save();
  }
  save() {
    const temp = this.file + ".tmp";
    const fd = fs.openSync(temp, "w", 0o600);
    try {
      fs.writeFileSync(fd, JSON.stringify(this.data));
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    fs.renameSync(temp, this.file);
    const dir = fs.openSync(this.root, "r");
    try {
      fs.fsyncSync(dir);
    } finally {
      fs.closeSync(dir);
    }
  }
  order(id) {
    ensure(
      typeof id === "string" && /^[a-f0-9]{64}$/.test(id),
      "NOT_FOUND",
      404,
    );
    const o = this.data.orders[id];
    ensure(o, "NOT_FOUND", 404);
    return o;
  }
  close() {
    fs.closeSync(this.fd);
    fs.unlinkSync(this.lock);
  }
}
module.exports = { Store };
