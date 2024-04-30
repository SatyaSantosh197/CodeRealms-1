const express = require('express');
const router = express.Router();
const OrganiserController = require('../controllers/OrganiserController');
const jwt = require('jsonwebtoken');


const Organiser = require("../models/organiser");
const Realm = require("../models/realm");
const Contest = require("../models/contest");
const Problem = require("../models/problem");

router.post("/login", OrganiserController.login);
router.post("/register", OrganiserController.register);

router.get("/register", (req, res) => {
    res.render('register');
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

        if (organizer.banned) {
            return res.status(403).json({ success: false, message: 'Organiser is banned. Cannot create realm.' });
        }

        const { name, contests, problems } = req.body;

        const contestIds = [];
        const problemIds = [];

        // Create contests and collect their IDs
        for (const contestData of contests) {
            // Create contest
            const contest = await Contest.create({
                text: contestData.name,
            });

            contestIds.push(contest._id);

            // Create problems for the contest
            const contestProblems = [];
            for (const problemData of contestData.problems) {
                // Create problem
                const problem = await Problem.create({
                    text: problemData.text,
                    difficulty: problemData.difficulty,
                    QuestionScore: problemData.QuestionScore,
                    QuestionId: problemData.QuestionId,
                    QuestionInputFormat: problemData.QuestionInputFormat,
                    QuestionOutputFormat: problemData.QuestionOutputFormat,
                    QuestionTestInput01: problemData.QuestionTestInput01,
                    QuestionTestInput02: problemData.QuestionTestInput02,
                    QuestionTestInput03: problemData.QuestionTestInput03,
                    QuestionTestOutput01: problemData.QuestionTestOutput01,
                    QuestionTestOutput02: problemData.QuestionTestOutput02,
                    QuestionTestOutput03: problemData.QuestionTestOutput03,
                    QuestionTitle: problemData.QuestionTitle,
                    runMemoryLimit: problemData.runMemoryLimit,
                    runTimeout: problemData.runTimeout
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




// Assuming you have already imported necessary models and middleware
router.post('/fetch-contests', async (req, res) => {
    try {
        const { realmName } = req.body;

        // Find the realm based on the name
        const realm = await Realm.findOne({ name: realmName }).populate({
            path: 'arrContests',
            select: 'text' // Select only the text field (contest name)
        });

        if (!realm) {
            return res.status(404).json({ success: false, message: 'Realm not found' });
        }

        // Extract contest names from the realm
        const contestNames = realm.arrContests.map(contest => contest.text);

        res.status(200).json({ success: true, contestNames });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch contests' });
    }
});


router.post('/create-contest', async (req, res) => {
    try {
        const { realmName, contestName } = req.body;

        // Create a new contest
        const newContest = new Contest({
            text: contestName // Assuming the contest name is stored in the 'text' field
        });

        // Save the new contest to the database
        const savedContest = await newContest.save();

        // Find the realm based on the name
        const realm = await Realm.findOne({ name: realmName });

        if (!realm) {
            return res.status(404).json({ success: false, message: 'Realm not found' });
        }

        realm.arrContests.push(savedContest._id);
        await realm.save();

        res.status(201).json({ success: true, contestId: savedContest._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to create contest' });
    }
});


// Assuming you're using Express.js for your server
router.post('/delete-realm', async (req, res) => {
    try {
        const { realmName } = req.body;

        console.log('Deleting realm:', realmName);
        // Find the realm by name
        const realm = await Realm.findOne({ name: realmName }).exec();

        // Delete associated contests
        await Contest.deleteMany({ _id: { $in: realm.arrContests } }).exec();

        // Delete associated problems
        await Problem.deleteMany({ _id: { $in: realm.arrProblems } }).exec();

        // Delete the realm
        await realm.deleteOne();
        // Respond with success status
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to delete realm');
    }
});






module.exports = router;