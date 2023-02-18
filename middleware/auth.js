const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET_KEY;

const auth = (req, res, next) => {

    try {
        let token = req.headers.authorization;
        if(token) {
            token = token.split(" ")[1];
            let user = jwt.verify(token, SECRET_KEY);
            req.userId = user.id;
            req.username = user.username;
            next();
        } else {
            res.status(401).json(`Unauthorized User!`);
        }

    } catch (error) {
        res.status(401).json(`Unauthorized User!`);
    }
}

module.exports = auth;