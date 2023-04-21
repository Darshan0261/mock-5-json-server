import jsonServer from "json-server";
import path from "path"; 
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";
import ShortUniqueId from "short-unique-id";
const serverPort = 4500;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const file = path.join(__dirname, 'db.json');
const adapter = new JSONFileSync(file);
const db = new LowSync(adapter, []);
const uid = new ShortUniqueId({ length: 10 })

const server = jsonServer.create();
const router = jsonServer.router(join(__dirname, 'db.json'));

server.use(jsonServer.bodyParser);

server.get('/', (req, res) => {
  res.send('Base API endpoint')
})

server.use(router);

server.listen( serverPort, () => {
  console.log(
    `JSON Server is running at http://localhost:${serverPort}`
  );
});
