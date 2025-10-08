const http = require("node:http");
const path = require("node:path");
const connect = require("connect");
const serveStatic = require("serve-static");

const port = 3400;
const app = connect();

app.use(serveStatic(path.join(__dirname, "../public")));

http.createServer(app).listen(port, "::", () => {
	console.log(`Started webserver on http://localhost:${port}`);
});
