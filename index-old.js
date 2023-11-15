// Skeleton code
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});


const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
});

////////// My Code
const bodyParser = require("body-parser");

// Begin Mongoose Setup
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// grabbing Schema and model out of mongoose
const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: { type: String, required: true }, 
    count: Number
});
// Mongoose user model
const User = model("User", userSchema);

// Mongoose user schema
const exerciseSchema = new Schema({
    userid: { type: Schema.Types.ObjectId, ref: "User", required: true }, 
    description: String,
    duration: Number,
    date: Date
});

// Mongoose exercise model
const Exercise = model("Exercise", exerciseSchema);

// End Mongoose Setup


app.use(cors());
app.use(express.static("public"));


// Default endpoint
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

// Post a new user
app.post("/api/users", bodyParser.urlencoded({ extended: false }), async (req, res) => {
    console.log(req.body);
    const newUser = await new User({
        username: req.body.
            username,
        count: 0
    });
    const doc = await newUser.save();
    res.send({
        username: doc.username,
        _id: doc._id
    });
});

// Get a list of the users
app.get("/api/users", async (req, res) => {
    User.find().select({ count: 0, __v: 0 }).exec((err, data) => {
        if (err) return console.log(err);
        res.send(data);
    });
});

// Post a new exercise
app.post("/api/users/:_id/exercises", bodyParser.urlencoded({ extended: false }), async (req, res) => {

    const newexercise = await new Exercise({
        userid: req.params._id,
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date ? new Date(req.body.date) : new Date()
    });
    const doc = await newexercise.save();
    const userdoc = await User.findById(doc.userid).exec();
    userdoc.count += 1;
    await userdoc.save();
    res.send({
        username: userdoc.username,
        description: doc.description,
        duration: doc.duration,
        date: doc.date.toDateString(),
        _id: userdoc._id
    });

});

// Get the user logs
app.get("/api/users/:_id/logs", async (req, res) => {
    const { _id } = req.params;
    const { from, to, limit } = req.query;
    let currentUser = await User.findById(_id).exec();
    const userExercises = await Exercise.find({ userid: _id }).limit(parseInt(limit)).select({ _id: 0, userid: 0, __v: 0 }).exec();
    const log = [];
    userExercises.forEach((i) => log.push({ description: i.description, duration: i.duration, date: i.date.toDateString() }));
    console.log(userExercises);
    res.send({
        username: currentUser.username,
        count: currentUser.count,
        _id: _id,
        log: log
    });
});
