// UserRoutes.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthControllers');
// const orgController = require('../controllers/OrganiserController');
const Organiser = require("../models/organiser");
const Realm = require('../models/realm');
const Contest = require('../models/contest')
const jwt = require('jsonwebtoken');
const Problem = require('../models/problem'); 
router.post("/signup", AuthController.signup);
router.post("/signin", AuthController.signin);
router.post("/login", AuthController.login);
router.post("/register", AuthController.register);


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
router.get("/register", (req, res) => {
    res.render('register');
});
// Route to render signup.ejs
router.get("/signup", (req, res) => {
    res.render('signup');
});

// Route to render home.ejs
router.get("/home", (req, res) => {
    res.render('home'); // Assuming you have a home.ejs file
});


router.get("/debug_orgregister", (req, res) => {
    res.render('debug_orgregister');
});

router.get('/organisation_page', async (req, res) => {
    try {
        // Get the JWT token from the cookie
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Verify the token and decode it with the secret code
        jwt.verify(token, 'coderealm_secret_code', async (err, decodedToken) => {
            if (err) {
                console.error('JWT verification error:', err);
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            // Extract the username from the decoded token
            const username = decodedToken.username;

            // Find the organiser using the username
            const organiser = await Organiser.findOne({ username });

            if (!organiser) {
                return res.status(404).json({ success: false, message: 'Organiser not found' });
            }

            // Retrieve realm IDs from the organiser's data
            const realmIds = organiser.realmIds;

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

            // Render the 'organisation_page' template with the extracted username and dropdown HTML
            res.render('organisation_page', { username, dropdownsHTML });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


module.exports = router;
