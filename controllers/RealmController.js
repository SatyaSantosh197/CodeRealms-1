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
        await Contest.findOneAndUpdate({ text: contestName }, { $push: { arrProblems: problemId } });
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
