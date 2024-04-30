const mongoose = require('mongoose');
const Organiser = require('./organiser');

const Contest = require('./contest');
const Problem = require('./problem');

const realmSchema = new mongoose.Schema({
    realmeId: { type: String, required: true },
    name: { type: String, ref: 'Organiser', required: true },
    arrContests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contest' }],
    arrProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }] // Add array for problem IDs
});

realmSchema.pre('remove', async function(next) {
    try {
        // Delete all contests associated with this realm
        await Contest.deleteMany({ _id: { $in: this.arrContests } });
        next();
    } catch (error) {
        next(error);
    }
});

const Realm = mongoose.model('Realm', realmSchema);

module.exports = Realm;
