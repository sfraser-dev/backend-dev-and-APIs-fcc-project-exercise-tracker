"use strict";

const express = require("express");
const app = express();

// add "cors" to the middleware stack (via app.use())
const cors = require("cors");
app.use(cors());

// handle environment variables
require("dotenv").config();

// middleware to access public folder and then load index page at root
app.use(express.static("public"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

// app to listen on port 3000
const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
});

// ME START
// middleware for getting body data (req.body.XXX) from forms
const bodyParser = require("body-parser");
// add it to the middleware stack before any app routes are defined, root level middleware
let middlewareParse = bodyParser.urlencoded({ extended: false });
app.use(middlewareParse);

// mongoose setup (for accessing mongodb)
const mongoose = require("mongoose");
mongoose
    .connect(process.env.MONGO_URI, {
        dbName: process.env.DB_NAME,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("database connected.");
    })
    .catch((err) => console.error(err));
// mongoose user schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    count: Number,
});
// mongoose user model
const User = mongoose.model("User", userSchema);
// mongoose exercise schema
const exerciseSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    description: String,
    duration: Number,
    date: Date,
});
// mongoose exercise model
const Exercise = mongoose.model("Exercise", exerciseSchema);

// TODO: post a new user
app.post("/api/users", (req, res) => {
    const theUsername = req.body.username;
    console.log(theUsername);
    res.json({ hello: theUsername });
});

// TODO: get a list of users

// TODO: post a new exercise

// TODO: show the user logs

// ME END
