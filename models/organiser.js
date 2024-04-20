const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const User = require('./User');
const Realm = require('./realm');

const organiserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    realmIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Realm' }] // Reference to Realm model
});


organiserSchema.pre('save', async function (next) {
    const organiser = this;
    if (!organiser.isModified('password')) return next();
    try {
        const hashedPassword = await bcrypt.hash(organiser.password, 10);
        organiser.password = hashedPassword;
        next();
    } catch (error) {
        return next(error);
    }
});

const Organiser = mongoose.model('Organiser', organiserSchema);

module.exports = Organiser;
