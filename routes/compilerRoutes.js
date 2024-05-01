const express = require('express');
const router = express.Router();

const CompilerController = require('../controllers/ComilerController');

router.get('/RCET/practice/:questionID/:userID/:contestID', CompilerController.createArena);
router.post('/upload' , CompilerController.codeEvaluation);

module.exports = router;