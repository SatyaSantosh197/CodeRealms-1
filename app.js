const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');

const authRoutes = require('./routes/authroutes'); 
const organiserRoutes = require('./routes/organiserRoutes');
const userRoutes = require('./routes/UserRoutes');
const realmRoutes = require('./routes/realmRoutes');
const problemRoutes = require('./routes/problemRoutes');

const cookieParser = require('cookie-parser');

const db = require('./db/databaseConnection');

const app = express();
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());


app.use("/", authRoutes); 
app.use("/", organiserRoutes);
app.use("/", userRoutes);
app.use("/", realmRoutes);
app.use("/", problemRoutes);


const Problem = require('./models/problem');

app.get('/questionbank', async (req, res) => {
    try {
        const easyQuestion = await Problem.aggregate([{ $match: { difficulty: 'easy' } }, { $sample: { size: 1 } }]);
        const mediumQuestion = await Problem.aggregate([{ $match: { difficulty: 'medium' } }, { $sample: { size: 1 } }]);
        const hardQuestion = await Problem.aggregate([{ $match: { difficulty: 'hard' } }, { $sample: { size: 1 } }]);

        res.render('questionBank', {
            easyQuestion: easyQuestion[0],
            mediumQuestion: mediumQuestion[0],
            hardQuestion: hardQuestion[0]
        });
    } catch (error) {
        console.error("Error fetching random questions:", error);
        res.status(500).send("Internal Server Error");
    }
});


const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
