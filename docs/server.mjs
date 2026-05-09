import http from "node:http";
import path from "node:path";
import connect from "connect";
import serveStatic from "serve-static";

const port = 3400;
const app = connect();

/* eslint-disable-next-line n/no-unsupported-features/node-builtins -- nodejs v22 is needed to build docs but the eslint rule does not know that */
app.use(serveStatic(path.join(import.meta.dirname, "../public")));

http.createServer(app).listen(port, "::", () => {
	console.log(`Started webserver on http://localhost:${port}`);
});
