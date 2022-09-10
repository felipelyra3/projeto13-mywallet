import Joi from "joi";
import db from "../database/db.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';

const usersLoginSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
});

async function login(req, res) {
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



    /* try {
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
    } */
}

export { login }