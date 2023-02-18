const express = require('express');
const mongoose = require('mongoose');
const authRoute = require('./routes/user');
require('dotenv').config();

const app = express();

// database connection
const databaseURL = process.env.MONGODB_URL;
mongoose.set('strictQuery', true);
mongoose.connect(databaseURL, (error) => {
    if(!error) {
        console.log(`database connected!`);
    } else {
        console.log(error);
    }
});


app.use((req, res, next) => {
    console.log(`HTTP Method- ${req.method}, URL- ${req.url}`);
    next();
});
app.use(express.json());
app.use("/", authRoute);


// server listener
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
