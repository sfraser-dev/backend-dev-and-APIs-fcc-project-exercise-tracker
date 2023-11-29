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
// cross origin resource sharing
const cors = require("cors");
app.use(cors());

// body-parser middleware extracts the entire body portion of an incoming request
// stream (HTTP POST) and exposes it on req.body as something easier to interface with
const bodyParser = require("body-parser");
// add it to the middleware stack before any app routes are defined - root level middleware
let middlewareParse = bodyParser.urlencoded({ extended: false });
app.use(middlewareParse);

// middleware access to public folder for static css file
app.use(express.static("public"));

// load index.html at root route
// __dirname is the present working directory
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

// ME START
// mongoose connect (without warnings)
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

// "post" a new user into the users document
app.post("/api/users", (req, res) => {
    const theUsername = req.body.username;
    console.log(theUsername);
    const userObject = new User({ username: theUsername, count: 0 });
    // mongoose model's save() function returns a promise (if no callback passed as a function to it)
    const savePromise = userObject.save();
    savePromise
        .then(() => {
            // FCC requested response of "_id" and "username"
            res.json({ _id: userObject.id, username: theUsername });
        })
        .catch((saveErr) => {
            console.error(saveErr);
            res.json({ error: "new user save failed" });
        });
});

// "get" a list of users from the users document at this endpoint
app.get("/api/users", (req, res) => {
    // find({}) will return all documents
    // select({key:1}) = include these keys
    // select({key:0}) = ignore these keys
    // exec() without a callback argument returns a promise
    const findPromise = User.find({}).select({ _id: 1, username: 1 }).exec();
    findPromise
        .then((findData) => {
            // User.find().select().exec() is returing an array of object literals, as requested by FCC
            res.json(findData);
        })
        .catch((findErr) => {
            console.error(findErr);
        });
});

// "post" a new exercise into the exercises document via: /api/users/<USERID>/exercises
// we will now have a users document and an exercises document in our execiseTracker collection
app.post("/api/users/:_id/exercises", (req, res) => {
    // *** MUST PUT IN THE ID OF AN EXISTSING USER.
    // *** See 127.0.0.1:3000/api/users for list of users and their IDs

    // fill mongoose Exercise model with data from the html form
    // this exercise will contain a user's id to to tie it to that user
    const newExercise = new Exercise({
        userid: req.params._id,
        description: req.body.description,
        duration: req.body.duration,
        // if there's a date from the user, use that. if not, use the current date
        date: req.body.date ? new Date(req.body.date) : new Date(),
    });

    // mongoose model's save() function returns a promise (if no callback passed as a function to it)
    const newExerciseSavePromise = newExercise.save();
    newExerciseSavePromise
        .then((exerciseDocument) => {
            console.log(exerciseDocument);
            console.log(exerciseDocument.userid);
            // now the exercise has been added to exercises document, update and save "count" (the exercise count) for the user in the users document
            const userFindByIdPromise = User.findById(
                exerciseDocument.userid
            ).exec();
            userFindByIdPromise
                .then((userDocument) => {
                    console.log(userDocument);
                    // update and save exercise count for this user in the users document
                    userDocument.count += 1;
                    const updatedUserDocumentSavePromise = userDocument.save();
                    updatedUserDocumentSavePromise
                        .then(() => {
                            // success, respond with the JSON FCC requested
                            res.json({
                                username: userDocument.username,
                                description: exerciseDocument.description,
                                duration: exerciseDocument.duration,
                                date: exerciseDocument.date.toDateString(),
                                _id: userDocument._id,
                            });
                        })
                        .catch(() => {
                            res.json({ error: "user document save error" });
                        });
                })
                .catch((userDocumentErr) => {
                    console.log(userDocumentErr);
                    res.json({ error: "user find by error" });
                });
        })
        .catch((saveErr) => {
            console.error(saveErr);
            res.json({ error: "new exercise record save failed" });
        });
});

// show the user logs via: /api/users/<USERID>/logs
app.get("/api/users/:_id/logs", async (req, res) => {
    // get _id parameter from the matched route
    const userId = req.params._id;
    console.log(`req.params._id = ${req.params._id}`);
    console.log(`userId = ${userId}`);
    // find the user document
    const foundUserDocPromise = User.findById(userId).exec();
    let localUserName = "";
    let localUserCount = 0;
    foundUserDocPromise
        .then((data) => {
            localUserName = data.username;
            localUserCount = data.count;
        })
        .catch(() => {
            res.json({ error: "user find by id log" });
            console.log("error: user find by id log");
        });

    // find the exercise documents for that user
    // select({key:1}) -> include these keys... select({key:0}) -> ignore these keys
    const foundExerciseDocsPromise = Exercise.find({ userid: userId })
        .select({ _id: 0, userid: 0, __v: 0 })
        .exec();
    foundExerciseDocsPromise
        .then((exerciseData) => {
            // push the required exercise document information into an array of objects
            const theExerciseLog = [];
            exerciseData.forEach((j) =>
                theExerciseLog.push({
                    description: j.description,
                    duration: j.duration,
                    date: j.date.toDateString(),
                })
            );
            res.json({
                // user info
                username: localUserName,
                count: localUserCount,
                _id: userId,
                // exercise info
                log: theExerciseLog,
            });
        })
        .catch(() => {
            res.json({ error: "exercise find by userid log" });
        });
});
// _id for testing
//655df7a5dc954d48183d8bd3

// ME END

// app to listen on port 3000
const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
});
