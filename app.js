const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');

const ejs = require("ejs");
const fs = require("fs");
const { exec } = require("child_process");
const { stringify } = require("querystring");
const { describe } = require("node:test");
const { log } = require("console");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require('./routes/authroutes'); 
const organiserRoutes = require('./routes/organiserRoutes');
const userRoutes = require('./routes/UserRoutes');
const realmRoutes = require('./routes/realmRoutes');
const problemRoutes = require('./routes/problemRoutes');
const compilerRoutes = require("./routes/compilerRoutes");

const cookieParser = require('cookie-parser');

const db = require('./db/databaseConnection');

const app = express();
app.set('view engine', 'ejs');
app.set('view cache', false);
app.engine('ejs', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());


app.use(
    cors({
      origin: "http://127.0.0.1:5500",
    })
  );

app.use("/", authRoutes); 
app.use("/", organiserRoutes);
app.use("/", userRoutes);
app.use("/", realmRoutes);
app.use("/", problemRoutes);
app.use("/", compilerRoutes);




app.get('/logout', (req, res) => {
    // Clear all cookies
    res.clearCookie('userjwt');
    res.clearCookie('superjwt');
    res.clearCookie('moderatorjwt');

    // Redirect to the home page or any other page you prefer
    res.redirect('/');
});


app.get("/", (req, res) => {
  
    const sampleData = {
      questionTitle: "Sample Question Title",
      questionText: "This is a sample sample text.",
      inputFormat: "Sample input format.",
      outputFormat: "Sample output format.",
      testInput01: "Sample test input 1",
      testOutput01: "Sample test output 1",
      testInput02: "Sample test input 2",
      testOutput02: "Sample test output 2",
      testInput03: "Sample test input 3",
      testOutput03: "Sample test output 3",
      status: "Yet to Solve",
      status01: "Not Accepted",
      status02: "Not Accepted",
      status03: "Not Accepted",
    };
  
    res.render("RCET_home", sampleData);
  });


const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
