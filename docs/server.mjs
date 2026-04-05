import http from "node:http";
import path from "node:path";
import connect from "connect";
import serveStatic from "serve-static";

const port = 3400;
const app = connect();

app.use(serveStatic(path.join(import.meta.dirname, "../public")));

http.createServer(app).listen(port, "::", () => {
	console.log(`Started webserver on http://localhost:${port}`);
});
