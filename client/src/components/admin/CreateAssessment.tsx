import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Grid,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import { createAssessment } from '../../services/api';
import { Assessment, Question } from '../../types';

const CreateAssessment = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { text: '', options: ['', ''], correctAnswerIndex: 0 }
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Add new question
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { text: '', options: ['', ''], correctAnswerIndex: 0 }
    ]);
  };

  // Delete question
  const handleDeleteQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  // Update question text
  const handleQuestionTextChange = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };

  // Add new option to a question
  const handleAddOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push('');
    setQuestions(newQuestions);
  };

  // Update option text
  const handleOptionChange = (questionIndex: number, optionIndex: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = text;
    setQuestions(newQuestions);
  };

  // Delete option
  const handleDeleteOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    
    // Adjust correctAnswerIndex if needed
    if (newQuestions[questionIndex].correctAnswerIndex >= newQuestions[questionIndex].options.length) {
      newQuestions[questionIndex].correctAnswerIndex = 0;
    }
    
    setQuestions(newQuestions);
  };

  // Handle correct answer change
  const handleCorrectAnswerChange = (questionIndex: number, value: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswerIndex = value;
    setQuestions(newQuestions);
  };

  // Validate form
  const validateForm = () => {
    if (title.trim() === '') {
      setError('Title is required');
      return false;
    }
    
    if (description.trim() === '') {
      setError('Description is required');
      return false;
    }
    
    if (questions.length === 0) {
      setError('At least one question is required');
      return false;
    }
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      if (q.text.trim() === '') {
        setError(`Question ${i + 1} text is required`);
        return false;
      }
      
      if (q.options.length < 2) {
        setError(`Question ${i + 1} must have at least 2 options`);
        return false;
      }
      
      for (let j = 0; j < q.options.length; j++) {
        if (q.options[j].trim() === '') {
          setError(`Option ${j + 1} for Question ${i + 1} is required`);
          return false;
        }
      }
    }
    
    return true;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const assessmentData: Assessment = {
        title,
        description,
        questions
      };
      
      await createAssessment(assessmentData);
      navigate('/admin', { state: { success: 'Assessment created successfully!' } });
    } catch (err) {
      console.error(err);
      setError('Failed to create assessment. Please try again.');
      setLoading(false);
    }
  };

  // Error message close handler
  const handleCloseError = () => {
    setError('');
  };

  return (
    <Container maxWidth="lg">
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
          <Link
            underline="hover"
            color="inherit"
            component={RouterLink}
            to="/admin"
          >
            Admin Dashboard
          </Link>
          <Typography color="text.primary">Create Assessment</Typography>
        </Breadcrumbs>
        
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create New Assessment
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            {/* Assessment Details */}
            <Box sx={{ mb: 4 }}>
              <TextField
                label="Assessment Title"
                variant="outlined"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                sx={{ mb: 3 }}
              />
              
              <TextField
                label="Assessment Description"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Box>
            
            {/* Questions Section */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" gutterBottom>
                Questions
              </Typography>
              
              {questions.map((question, questionIndex) => (
                <Paper
                  key={questionIndex}
                  elevation={2}
                  sx={{ p: 3, mb: 3, position: 'relative', bgcolor: 'background.default' }}
                >
                  <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteQuestion(questionIndex)}
                      disabled={questions.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="h6" gutterBottom>
                    Question {questionIndex + 1}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <TextField
                      label="Question Text"
                      variant="outlined"
                      fullWidth
                      value={question.text}
                      onChange={(e) => handleQuestionTextChange(questionIndex, e.target.value)}
                      required
                      sx={{ mb: 3 }}
                    />
                    
                    {/* Options */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
                        Options:
                      </Typography>
                      
                      {question.options.map((option, optionIndex) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }} key={optionIndex}>
                          <TextField
                            label={`Option ${optionIndex + 1}`}
                            variant="outlined"
                            fullWidth
                            value={option}
                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                            required
                          />
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteOption(questionIndex, optionIndex)}
                            disabled={question.options.length <= 2}
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ))}
                      
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => handleAddOption(questionIndex)}
                        variant="outlined"
                        sx={{ alignSelf: 'flex-start', mt: 1, mb: 3 }}
                      >
                        Add Option
                      </Button>
                      
                      <FormControl required sx={{ width: '100%', maxWidth: '400px' }}>
                        <InputLabel>Correct Answer</InputLabel>
                        <Select
                          value={question.correctAnswerIndex}
                          label="Correct Answer"
                          onChange={(e) => handleCorrectAnswerChange(questionIndex, Number(e.target.value))}
                        >
                          {question.options.map((option, optionIndex) => (
                            <MenuItem key={optionIndex} value={optionIndex}>
                              Option {optionIndex + 1}: {option.substring(0, 30)}{option.length > 30 ? '...' : ''}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>Select the correct answer option</FormHelperText>
                      </FormControl>
                    </Box>
                  </Box>
                </Paper>
              ))}
              
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddQuestion}
                sx={{ mb: 3 }}
              >
                Add Question
              </Button>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                >
                  Create Assessment
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
        
        {/* Error Snackbar */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default CreateAssessment;