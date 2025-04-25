const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');

// @route   GET api/assessments
// @desc    Get all assessments (without correct answers)
// @access  Public
router.get('/', assessmentController.getAssessments);

// @route   GET api/assessments/:id
// @desc    Get assessment by ID (without correct answers)
// @access  Public
router.get('/:id', assessmentController.getAssessment);

// @route   GET api/assessments/:id/with-answers
// @desc    Get assessment by ID with correct answers
// @access  Public (would be restricted to admin in a real app)
router.get('/:id/with-answers', assessmentController.getAssessmentWithAnswers);

// @route   POST api/assessments
// @desc    Create a new assessment
// @access  Public (would be restricted to admin in a real app)
router.post('/', assessmentController.createAssessment);

// @route   PUT api/assessments/:id
// @desc    Update an assessment
// @access  Public (would be restricted to admin in a real app)
router.put('/:id', assessmentController.updateAssessment);

// @route   DELETE api/assessments/:id
// @desc    Delete an assessment
// @access  Public (would be restricted to admin in a real app)
router.delete('/:id', assessmentController.deleteAssessment);

module.exports = router;