const Assessment = require('../models/Assessment');

// Get all assessments
exports.getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find().select('-questions.correctAnswerIndex');
    res.json(assessments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single assessment by ID
exports.getAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Remove correct answers before sending to client
    const responseAssessment = assessment.toObject();
    responseAssessment.questions = responseAssessment.questions.map(question => {
      const { correctAnswerIndex, ...rest } = question;
      return rest;
    });

    res.json(responseAssessment);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get assessment with answers (for admin or results)
exports.getAssessmentWithAnswers = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.json(assessment);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Create assessment
exports.createAssessment = async (req, res) => {
  const { title, description, questions } = req.body;

  try {
    const newAssessment = new Assessment({
      title,
      description,
      questions
    });

    const assessment = await newAssessment.save();
    res.status(201).json(assessment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update assessment
exports.updateAssessment = async (req, res) => {
  const { title, description, questions } = req.body;

  try {
    let assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    assessment.title = title;
    assessment.description = description;
    assessment.questions = questions;

    await assessment.save();
    res.json(assessment);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete assessment
exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    await assessment.deleteOne();
    res.json({ message: 'Assessment removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};