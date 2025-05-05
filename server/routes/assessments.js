const express = require('express');
const router = express.Router();
const { 
  getAssessments, 
  getAssessment, 
  getAssessmentForResponder, 
  createAssessment, 
  updateAssessment, 
  deleteAssessment,
  importAssessment
} = require('../controllers/assessmentController');

// @route   GET api/assessments
// @desc    Get all assessments (without correct answers)
// @access  Public
router.get('/', getAssessments);

// @route   GET api/assessments/:id
// @desc    Get assessment by ID (without correct answers)
// @access  Public
router.get('/:id', getAssessment);

// @route   GET api/assessments/:id/with-answers
// @desc    Get assessment by ID with correct answers
// @access  Public (would be restricted to admin in a real app)
router.get('/:id/with-answers', getAssessmentForResponder);

// @route   POST api/assessments
// @desc    Create a new assessment
// @access  Public (would be restricted to admin in a real app)
router.post('/', createAssessment);

// @route   PUT api/assessments/:id
// @desc    Update an assessment
// @access  Public (would be restricted to admin in a real app)
router.put('/:id', updateAssessment);

// @route   DELETE api/assessments/:id
// @desc    Delete an assessment
// @access  Public (would be restricted to admin in a real app)
router.delete('/:id', deleteAssessment);

// @route   POST api/assessments/import
// @desc    Import assessment from JSON
// @access  Public (would be restricted to admin in a real app)
router.post('/import', importAssessment);

module.exports = router;