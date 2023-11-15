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
// middleware for getting body data (from forms)
const bodyParser = require("body-parser");

// mongoose setup (for accessing mongodb) 
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
// mongoose user schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true }, 
    count: Number
});
// mongoose user model
const User = mongoose.model("User", userSchema);
// mongoose exercise schema
const exerciseSchema = new mongoose.Schema({
    userid: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    description: String,
    duration: Number,
    date: Date
});
// mongoose exercise model
const Exercise = mongoose.model("Exercise", exerciseSchema);

// TODO: post a new user

// TODO: get a list of users

// TODO: post a new exercise

// TODO: show the user logs
