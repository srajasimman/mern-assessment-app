const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');

// @route   POST api/responses
// @desc    Submit a response to an assessment
// @access  Public
router.post('/', responseController.submitResponse);

// @route   GET api/responses/:id
// @desc    Get response by ID
// @access  Public
router.get('/:id', responseController.getResponse);

// @route   GET api/responses/assessment/:assessmentId
// @desc    Get all responses for an assessment
// @access  Public (would be restricted to admin in a real app)
router.get('/assessment/:assessmentId', responseController.getResponsesByAssessment);

// @route   DELETE api/responses/:id
// @desc    Delete a response by ID
// @access  Public (would be restricted to admin in a real app)
router.delete('/:id', responseController.deleteResponse);

module.exports = router;