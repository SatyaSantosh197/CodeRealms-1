const mongoose = require('mongoose');
const Problem = require('./problem');

const contestSchema = new mongoose.Schema({
    arrproblem: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
    text: String,
    points: Number,
    contestId: Number,
    badge: {
        png: { data: Buffer, contentType: String },
        id: String
    },
    startdate : Date ,
    enddate : Date
});

contestSchema.pre('remove', async function(next) {
    try {
        // Delete all problems associated with this contest
        await Problem.deleteMany({ _id: { $in: this.arrProblems } });
        next();
    } catch (error) {
        next(error);
    }
});

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;
