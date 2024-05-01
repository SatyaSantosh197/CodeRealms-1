const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({

    text: String,
    difficulty: String,
    QuestionScore: Number,
    QuestionId: Number,
    QuestionInputFormat: String,
    QuestionOutputFormat: String,
    QuestionTestInput01: String,
    QuestionTestInput02: String,
    QuestionTestInput03: String,
    QuestionTestOutput01: String,
    QuestionTestOutput02: String,
    QuestionTestOutput03: String,
    QuestionTitle: String,
    runMemoryLimit: String,
    runTimeout: Number


});

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
