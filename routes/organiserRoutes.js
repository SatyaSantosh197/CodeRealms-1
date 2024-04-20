const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/OrganiserController');

const Organiser = require("../models/organiser");

router.post("/login", AuthController.login);
router.post("/register", AuthController.register);

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

module.exports = router;