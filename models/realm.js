const mongoose = require('mongoose');
const Organiser = require('./organiser');

const realmSchema = new mongoose.Schema({
    realmeId: { type: String, required: true },
    name: { type: String, ref: 'Organiser', required: true },
    arrContests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contest' }],
    arrProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }] // Add array for problem IDs
});

const Realm = mongoose.model('Realm', realmSchema);

module.exports = Realm;
