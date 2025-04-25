const Response = require('../models/Response');
const Assessment = require('../models/Assessment');

// Submit response to assessment
exports.submitResponse = async (req, res) => {
  const { assessmentId, answers, name, email } = req.body;

  try {
    // Find the assessment to calculate score
    const assessment = await Assessment.findById(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Validate that answers array length matches questions length
    if (answers.length !== assessment.questions.length) {
      return res.status(400).json({ message: 'Answer count does not match question count' });
    }

    // Calculate score
    let score = 0;
    for (let i = 0; i < answers.length; i++) {
      if (answers[i] === assessment.questions[i].correctAnswerIndex) {
        score++;
      }
    }

    // Create new response
    const newResponse = new Response({
      assessmentId,
      answers,
      score,
      name,
      email
    });

    const response = await newResponse.save();

    // Return the response with score and correct answers
    const result = {
      response,
      totalQuestions: assessment.questions.length,
      correctAnswers: assessment.questions.map(q => q.correctAnswerIndex)
    };

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get response by ID
exports.getResponse = async (req, res) => {
  try {
    const response = await Response.findById(req.params.id);
    
    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    // Find the related assessment to include question details
    const assessment = await Assessment.findById(response.assessmentId);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const result = {
      response,
      assessment: {
        title: assessment.title,
        description: assessment.description,
        questions: assessment.questions
      }
    };

    res.json(result);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Response not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all responses for an assessment
exports.getResponsesByAssessment = async (req, res) => {
  try {
    const responses = await Response.find({ assessmentId: req.params.assessmentId });
    res.json(responses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete response by ID
exports.deleteResponse = async (req, res) => {
  try {
    const response = await Response.findById(req.params.id);
    
    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    await Response.findByIdAndDelete(req.params.id);
    res.json({ message: 'Response deleted successfully' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Response not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};