// UserRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const Organiser = require(/models/organiser);

router.post("/signup", userController.signup);
router.post("/signin", userController.signin);

// Route to render index.ejs
router.get("/", (req, res) => {
    res.render('index');
});


// Route to render signin.ejs
router.get("/signin", (req, res) => {
    res.render('signin');
});

// Route to render signup.ejs
router.get("/signup", (req, res) => {
    res.render('signup');
});

// Route to render home.ejs
router.get("/home", (req, res) => {
    res.render('home'); // Assuming you have a home.ejs file
});


module.exports = router;
