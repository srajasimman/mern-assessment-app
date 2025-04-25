import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  CircularProgress,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
  Stepper,
  Step,
  StepLabel,
  TextField
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { getAssessment, submitResponse } from '../../services/api';
import { AssessmentForResponder } from '../../types';

const TakeAssessment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<AssessmentForResponder | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [showResponderInfo, setShowResponderInfo] = useState<boolean>(true);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        if (!id) return;
        const data = await getAssessment(id);
        setAssessment(data);
        setAnswers(Array(data.questions.length).fill(-1));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch assessment');
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  const validateResponderInfo = () => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    return isValid;
  };

  const startAssessment = () => {
    if (validateResponderInfo()) {
      setShowResponderInfo(false);
    }
  };

  // Handle answer selection
  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(event.target.value);
    setAnswers(newAnswers);
  };

  // Navigate to next question
  const handleNext = () => {
    if (currentQuestion < (assessment?.questions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Navigate to previous question
  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Submit assessment
  const handleSubmit = async () => {
    if (!id) return;

    // Validate name and email
    let hasError = false;
    if (!name.trim()) {
      setNameError('Name is required.');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!email.trim()) {
      setEmailError('Email is required.');
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Invalid email format.');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (hasError) return;

    // Check if all questions are answered
    const unanswered = answers.findIndex(a => a === -1);
    if (unanswered !== -1) {
      setError(`Please answer question ${unanswered + 1} before submitting.`);
      setCurrentQuestion(unanswered);
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitResponse({
        assessmentId: id,
        answers,
        name,
        email
      });

      // Navigate to results page with the response ID
      navigate(`/result/${result.response._id}`);
    } catch (err) {
      console.error('Failed to submit assessment:', err);
      setError('Failed to submit your answers. Please try again.');
      setSubmitting(false);
    }
  };

  // Error message close handler
  const handleCloseError = () => {
    setError('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!assessment) {
    return (
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Assessment not found
          </Typography>
          <Button component={RouterLink} to="/" sx={{ mt: 2 }}>
            Return to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  const currentQuestionObj = assessment.questions[currentQuestion];

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          underline="hover"
          color="inherit"
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Typography color="text.primary">Take Assessment</Typography>
      </Breadcrumbs>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {assessment.title}
        </Typography>

        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
          {assessment.description}
        </Typography>

        {/* Responder Info */}
        {showResponderInfo ? (
          <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              Your Information
            </Typography>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!nameError}
              helperText={nameError}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!emailError}
              helperText={emailError}
              fullWidth
              sx={{ mb: 3 }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={startAssessment}
              fullWidth
            >
              Start Assessment
            </Button>
          </Paper>
        ) : (
          <>
            {/* Question progress stepper */}
            <Stepper
              activeStep={currentQuestion}
              alternativeLabel
              sx={{ mb: 4, overflowX: 'auto', flexWrap: 'nowrap' }}
            >
              {assessment.questions.map((q, index) => (
                <Step key={index} completed={answers[index] !== -1}>
                  <StepLabel>
                    Question {index + 1}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Current question */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom>
                Question {currentQuestion + 1} of {assessment.questions.length}
              </Typography>

              <Typography variant="body1" paragraph sx={{ fontWeight: 500, mb: 3 }}>
                {currentQuestionObj.text}
              </Typography>

              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={answers[currentQuestion].toString()}
                  onChange={handleAnswerChange}
                >
                  {currentQuestionObj.options.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={index.toString()}
                      control={<Radio />}
                      label={option}
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                        ...(answers[currentQuestion] === index ? { bgcolor: 'action.selected' } : {})
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Paper>

            {/* Navigation buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handlePrev}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              {currentQuestion < assessment.questions.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Assessment'}
                </Button>
              )}
            </Box>
          </>
        )}
      </Paper>

      {/* Error notification */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TakeAssessment;