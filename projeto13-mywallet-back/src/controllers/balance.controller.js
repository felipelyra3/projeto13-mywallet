import db from "../database/db.js";

async function balance(req, res) {
    const token = res.locals.token;

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
}

export { balance }