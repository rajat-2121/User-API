const router = require('express').Router();
const User = require('../models/User');
const CryptoJS = require("crypto-js");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET_KEY;
const KEY = process.env.CRYPTOJS_KEY;

// register
router.post("/register", async (req, res) => {
    try {
        // console.log(req.body);
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const decrypted = {};
        decrypted.username = CryptoJS.AES.decrypt(req.body.username, KEY).toString(CryptoJS.enc.Utf8);
        decrypted.email = CryptoJS.AES.decrypt(req.body.email, KEY).toString(CryptoJS.enc.Utf8);
        decrypted.mobile = CryptoJS.AES.decrypt(req.body.mobile, KEY).toString(CryptoJS.enc.Utf8);

        // console.log(decrypted);

        const newUser = new User({
            username: decrypted.username,
            email: decrypted.email,
            mobile: decrypted.mobile,
            password: hashedPass
        });
        
        const user = await newUser.save();
        res.status(201).json({user});

    } catch (error) {
        res.status(500).json(error);
    }
});

// login
router.post("/login", async (req, res) => {
    try {

        const user = await User.findOne({email: req.body.email});
        if(!user) {
            res.status(400).json(`Wrong credentials!`);
            return;
        }

        bcrypt.compare(req.body.password, user.password).then((flag) => {
            if(flag === false)
            {
                res.status(400).json(`Wrong credentials!!`);
                return;
            }
        });

        const token = jwt.sign({id: user._id, username: user.username, mobile: user.mobile}, SECRET_KEY);
        const {password, ...others} = user._doc;
        res.status(200).json({user: others,token: token});

    } catch (error) {
        res.status(500).json(error);
    }
});


//update info
router.put("/update", auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if(user.username === req.username) {
            const decrypted = {};
            decrypted.username = CryptoJS.AES.decrypt(req.body.username, KEY).toString(CryptoJS.enc.Utf8);
            decrypted.email = CryptoJS.AES.decrypt(req.body.email, KEY).toString(CryptoJS.enc.Utf8);
            decrypted.mobile = CryptoJS.AES.decrypt(req.body.mobile, KEY).toString(CryptoJS.enc.Utf8);
            try {
                const updatedUser = await User.findByIdAndUpdate(req.userId,
                    {$set: decrypted},
                    {new: true}
                );
                const {password, ...others} = updatedUser._doc;
                const token = jwt.sign({id: others._id, username: others.username, mobile: others.mobile}, SECRET_KEY);
                res.status(200).json({user: others, token: token});
            } catch (error) {
                res.status(500).json(error);
            }
        } else {
            res.status(401).json(`Please login first!`);
        }
    } catch (error) {
        res.status(500).json(error);
    }
});


//update password
router.put("/resetpassword", auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if(user.username === req.username) {

            bcrypt.compare(req.body.oldPassword, user.password).then((flag) => {
                if(flag === false)
                {
                    res.status(400).json(`Wrong credentials!!`);
                    return;
                }
            });

            try {
                const salt = await bcrypt.genSalt(10);
                const hashedPass = await bcrypt.hash(req.body.password, salt);
                
                const {oldPassword, ...others} = req.body;
                others.password = hashedPass;
                await User.findByIdAndUpdate(req.userId,
                    {$set: others},
                    {new: true}
                );
                res.status(200).json(`Password reset successfull!`);
            } catch (error) {
                res.status(500).json(error);     
            }
        } else {
            res.status(401).json(`Please login first!`);
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;
