const express = require('express');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken library
const nodemailer = require('nodemailer');

const User = require('../models/User');
const Realm = require('../models/realm');
const Contest = require('../models/contest')
const Problem = require('../models/problem');

exports.signup = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const newUser = new User({ username, password, email });
        await newUser.save();

        console.log("Record Inserted Successfully");
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




exports.realm_search = async (req, res) => {
    try {
        const searchTerm = req.query.q;

        const regex = new RegExp(`^${searchTerm}`, 'i');

        // Fetch realms from the database where the name matches the regular expression
        const realms = await Realm.find({ name: { $regex: regex } });

        const dropdownsHTML = [];

        // Iterate over realms
        for (const realm of realms) {
            // Array to store contest links HTML
            const contestLinksHTML = [];

            // Retrieve contest data based on contest IDs in the realm
            const contestPromises = realm.arrContests.map(async contestId => {
                // Retrieve contest data based on contest ID
                const contest = await Contest.findById(contestId);
                if (contest) {
                    // Add contest name to contest links HTML
                    contestLinksHTML.push(`<a href="#">${contest.text}</a>`);
                }
            });

            // Wait for all contest promises to resolve
            await Promise.all(contestPromises);

            // Construct dropdown HTML
            const dropdownHTML = `
                <div class="dropdown">
                    <button class="dropdown-btn" >${realm.name}</button>
                    <div class="dropdown-content">
                        ${contestLinksHTML.join('')}
                    </div>
                </div>
                <button id="${realm.name}" style="width : 100px, height : 50px" onclick="joinRealm('${realm._id}')">JOIN REALM</button>
            `;

            // Add dropdown HTML to array
            dropdownsHTML.push(dropdownHTML);
        }

        // Render the 'realm_search' template with the searchTerm and dropdownsHTML
        res.render('realm_search', { searchTerm, dropdownsHTML });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}




exports.join_realm = async (req, res) => {
    try {
        const token = req.cookies.userjwt;

        console.log("Running join realm");
        const { realmId } = req.body;
        if (!token || !realmId) {
            return res.status(400).json({ success: false, message: 'Token and realm ID are required' });
        }

        // Verify the token
        const decoded = jwt.verify(token, 'coderealm_secret_code');
        const { username } = decoded;

        // Find the user based on the username
        const user = await User.findOne({ username });

        const email = user.email;

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Add the realm ID to the user's realmIds array
        user.realmIds.push(realmId);
        // Save the updated user object back to the database
        await user.save();



        //sending Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'abhiram.k22@iiits.in',
                pass: 'tempPassword' // Enter your Gmail app password here
            }
        });

        const mailOptions = {
            from: 'abhiram.k22@iiits.in',
            to: email, // User's email
            subject: 'You have joined a Realm ' + realmId,
            text: `Hello ${username},\n\nYou have successfully joined a realm.\n\nRealm ID: ${realmId},
                    Thanks for using CodeRealms`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });




        res.status(200).json({ success: true, message: 'User joined the realm successfully' });


    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


// Route to render home.ejs
exports.home = async (req, res) => {
    try {
        const token = req.cookies.userjwt;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Wrap jwt.verify in a Promise
        const decodedToken = await new Promise((resolve, reject) => {
            jwt.verify(token, 'coderealm_secret_code', (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded);
            });
        });

        const username = decodedToken.username;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Retrieve realm IDs from the user's data
        const realmIds = user.realmIds;

        // Retrieve realms data based on realm IDs
        const realms = await Realm.find({ _id: { $in: realmIds } });

        // Array to store dropdown HTML
        const dropdownsHTML = [];

        // Iterate over realms
        for (const realm of realms) {
            // Array to store contest links HTML
            const contestLinksHTML = [];

            // Retrieve contest data based on contest IDs in the realm
            const contestPromises = realm.arrContests.map(async contestId => {
                // Retrieve contest data based on contest ID
                const contest = await Contest.findById(contestId);
                if (contest) {
                    // Add contest name to contest links HTML
                    contestLinksHTML.push(`<a href="#">${contest.text}</a>`);
                }
            });

            // Wait for all contest promises to resolve
            await Promise.all(contestPromises);

            // Construct dropdown HTML
            const dropdownHTML = `
                <div class="dropdown">
                    <button class="dropdown-btn">${realm.name}</button>
                    <div class="dropdown-content">
                        ${contestLinksHTML.join('')}
                    </div>
                </div>
            `;

            // Add dropdown HTML to array
            dropdownsHTML.push(dropdownHTML);
        }

        res.render('home', { username, dropdownsHTML });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
