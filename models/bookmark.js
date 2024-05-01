const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    questionTitle: String,
    difficulty: String,
    text: String,
    QuestionTestOuput01: String,
    QuestionTestOuput02: String, 
    QuestionTestOuput03: String,
    QuestionOutputFormat: String,
    QuestionId: String,
    QuestionTestInput01: String,
    QuestionTestInput02: String,
    QuestionTestInput03: String,
    QuestioninputFormat: String,
    runMemoryLimit: String,
    runTimeout: String
});

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
module.exports = Bookmark;