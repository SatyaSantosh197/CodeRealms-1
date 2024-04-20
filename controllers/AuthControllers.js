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


