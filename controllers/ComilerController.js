const Questions = require("../models/problem");
const Submissions = require("../models/submissions");


const express = require("express");
const ejs = require("ejs");
const fs = require("fs");
const { exec } = require("child_process");
const { stringify } = require("querystring");
const { describe } = require("node:test");
const { log } = require("console");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

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
  

const sampleSubmission = {
    QuestionID: "000",
    SubmissionID: "000",
    UserID: "000",
    ContestID: "000",
    CompileStatus: "RUNNING",
    Status01: "NO",
    Status02: "NO",
    Status03: "NO",
    Status: "NOT ACCEPTED",
    userSubmittedCode: "",
  };
  
  var userCode;
  
  function generateString(questionID, userID, timestamp) {
    // Example of generating a string based on the parameters
    return `${questionID}-${userID}-${timestamp}`;
  }
  


exports.createArena = async (req, res) => {
    const questionId = req.params.questionID;
    const userID = req.params.userID;
    const contestID = req.params.contestID;
  
     try {
        //const question = await Questions.findOne({ QuestionId: 189});
  
     // const question = await Questions.findOne({id:'660dc17cf8ba68be2e25373e'}); // why are you using a static id ?
        // fetching dynamic question
        const question = await Questions.findOne({ QuestionId: questionId });
      const submission = await Submissions.findOne(
        { QuestionID: questionId, UserID: userID,  Status: "ACCEPTED" }
        
      );
      console.log("The value of submission is:\n");
      console.log(submission);
  
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      console.log("Question object Fetched is:\n");
      console.log(question);
      console.log("Question ID is:\n ");
      console.log(questionId);
  
      // Create a copy of the sample data object and update its fields with fetched details
      let updatedData;
  
      if (!submission) {
        console.log("entered not submission");
         updatedData = {
          ...sampleData,
          questionTitle: question.QuestionTitle,
          questionText: question.text,
          inputFormat: question.QuestionInputFormat,
          outputFormat: question.QuestionOutputFormat,
          testInput01: question.QuestionTestInput01,
          testOutput01: question.QuestionTestOutput01,
          testInput02: question.QuestionTestInput02,
          testOutput02: question.QuestionTestOutput02,
          testInput03: question.QuestionTestInput03,
          testOutput03: question.QuestionTestOutput03,
        };
      }
  
      else {
        console.log("Type of Question Title is:\n");
        console.log(typeof(question.QuestionTitle));
       updatedData = {
        questionTitle: question.QuestionTitle,
        questionText: question.text,
        inputFormat: question.QuestionInputFormat,
        outputFormat: question.QuestionOutputFormat,
        testInput01: question.QuestionTestInput01,
        testOutput01: question.QuestionTestOutput01,
        testInput02: question.QuestionTestInput02,
        testOutput02: question.QuestionTestOutput02,
        testInput03: question.QuestionTestInput03,
        testOutput03: question.QuestionTestOutput03,
        status: submission.Status,
        status01: submission.Status01,
        status02: submission.Status02,
        status03: submission.Status03,
       };
       console.log("The value of Updated Data is\n");
       console.log(updatedData);
      }
      // Render the page with updated data
      res.render("RCET_home", updatedData);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
}

exports.codeEvaluation = async (req, res) => {
    const Val = req.body.code; // Parse the request body
    const questionID = req.body.questionID;
    const userID = req.body.userID;
    console.log("The value of req.body.code at upload route is:\n");
    console.log(Val);
    console.log(typeof Val);
    userCode = Val;
    const myHeaders = new Headers();
    let CheckedFlag = true;
    let updatedData;
    try {
      //const question = await Questions.findOne({ QuestionId: 189});
  
   // const question = await Questions.findOne({id:'660dc17cf8ba68be2e25373e'}); // why are you using a static id ?
      // fetching dynamic question
      const question = await Questions.findOne({ QuestionId: questionID });
    const submission = await Submissions.findOne(
      { QuestionID: questionID, UserID: userID},
      {}
    );
  
    if (!question&&typeof(question)=="undefined") {
      return res.status(404).json({ error: "Question not found" });
    }
    console.log("Question object Fetched is:\n");
    console.log(question);
    console.log(questionID);
  
    // Create a copy of the sample data object and update its fields with fetched details
    
  
    if (!submission||submission==undefined) {
        CheckedFlag = false;
       updatedData = {  
        ...sampleData,
        questionTitle: question.QuestionTitle,
        questionText: question.text,
        inputFormat: question.QuestionInputFormat,
        outputFormat: question.QuestionOutputFormat,
        testInput01: question.QuestionTestInput01,
        testOutput01: question.QuestionTestOutput01,
        testInput02: question.QuestionTestInput02,
        testOutput02: question.QuestionTestOutput02,
        testInput03: question.QuestionTestInput03,
        testOutput03: question.QuestionTestOutput03,
      };
    }
  
    else {
      console.log(typeof(question.QuestionTitle));
     updatedData = {
       status: "Yet to Solve",
      questionTitle: question.QuestionTitle,
      questionText: question.text,
      inputFormat: question.QuestionInputFormat,
      outputFormat: question.QuestionOutputFormat,
      testInput01: question.QuestionTestInput01,
      testOutput01: question.QuestionTestOutput01,
      testInput02: question.QuestionTestInput02,
      testOutput02: question.QuestionTestOutput02,
      testInput03: question.QuestionTestInput03,
      testOutput03: question.QuestionTestOutput03,
      status: submission.Status,
      status01: submission.Status01,
      status02: submission.Status02,
      status03: submission.Status03,
     };
     console.log("The value of Updated Data at upload route is\n");
     console.log(updatedData);
    }
  } catch (error) {console.error("Error:", error);}
    myHeaders.append("Content-Type", "application/json");
  
  
  // Populate input and output arrays
  const inputArray = [
    updatedData.testInput01,
    updatedData.testInput02,
    updatedData.testInput03,
  ];
  const outputArray = [
    updatedData.testOutput01,
    updatedData.testOutput02,
    updatedData.testOutput03,
  ];
  for(let looper =0;looper<3;looper++){
    console.log("The value of inputArray[looper] and outputArray[looper] is:\n");
    console.log(inputArray[looper]);
    console.log(outputArray[looper]);
  }
  
    const resultArray = [];
    let compStatus = "RUNNING";
    for (let i = 0; i < 3; i++) {
      const raw = JSON.stringify({
        language: "c++",
        version: "10.2.0",
        files: [
          {
            name: "my_cool_code.cpp",
            content: Val,
          },
        ],
        stdin: inputArray[i],
        args: ["1", "2", "3"],
        compile_timeout: 10000,
        run_timeout: 3000,
        compile_memory_limit: -1,
        run_memory_limit: -1,
      });
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };
  
      try {
        const response = await fetch(
          "https://emkc.org/api/v2/piston/execute",
          requestOptions
        );
        const result = await response.json();
        console.log(result);
  
        if (result.compile.code !== 1) {
          if (result.run.stdout === outputArray[i]) resultArray.push("YES");
          
          else resultArray.push("NO");
        } else {
           compStatus = "FAILED";
          resultArray.push("NO");
        }
        console.log("The values of result.stdout and outputArray[i] are:\n");
        console.log(JSON.stringify(result.run.stdout));
          console.log(JSON.stringify(outputArray[i]));
      } catch (error) {
        console.error(error);
      }
    }
  
    const timestamp = new Date().toISOString();
  
    const submissionDeets = {
      ...sampleSubmission,
      QuestionID: questionID,
      SubmissionID: generateString(questionID, userID, timestamp),
      UserID: userID,
      ContestID: "000",
      CompileStatus: compStatus,
      Status01: resultArray[0],
      Status02: resultArray[1],
      Status03: resultArray[2],
      Status:
        (resultArray[0] === "YES" &&
        resultArray[1] === "YES" &&
        resultArray[2] === "YES") ? "ACCEPTED" : "NOT ACCEPTED",
      userSubmittedCode: Val,
    };
      try {
      const newSubmission = new Submissions(submissionDeets);
      const savedSubmission = await newSubmission.save();
      } catch(error){
        console.error('Error saving submission at line 268:', error);
        res.status(500).json({ error: "Internal server error" });
      }
  
    
    
  
  
  
    const pageData = {
      ...updatedData,
      status01: resultArray[0],
      status02: resultArray[1],
      status03: resultArray[2],
      status: compStatus,
    };
    console.log("Page Data Details Before Submission are:\n");
    console.log(pageData);
    statusValues = {status: pageData.status, status01: pageData.status01, status02: pageData.status02, status03: pageData.status03};
    const consoleTemplate = fs.readFileSync("./views/console.ejs", "utf-8");
    const updatedconsoleView = ejs.compile(consoleTemplate);
    const updatedConsoleHTML = updatedconsoleView(statusValues);
    res.send(updatedConsoleHTML);
  
}