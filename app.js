const dotenv = require("dotenv").config()

const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");

const express = require("express");
const app = express();
const sanitizeHTML = require("sanitize-html");
const jwt = require("jsonwebtoken");
const moesif = require('moesif-browser-js');
const moesifExpress = require('moesif-express');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/* MOESIF INIT - START */
var options = {

  applicationId: process.env.MOESIF_APPLICATION_ID,

  identifyUser: function (req, res) {
    if (req.user) {
      return req.user.id;
    }
    return undefined;
  },

   identifyCompany: function (req, res) {
      return req.headers['X-Organization-Id'],

  getSessionToken: function (req, res) {
    return req.headers['Authorization'];
  }
};

app.use(moesifExpress(options));

const moesifMiddleware = moesif({
  applicationId: process.env.MOESIF_APPLICATION_ID,
});

const user = {
  userId: '12345',
  companyId: '67890', // If set, associate user with a company object
  campaign: {
    utmSource: 'google',
    utmMedium: 'cpc', 
    utmCampaign: 'adwords',
    utmTerm: 'api+tooling',
    utmContent: 'landing'
  },
  metadata: {
    email: 'john@acmeinc.com',
    firstName: 'John',
    lastName: 'Doe',
    title: 'Software Engineer',
    salesInfo: {
        stage: 'Customer',
        lifetimeValue: 24000,
        accountOwner: 'mary@contoso.com'
    }
  }
};

moesifMiddleware.updateUser(user, callback);
/* MOESIF INIT - END */

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