"use strict";

// require dotenv to handle environment variables (call asap hence put at top)
require("dotenv").config();

// require mongoose (ODM library for mongodb). call asap so near top
const mongoose = require("mongoose");
// require bluebird for mongoose promises
mongoose.Promise = require("bluebird");

// require express
const express = require("express");
const app = express();

// require "cors" and add to the middleware stack (via app.use())
const cors = require("cors");
app.use(cors());

// middleware for getting body data (req.body.XXX) from forms
const bodyParser = require("body-parser");
// add it to the middleware stack before any app routes are defined, root level middleware
let middlewareParse = bodyParser.urlencoded({ extended: false });
app.use(middlewareParse);

// middleware access to public folder for static css file
app.use(express.static("public"));

// load index.html at root route
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

// ME START
// mongoose connect
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

// post a new user
app.post("/api/users", (req, res) => {
    const theUsername = req.body.username;
    console.log(theUsername);
    const userObject = new User({ username: theUsername, count: 1 });
    // mongoose model's save() function returns a promise (if no callback passed as a function to it)
    const savePromise = userObject.save();
    savePromise
        .then(() => {
            // FCC requested response of "_id" and "username"
            res.json({ _id: userObject.id, username: theUsername });
        })
        .catch((saveErr) => {
            console.error(saveErr);
            res.json({ error: "save failed" });
        });
});

// TODO: get a list of users

// TODO: post a new exercise

// TODO: show the user logs

// ME END



// app to listen on port 3000
const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
});
