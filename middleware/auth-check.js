const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const token = req.headers.authorization;
    try {
        const profile = jwt.verify(token, "TbCJs3GSkaM4uYVev1I0orL8EjKFtmgQ");
        next(profile)
    } catch {
        res.status(401).json({
            success : false,
            message: "Auth Failed",
        });
}}
