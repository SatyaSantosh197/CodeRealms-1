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


router.post("/signup", AuthController.signup);
router.post("/signin", AuthController.signin);



router.get("/superuser_panel", async (req, res) => {

    try {
        // Fetch all users from the database
        const users = await User.find();

        // Fetch all reviews from the database
        const realms = await Realm.find();
        const organisers = await Organiser.find();
        const contests = await Contest.find();
        const problems = await Problem.find();


        const token = req.cookies.superjwt;
        const decodedToken = jwt.verify(token, 'coderealm_secret_code');
        const userRole = decodedToken.role;

        // Check if the user has the superuser role
        if (userRole !== 'superuser') {
            return res.status(403).send("Access Denied");
        }

        // Render the superuser portal page with users and reviews
        res.render("superuser_panel", { users, realms, contests ,problems,organisers });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }

});


router.get('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/realms/:realmName', async (req, res) => {
    const realmName = req.params.realmName;

    try {
        // Find the realm by name
        const realm = await Realm.findOne({ name: realmName });
        console.log(realm);

        if (!realm) {
            return res.status(404).json({ message: 'Realm not found' });
        }

        // Find contests associated with the realm
        const contests = await Contest.find({ realm: realm._id });

        // Construct the response object with realm details and associated contests
        const realmData = {
            _id: realm._id, // Add the _id property
            name: realm.name,
            contests: contests.map(contest => ({
                name: contest.name,
                problems: contest.problems._id // Assuming each contest has an array of problems
            }))
        };
        

        res.json(realmData); // Send the response with realm details
    } catch (error) {
        console.error('Error fetching realm details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post("/change_role", async (req, res) => {
    try {
        const { userId, role } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Update user's role
        user.role = role;
        await user.save();

        // Return success response
        res.status(200).json({ message: "User role updated successfully.", user });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred while updating user role." });
    }
});


router.put('/organisers/:organiserId/ban', async (req, res) => {
    const { organiserId } = req.params;
    const { banned } = req.body;

    try {
        // Find the organiser by ID and update the banned status
        const updatedOrganiser = await Organiser.findByIdAndUpdate(organiserId, { banned }, { new: true });

        if (!updatedOrganiser) {
            return res.status(404).json({ message: "Organiser not found" });
        }

        res.json(updatedOrganiser);
    } catch (error) {
        console.error("Error updating organiser status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.delete('/realms/:realmId', async (req, res) => {
    const realmId = req.params.realmId;
    try {
        // Find the realm by ID and delete it
        const deletedRealm = await Realm.findByIdAndDelete(realmId);
        if (!deletedRealm) {
            return res.status(404).json({ error: 'Realm not found' });
        }
        
        // Delete all contests associated with the deleted realm
        await Contest.deleteMany({ _id: { $in: deletedRealm.arrContests } });
        
        // Delete all problems associated with the contests of the deleted realm
        await Problem.deleteMany({ _id: { $in: deletedRealm.arrProblems } });
        
        // Remove the realmId from all users who have it in their realmIds array
        await User.updateMany(
            { realmIds: realmId },
            { $pull: { realmIds: realmId } }
        );

        // If realm deleted successfully along with associated contests and problems, send a success response
        res.status(200).json({ message: 'Realm and associated contests and problems deleted successfully' });
    } catch (error) {
        console.error('Error deleting realm:', error);
        res.status(500).json({ error: 'An error occurred while deleting the realm and associated contests and problems' });
    }
});




router.get("/moderator_panel",async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await User.find();

        // Fetch all reviews from the database
        const realms = await Realm.find();
        const organisers = await Organiser.find();
        const contests = await Contest.find();
        const problems = await Problem.find();


        const token = req.cookies.superjwt;
        const decodedToken = jwt.verify(token, 'coderealm_secret_code');
        const userRole = decodedToken.role;

        // Check if the user has the superuser role
        if (userRole !== 'moderator') {
            return res.status(403).send("Access Denied");
        }

        // Render the superuser portal page with users and reviews
        res.render("moderator_panel", { realms, contests ,problems,organisers });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
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
