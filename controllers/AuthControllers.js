const User = require('../models/User');
const Organiser = require('../models/organiser'); // Assuming this is the correct import for the Organiser model
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');


exports.signup = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // Create a new User document
        const newUser = new User({ username, password, email });
        await newUser.save();

        console.log("User records inserted successfully");
        res.redirect('/home');
    } catch (error) {
        console.error('Error:', error.message);
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.message });
        } else if (error.code === 11000) {
            res.status(400).json({ error: 'Email must be unique' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

exports.signin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        console.log("User signed in successfully");
        res.redirect('/home');
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const org = await Organiser.findOne({ username });

        if (!org) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, org.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        console.log(org.username);

        // Create JWT token with secret code "coderealm_secret_code"
        const token = jwt.sign({ username: org.username }, 'coderealm_secret_code', {
            expiresIn: '1h' // Token expires in 1 hour
        });

        // Set the token as a cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 3600000, // Cookie expires in 1 hour
            secure: process.env.NODE_ENV === 'production' // Set secure to true in production
        });

        console.log("Organiser signed in successfully");
        res.redirect('/organisation_page');
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.register = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const newUser = new User({ username, password, email });
        await newUser.save();

        // Create a new Organiser document
        const newOrganiser = new Organiser({ username, password, realmId: 'realmIdHere' }); // Update realmId as per your requirement
        await newOrganiser.save();

        console.log("User and Organiser records inserted successfully");
        res.redirect('/login');
    } catch (error) {
        console.error('Error:', error.message);
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.message });
        } else if (error.code === 11000) {
            res.status(400).json({ error: 'Email must be unique' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};