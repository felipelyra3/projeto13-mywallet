function authorizationUser(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        res.status(401).send('User not found');
        return;
    }

    res.locals.token = token;

    next();
}

export default authorizationUser;