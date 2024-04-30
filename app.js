const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');

const authRoutes = require('./routes/authroutes'); 
const organiserRoutes = require('./routes/organiserRoutes');
const userRoutes = require('./routes/UserRoutes');
const realmRoutes = require('./routes/realmRoutes');

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

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
