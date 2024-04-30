// controllers/RealmController.js
const Realm = require('../models/realm');
const Problem = require('../models/problem');
const Contest = require('../models/contest');
const express = require('express');

exports.create_problem = async (req, res) => {
    try {
        const newProblem = new Problem(req.body);
        await newProblem.save();
        res.status(201).json(newProblem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create problem' });
    }
}

exports.update_contest = async (req, res) => {
    try {
        const { contestName, problemId } = req.body;
        await Contest.findOneAndUpdate({ text: contestName }, { $push: { arrproblem: problemId } });
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update contest with problem ID' });
    }
}

exports.update_realm = async (req, res) => {
    try {
        const { realmName, problemId } = req.body;
        await Realm.findOneAndUpdate({ name: realmName }, { $push: { arrProblems: problemId } });
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update realm with problem ID' });
    }
}


exports.findRealmDetails = async (req, res) => {
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
}

exports.deleteRealm =  async (req, res) => {
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
}