import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Tooltip,
  CircularProgress,
  Breadcrumbs,
  Link,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getAssessment, getResponsesByAssessment, deleteResponse } from '../../services/api';
import { Assessment, Response } from '../../types';

const ViewAssessmentResults = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [responseToDelete, setResponseToDelete] = useState<Response | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        setLoading(true);
        // Fetch the assessment details
        const assessmentData = await getAssessment(id);
        setAssessment(assessmentData);

        // Fetch all responses for this assessment
        const responsesData = await getResponsesByAssessment(id);
        setResponses(responsesData);

        setLoading(false);
      } catch (err) {
        setError('Failed to load assessment results');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  // Navigate to detailed result page instead of showing dialog
  const handleViewDetails = (response: Response) => {
    navigate(`/result/${response._id}`);
  };

  const handleOpenDeleteDialog = (response: Response) => {
    setResponseToDelete(response);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setResponseToDelete(null);
  };

  const handleDeleteResponse = async () => {
    if (!responseToDelete || !responseToDelete._id) return;
    try {
      setDeleteLoading(true);
      await deleteResponse(responseToDelete._id);
      setResponses(responses.filter(r => r._id !== responseToDelete._id));
      setDeleteDialogOpen(false);
      setResponseToDelete(null);
      setDeleteLoading(false);
    } catch (err) {
      console.error('Failed to delete response', err);
      setDeleteLoading(false);
    }
  };

  const calculateAverageScore = (): string => {
    if (responses.length === 0) return "0";
    const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
    return (totalScore / responses.length).toFixed(2);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const exportToCSV = () => {
    if (!assessment || !responses.length) return;

    const headers = ['Name', 'Email', 'Score', 'Submission Date'];
    const csvContent = [
      headers.join(','),
      ...responses.map(r =>
        `"${r.name || 'N/A'}","${r.email || 'N/A'}",${r.score},${formatDate(r.submittedAt)}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${assessment.title}-results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDeleteDialog = () => {
    if (!responseToDelete) return null;

    return (
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to delete the response submitted by{' '}
            <strong>{responseToDelete.name || 'Anonymous'}</strong> ({responseToDelete.email || 'No email'})?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteResponse}
            color="error"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!assessment) {
    return <Typography>Assessment not found</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        <Link component={RouterLink} to="/admin" underline="hover">
          Admin Dashboard
        </Link>
        <Typography color="text.primary">Results for {assessment.title}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          onClick={() => navigate('/admin')}
        >
          Back to Dashboard
        </Button>

        <Button
          startIcon={<DownloadIcon />}
          variant="contained"
          color="secondary"
          onClick={exportToCSV}
          disabled={responses.length === 0}
        >
          Export Results (CSV)
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        Results: {assessment.title}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Responses</Typography>
            <Typography variant="h3">{responses.length}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Average Score</Typography>
            <Typography variant="h3">{calculateAverageScore()}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Questions</Typography>
            <Typography variant="h3">{assessment.questions.length}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Passing Rate</Typography>
            <Typography variant="h3">
              {responses.length > 0
                ? `${(responses.filter(r => r.score > assessment.questions.length / 2).length / responses.length * 100).toFixed(1)}%`
                : '0%'
              }
            </Typography>
          </Paper>
        </Box>
      </Box>

      {responses.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No responses yet</Typography>
          <Typography variant="body1" color="textSecondary">
            There are no submitted responses for this assessment yet.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Percent</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {responses.map((response) => (
                <TableRow key={response._id}>
                  <TableCell>{response.name || 'N/A'}</TableCell>
                  <TableCell>{response.email || 'N/A'}</TableCell>
                  <TableCell>{response.score} / {assessment.questions.length}</TableCell>
                  <TableCell>
                    {((response.score / assessment.questions.length) * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={response.score > assessment.questions.length / 2 ? 'Passed' : 'Failed'}
                      color={response.score > assessment.questions.length / 2 ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(response.submittedAt)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewDetails(response)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Response">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(response)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {renderDeleteDialog()}
    </Box>
  );
};

export default ViewAssessmentResults;