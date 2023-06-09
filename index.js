import jsonServer from "json-server";
import path from "path";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";
import ShortUniqueId from "short-unique-id";
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import dotenv from 'dotenv';
const serverPort = 4500;
dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const file = path.join(__dirname, 'db.json');
const adapter = new JSONFileSync(file);
const db_file = fs.readFileSync('db.json', { encoding: 'utf-8' })
const db = new LowSync(adapter, JSON.parse(db_file));
const uid = new ShortUniqueId({ length: 10 })

const server = jsonServer.create();
const router = jsonServer.router(join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults()

server.use(cors())
server.use(jsonServer.bodyParser);
server.use(middlewares)

server.get('/', (req, res) => {
  res.send('Base API endpoint')
})

server.post('/dogs', (req, res) => {
  const { name, gender, age, place } = req.body;
  if (!name || !gender || !age || !place) {
    return res.status(409).send({ message: 'All Feilds Needed' });
  }
  db.read();
  const { dogs } = db.data;
  const dog = { name, gender, age, place };
  dog.id = dogs.length == 0 ? 1 : dogs[dogs.length-1].id + 1;
  dogs.push(dog);
  db.write();
  return res.status(200).send({ message: 'successfully registered' })
})

server.post('/users/login', (req, res) => {
  const { email, password } = req.body;
  db.write()
  const { users } = db.data;
  let user;
  users.forEach(ele => {
    if (email == ele.email) {
      user = ele;
    }
  })
  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }
  if (user.password == password) {
    const token = jwt.sign({ id: user.id }, process.env.JSON_PRIVATE_KEY, { expiresIn: '6h' });
    return res.send({ message: 'Login Sucessfull', token })
  }
})

server.use(router);

server.listen(serverPort, () => {
  console.log(
    `JSON Server is running at http://localhost:${serverPort}`
  );
});


// function authentication(req, res, next) {
//   const token = req.headers.authorization;
//   if (!token) {
//     return res.status(401).send({ message: 'Access Denied' })
//   }
//   jwt.verify(token, process.env.JSON_WEB_KEY, )
// }