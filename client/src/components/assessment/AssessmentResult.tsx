import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Breadcrumbs,
  Link,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HomeIcon from '@mui/icons-material/Home';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getResponse } from '../../services/api';

interface ResultData {
  response: {
    _id: string;
    assessmentId: string;
    answers: number[];
    score: number;
    submittedAt: string;
    name?: string;
    email?: string;
  };
  assessment: {
    title: string;
    description: string;
    questions: {
      text: string;
      options: string[];
      correctAnswerIndex: number;
    }[];
  };
}

const AssessmentResult = () => {
  const { id } = useParams<{ id: string }>();
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch result data on component mount
  useEffect(() => {
    const fetchResultData = async () => {
      try {
        if (id) {
          const data = await getResponse(id);
          setResultData(data);
        }
      } catch (err) {
        console.error('Failed to fetch result:', err);
        setError('Failed to load result data. It may have been deleted or expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchResultData();
  }, [id]);

  // Error message close handler
  const handleCloseError = () => {
    setError('');
  };

  // Share result handler
  const handleShareResult = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setError('Result link copied to clipboard!');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!resultData) {
    return (
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Result not found
          </Typography>
          <Button component={RouterLink} to="/" sx={{ mt: 2 }}>
            Return to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  const { response, assessment } = resultData;
  const percentage = Math.round((response.score / assessment.questions.length) * 100);
  const passed = percentage >= 70; // Assuming 70% is passing score

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
        <Typography color="text.primary">Assessment Result</Typography>
      </Breadcrumbs>

      {/* Result Summary */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {assessment.title}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {assessment.description}
        </Typography>

        {/* Display Name and Email */}
        {response.name && (
          <Typography variant="h5" color="text.primary">
            Name: {response.name}
          </Typography>
        )}
        {response.email && (
          <Typography variant="body2" color="text.secondary">
            Email: {response.email}
          </Typography>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 3,
          my: 4,
          p: 3,
          bgcolor: 'background.default',
          borderRadius: 2
        }}>
          <Box sx={{ 
            position: 'relative', 
            display: 'inline-flex', 
            width: 200, 
            height: 200 
          }}>
            <Box sx={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              flexDirection: 'column'
            }}>
              <Typography variant="h3" component="div" color={passed ? 'success.main' : 'error.main'}>
                {percentage}%
              </Typography>
              <Typography variant="body2" component="div" color="text.secondary">
                Score
              </Typography>
            </Box>
            <EmojiEventsIcon 
              sx={{ 
                position: 'absolute',
                right: 0,
                top: 0,
                color: passed ? 'success.main' : 'text.disabled',
                width: 40,
                height: 40
              }} 
            />
          </Box>
          
          <Box>
            <Typography variant="h6">
              {passed ? 'Congratulations!' : 'Better luck next time!'}
            </Typography>
            <Typography variant="body1">
              You scored {response.score} out of {assessment.questions.length} questions correctly.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed on {new Date(response.submittedAt).toLocaleString()}
            </Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }}
              onClick={handleShareResult}
            >
              Share Result
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Detailed Results */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom mb={3}>
          Detailed Results
        </Typography>
        
        <List>
          {assessment.questions.map((question, index) => {
            const userAnswer = response.answers[index];
            const isCorrect = userAnswer === question.correctAnswerIndex;
            
            return (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', py: 2 }}>
                  <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {isCorrect ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <CancelIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="subtitle1">Question {index + 1}</Typography>}
                      secondary={<ReactMarkdown remarkPlugins={[remarkGfm]}>{question.text}</ReactMarkdown>}
                    />
                  </Box>
                  
                  <Grid container spacing={2} sx={{ pl: 4, mt: 1 }}>
                    {question.options.map((option, optionIndex) => (
                      <Grid sx={{ xs: 12 }} key={optionIndex}>
                        <Paper 
                          sx={{ 
                            p: 1, 
                            bgcolor: 
                              optionIndex === question.correctAnswerIndex ? 'success.light' :
                              (optionIndex === userAnswer && !isCorrect ? 'error.light' : 'background.paper')
                          }}
                        >
                          <Typography variant="body2">
                            {optionIndex === question.correctAnswerIndex && 
                              '✓ '}{optionIndex === userAnswer && !isCorrect && '✗ '}
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{option}</ReactMarkdown>
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </ListItem>
                {index < assessment.questions.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            component={RouterLink}
            to="/"
          >
            Return Home
          </Button>
        </Box>
      </Paper>
      
      {/* Error/Success notification */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert 
          onClose={handleCloseError} 
          severity={error.includes('copied') ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssessmentResult;