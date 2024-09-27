# Exercise Tracker

An exercise tracker using Node, Express and MongoDB. FCC Backend API course final project.

Instructions:

- npm install
- npm run start

View:

- Replit:
    - <https://replit.com/@sfraser-dev/boilerplate-project-exercisetracker>
- Glitch:
    - <https://expensive-rough-veil.glitch.me> 

Usage:

- On the loaded webpage (eg: "127.0.0.1:3000")
    - Create a new user and SUBMIT
- This will take you to "http://127.0.0.1:3000/api/users"
    - Copy the "_id" value for the newly created user (eg: "112233")
- Navigate back to "127.0.0.1:3000"
    - Add exercise info for User ID "112233"
- Navigate to "http://127.0.0.1:3000/api/users/112233/logs" to see the exercise log for User ID "112233"
- Add more exercises
- Get a subset of user's exercise log via: "127.0.0.1:3000/api/users/:_id/logs?[from][&to][&limit]"
    - where "[ ]" is optional
    - from = date (yyyy-mm-dd)
    - to = date (yyyy-mm-dd)
    - limit = number
