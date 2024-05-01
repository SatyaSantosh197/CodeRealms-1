const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/codeRealmsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', () => console.log("Error in connecting to the database"));
db.once('open', () => console.log("Connected to the database"));

db.on("error", (err) => {
    console.error(`MongoDB connection error: ${err}`);
});
  
db.on("disconnected", () => {
    console.log("Disconnected from MongoDB");
});

module.exports = db;