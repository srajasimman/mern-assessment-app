import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import { getAssessmentWithAnswers, updateAssessment } from '../../services/api';
import { Assessment, Question } from '../../types';

const EditAssessment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch assessment data on component mount
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        if (id) {
          const assessment = await getAssessmentWithAnswers(id);
          setTitle(assessment.title);
          setDescription(assessment.description);
          setQuestions(assessment.questions);
        }
      } catch (err) {
        console.error('Failed to fetch assessment:', err);
        setError('Failed to load assessment. It may have been deleted or you have insufficient permissions.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

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
    
    setSaving(true);
    
    try {
      if (id) {
        const assessmentData: Assessment = {
          _id: id,
          title,
          description,
          questions
        };
        
        await updateAssessment(id, assessmentData);
        navigate('/admin', { state: { success: 'Assessment updated successfully!' } });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update assessment. Please try again.');
      setSaving(false);
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
          <Typography color="text.primary">Edit Assessment</Typography>
        </Breadcrumbs>
        
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Edit Assessment
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Assessment Details */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <TextField
                  label="Assessment Title"
                  variant="outlined"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Box>
              
              <Box>
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
            </Box>
            
            {/* Questions Section */}
            <Box sx={{ mt: 4, mb: 2 }}>
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
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                      <TextField
                        label="Question Text"
                        variant="outlined"
                        fullWidth
                        value={question.text}
                        onChange={(e) => handleQuestionTextChange(questionIndex, e.target.value)}
                        required
                      />
                    </Box>
                    
                    {/* Options */}
                    {question.options.map((option, optionIndex) => (
                      <Box key={optionIndex} sx={{ display: 'flex', alignItems: 'center' }}>
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
                    
                    <Box>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => handleAddOption(questionIndex)}
                        variant="outlined"
                      >
                        Add Option
                      </Button>
                    </Box>
                    
                    <Box>
                      <FormControl fullWidth required>
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
                        <FormHelperText>Select the correct answer for this question</FormHelperText>
                      </FormControl>
                    </Box>
                  </Box>
                </Paper>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddQuestion}
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Add Another Question
              </Button>
            </Box>
            
            {/* Submit Button */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                component={RouterLink}
                to="/admin"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Paper>
        
        {/* Error notification */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default EditAssessment;