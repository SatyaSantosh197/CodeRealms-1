// UserRoutes.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthControllers');

const Organiser = require('../models/organiser');
const Realm = require('../models/realm');
const Contest = require('../models/contest')
const jwt = require('jsonwebtoken');
const Problem = require('../models/problem'); 

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

// Route to render home.ejs
router.get("/home", (req, res) => {
    res.render('home'); // Assuming you have a home.ejs file
});



module.exports = router;
