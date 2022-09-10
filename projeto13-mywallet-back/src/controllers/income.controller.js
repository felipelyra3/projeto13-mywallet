import Joi from "joi";
import db from "../database/db.js";
import dayjs from "dayjs";

const incomeSchema = Joi.object({
    amount: Joi.number().integer().required(),
    description: Joi.string().empty().required()
});

async function income(req, res) {
    const token = res.locals.token;

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
}

export { income }