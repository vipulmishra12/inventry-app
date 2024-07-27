const dotenv = require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

const app = express();

const port = process.env.PORT || 5000

//connect To DB and start Server

const database = mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(5000, () => {
            console.log(`server is started on port ${port}`)
        })
    }).catch((err) => {
        console.error('server is not connected properly' , err.message)
    })

