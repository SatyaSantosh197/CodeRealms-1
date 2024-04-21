// UserRoutes.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthControllers');

const Organiser = require('../models/organiser');
const Realm = require('../models/realm');
const Contest = require('../models/contest')
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Problem = require('../models/problem');

const nodemailer = require('nodemailer');

router.post("/signup", AuthController.signup);
router.post("/signin", AuthController.signin);


function generateRealmId(name) {
    return name + Math.random().toString(36).substr(2, 9);
}
router.post('/create-realm', async (req, res) => {
    try {

        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const decodedToken = jwt.verify(token, 'coderealm_secret_code');
        const username = decodedToken.username;

        // Find the organizer using the extracted username
        const organizer = await Organiser.findOne({ username });

        if (!organizer) {
            return res.status(404).json({ success: false, message: 'Organiser not found' });
        }

        const { name, contests, problems } = req.body;

        const contestIds = [];
        const problemIds = [];

        // Create contests and problems, and collect their IDs
        for (const contestData of contests) {
            // Create contest
            const contest = await Contest.create({
                text: contestData.name,
                badge: {}
            });

            contestIds.push(contest._id);

            // Create problems for the contest
            const contestProblems = [];
            for (const problemData of contestData.problems) {
                const problem = await Problem.create({
                    question: problemData.question,
                    rating: problemData.rating,
                    points: problemData.points,
                });

                problemIds.push(problem._id);
                contestProblems.push(problem._id);
            }

            // Update contest with problem IDs
            await Contest.findByIdAndUpdate(contest._id, { arrproblem: contestProblems });
        }

        // Create a new realm
        const newRealm = await Realm.create({
            realmeId: generateRealmId(name),
            name: name,
            arrContests: contestIds,
            arrProblems: problemIds,
        });

        // Update the organizer's realmIds array
        organizer.realmIds.push(newRealm._id);
        await organizer.save();

        res.status(201).json({ success: true, realmId: newRealm._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to create realm' });
    }
});


router.get("/realm_search", async (req, res) => {
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
});





router.post("/join_realm", async (req, res) => {
    try {
        const token = req.cookies.userjwt;

        console.log("Running join realm");
        const { realmId } = req.body;
        if (!token || !realmId) {
            return res.status(400).json({ success: false, message: 'Token and realm ID are required' });
        }

        // Verify the token
        const decoded = jwt.verify(token, 'coderealm_secret_code');
        const { username, email } = decoded;

        // Find the user based on the username
        const user = await User.findOne({ username });

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
});


// Route to render home.ejs
router.get("/home", async (req, res) => {
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
});




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
