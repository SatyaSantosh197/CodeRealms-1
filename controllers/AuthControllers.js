const User = require('../models/User');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');


exports.signup = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // Create a new User document
        const newUser = new User({ username, password, email });
        await newUser.save();


        console.log("User records inserted successfully");
        res.redirect('/signin');
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

        // Generate JWT token
        const token = jwt.sign({ username: user.username, role : user.role }, 'coderealm_secret_code');



        // Check if the user is an moderator
        if (user.role === 'moderator') {

            res.cookie('superjwt', token, { httpOnly: true });
            // Send an alert for moderator
            return res.send(`
        <script>
          window.location.href = '/moderator_panel?moderator=true';
          alert("Welcome, moderator!");
        </script>
      `);
        }
        // Check if the user is a superuser
        else if (user.role === 'superuser') {

            res.cookie('superjwt', token, { httpOnly: true });
            // Send an alert for superuser
            return res.send(`
        <script>
          window.location.href = '/superuser_panel?superuser=true';
          alert("Welcome, superuser!");
        </script>
      `);
        }
        else {
            console.log("User signed in successfully");
            res.cookie('userjwt', token, { httpOnly: true }); // Set JWT token in a cookie named 'userjwt'
            res.redirect('/home');
        }





    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
