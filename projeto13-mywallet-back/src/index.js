import express from "express";
import cors from "cors";
//import dotenv from "dotenv";
//import { MongoClient } from "mongodb";
import signUp from "./routers/singup.routers.js";
import login from "./routers/login.routers.js";
import income from "./routers/income.routers.js"
import outcome from "./routers/outcome.routers.js";
import balance from "./routers/balance.routers.js";
//dotenv.config();
const server = express();

server.use(cors());
server.use(express.json());

/* //Conection mongodb
const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
    db = mongoClient.db("mywallet");
}); */

//SignUp//
server.use(signUp);

//Login//
server.use(login);

//Income
server.use(income);

//Outcome
server.use(outcome);

//Balance//
server.use(balance);

/* //Controllers//
server.post('/status', async (req, res) => {
    try {
        const users = await db.collection('users').find().toArray();
        res.send(users);
    } catch (error) {
        res.status(422).send(error.details.map((detail) => detail.message));
    }
});

server.delete('/deleteallusers', async (req, res) => {
    try {
        await db.collection('users').deleteMany({});
        const users = await db.collection('users').find().toArray();
        res.send(users);
    } catch (error) {
        res.send(error);
    }
});

server.get('/compare', async (req, res) => {
    const user = await db.collection('users').findOne({ email: req.body.email });
    if (!user) {
        res.status(422).send('E-mail or password not found');
        return;
    }
    const compare = bcrypt.compareSync(req.body.password, user.password);
    res.send(compare);
});

server.post('/sessions', async (req, res) => {
    try {
        const session = await db.collection('sessions').find().toArray();
        res.send(session);
    } catch (error) {
        res.send(error);
    }
});

server.get('/signup', async (req, res) => {
    try {
        const users = await db.collection('users').find().toArray();
        res.send(users);
    } catch (error) {
        res.status(422).send(error.details.map((detail) => detail.message));
    }
}); */


server.listen(5000, () => { console.log("Listening on port 5000") });