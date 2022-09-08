import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import Joi from "joi";
import dayjs from "dayjs";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
dotenv.config();
const server = express();

server.use(cors());
server.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
    db = mongoClient.db("mywallet");
});

//Schemas//
const usersSchema = Joi.object({
    name: Joi.string().alphanum().min(3).max(24).empty().required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
});

const usersLoginSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
});

const incomeSchema = Joi.object({
    amount: Joi.number().integer().required(),
    description: Joi.string().alphanum().empty().required()
});

const outcomeSchema = Joi.object({
    amount: Joi.number().integer().required(),
    description: Joi.string().alphanum().empty().required()
});

//SignUp//
server.post('/signup', async (req, res) => {
    const search = await db.collection('users').find().toArray();
    for (let i = 0; i < search.length; i++) {
        if (search[i].name === req.body.name) {
            res.status(422).send('This name already exists');
            return;
        } else if (search[i].email === req.body.email) {
            res.status(422).send('This e-mail already exists');
            return;
        }
    }

    try {
        await usersSchema.validateAsync(req.body);
        const hashPassword = bcrypt.hashSync(req.body.password, 10);
        db.collection('users').insertOne({ name: req.body.name, email: req.body.email, password: hashPassword });
        res.sendStatus(201);
    } catch (error) {
        res.status(422).send(error.details.map((detail) => detail.message));
    }
});

server.get('/signup', async (req, res) => {
    try {
        const users = await db.collection('users').find().toArray();
        res.send(users);
    } catch (error) {
        res.status(422).send(error.details.map((detail) => detail.message));
    }
});

//Login//
server.post('/login', async (req, res) => {
    const user = await db.collection('users').findOne({ email: req.body.email });
    if (!user) {
        res.status(422).send('E-mail or password not found');
        return;
    }

    try {
        await usersLoginSchema.validateAsync(req.body);
        const compare = bcrypt.compareSync(req.body.password, user.password);
        if (compare) {
            const token = uuidv4();
            db.collection('sessions').insertOne({ userId: user._id, token: token, user: user.name });
            res.status(200).send(token);
        } else {
            res.status(422).send(compare);
        }

    } catch (error) {
        res.status(422).send(error.details.map((detail) => detail.message));
    }
});

//Income
server.put('/income', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        res.status(401).send('Usuário não encontrado');
        return;
    }

    try {
        await incomeSchema.validateAsync(req.body);
        const session = await db.collection('sessions').findOne({ token });
        const user = await db.collection('users').findOne({ _id: session.userId });

        if (user) {
            delete user.password;
        }

        if (!user.incomes) {
            const incomes = [{
                amount: req.body.amount,
                description: req.body.description,
                date: dayjs().format('DD/MM')
            }];
            await db.collection('users').update({ _id: session.userId }, { $set: { incomes } });
        } else {
            const incomes = [...user.incomes];
            incomes.push({
                amount: req.body.amount,
                description: req.body.description,
                date: dayjs().format('DD/MM')
            });
            await db.collection('users').update({ _id: session.userId }, { $set: { incomes } });
        }

        res.sendStatus(201);
    } catch (error) {
        res.status(422).send(error.details.map((detail) => detail.message));
    }
});

//Outcome
server.put('/outcome', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        res.status(401).send('Usuário não encontrado');
        return;
    }

    try {
        await outcomeSchema.validateAsync(req.body);
        const session = await db.collection('sessions').findOne({ token });
        const user = await db.collection('users').findOne({ _id: session.userId });

        if (user) {
            delete user.password;
        }

        if (!user.outcomes) {
            const outcomes = [{
                amount: req.body.amount,
                description: req.body.description,
                date: dayjs().format('DD/MM')
            }];
            await db.collection('users').update({ _id: session.userId }, { $set: { outcomes } });
        } else {
            const outcomes = [...user.outcomes];
            outcomes.push({
                amount: req.body.amount,
                description: req.body.description,
                date: dayjs().format('DD/MM')
            });
            await db.collection('users').update({ _id: session.userId }, { $set: { outcomes } });
        }
        res.sendStatus(201);
    } catch (error) {
        res.status(422).send(error.details.map((detail) => detail.message));
    }
});

//Balance//
server.get('/balance', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        res.status(401).send('Usuário não encontrado');
        return;
    }

    try {
        const session = await db.collection('sessions').findOne({ token });
        const user = await db.collection('users').findOne({ _id: session.userId });
        if (user) {
            delete user.email;
            delete user.password;
        }
        res.send(user);
    } catch (error) {
        res.sendStatus(400);
    }
});

//Controllers//
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


server.listen(5000, () => { console.log("Listening on port 5000") });