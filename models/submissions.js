const mongoose = require('mongoose');


const submissionSchema = new mongoose.Schema({
    QuestionID: String,
    SubmissionID: String,
    UserID: String,
    ContestID: String,
    CompileStatus: String,
    // What do these Status{X} represent ?
  
    Status01: String,
    Status02: String,
    Status03: String,
    Status: String,
    userSubmittedCode: String,
  });
  
const Submissions = mongoose.model("Submissions", submissionSchema);

module.exports = Submissions;