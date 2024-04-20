const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Import jsonwebtoken library
const User = require('../models/User');

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
    try {
        // Get the JWT token from the cookie named 'userjwt'
        const token = req.cookies.userjwt;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Verify the token and decode it with the secret code
        jwt.verify(token, 'coderealm_secret_code', (err, decodedToken) => {
            if (err) {
                console.error('JWT verification error:', err);
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            // Extract the username from the decoded token
            const username = decodedToken.username;

            // Render the 'home' template with the extracted username
            res.render('home', { username });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
