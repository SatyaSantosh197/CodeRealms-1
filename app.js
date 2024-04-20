const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require('path');
const authRoutes = require('./routes/authroutes'); 
const cookieParser = require('cookie-parser');
// const checkAuthenticated = require("../middleware/authmiddleware");

const app = express();
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());


mongoose.connect('mongodb://localhost:27017/codeRealmsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', () => console.log("Error in connecting to the database"));
db.once('open', () => console.log("Connected to the database"));

app.use("/", authRoutes); 

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


function generateRealmId(name) {
    return name + Math.random().toString(36).substr(2, 9); 
}
const Realm = require('./models/realm'); 
const Problem = require('./models/problem'); 
const Contest = require('./models/contest'); 
const Organiser = require("./models/organiser");

const jwt = require('jsonwebtoken');





app.post('/create-realm', async (req, res) => {
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





// app.post('/add-realm-to-organizer', async (req, res) => {
//     try {
//         const { username, realmId } = req.body;
//         console.log(username, realmId);
//         const organizer = await Organiser.findOne({ username });

//         if (!organizer) {
//             return res.status(404).json({ success: false, message: 'Organiser not found' });
//         }

//         organizer.realmIds.push(realmId); // Add the new realm ID to the organizer's realmIds array
//         await organizer.save(); // Save the updated organizer document

//         res.status(200).json({ success: true });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: 'Failed to update user' });
//     }
// });

