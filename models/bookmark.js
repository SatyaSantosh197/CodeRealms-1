const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    questionTitle: String,
    difficulty: String,
    
});

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
module.exports = Bookmark;