const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");

const express = require("express");
const app = express();
const sanitizeHTML = require("sanitize-html");
const jwt = require("jsonwebtoken");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/", require("./router"));


const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  pingTimeout: 30000,
});

io.on("connection", function (socket) {
  socket.on("chatFromBrowser", function (data) {
    try {
      let user = jwt.verify(data.token, process.env.JWTSECRET);
      socket.broadcast.emit("chatFromServer", { message: sanitizeHTML(data.message, { allowedTags: [], allowedAttributes: {} }), username: user.username, avatar: user.avatar });
    } catch (e) {
      console.log("Not a valid token for chat.");
    }
  });
});

module.exports = server;

Sentry.init({
  dsn: "https://743f20ee73d24d63a94eeb17263d7b2d@o471166.ingest.sentry.io/5504695",

  tracesSampleRate: 0.8,
});