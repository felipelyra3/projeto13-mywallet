import Joi from "joi";
import db from "../database/db.js";
import bcrypt from "bcrypt";

const usersSchema = Joi.object({
    name: Joi.string().alphanum().min(3).max(24).empty().required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
});

async function signUp(req, res) {
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
}

export { signUp }