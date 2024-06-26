// routes/problemRoutes.js
const express = require('express');
const router = express.Router();
const ProblemController = require('../controllers/ProblemController');

// // Define routes for problem operations
// router.post('/', ProblemController.createProblem);
// router.get('/:id', ProblemController.getProblemById);
// router.put('/:id', ProblemController.updateProblem);
// router.delete('/:id', ProblemController.deleteProblem);

// router.get('/randomquestion/:difficulty', ProblemController.getRandomQuestion);
router.get('/problems/:difficulty', ProblemController.getProblemsByDifficulty);
router.post('/getQuestionId' , ProblemController.getQuestionId);

router.get('/questionbank' , ProblemController.renderQuestionBank);

module.exports = router;
