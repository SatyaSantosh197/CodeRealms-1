// UserRoutes.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthControllers');

const Organiser = require('../models/organiser');
const Realm = require('../models/realm');
const Contest = require('../models/contest')
const User = require('../models/User');
const jwt = require('jsonwebtoken');


router.post("/signup", AuthController.signup);
router.post("/signin", AuthController.signin);


function generateRealmId(name) {
    return name + Math.random().toString(36).substr(2, 9);
}




// Route to render index.ejs
router.get("/", (req, res) => {
    res.render('index');
});

// Route to render login.ejs
router.get("/login", (req, res) => {
    res.render('login');
});
// Route to render signin.ejs
router.get("/signin", (req, res) => {
    res.render('signin');
});

// Route to render signup.ejs
router.get("/signup", (req, res) => {
    res.render('signup');
});


module.exports = router;
