import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
  Badge,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Input
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import AssessmentIcon from '@mui/icons-material/Assessment';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { getAssessments, deleteAssessment, getResponsesByAssessment, importAssessment } from '../../services/api';
import { Assessment } from '../../types';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState<number>(0);

  // Extract fetchAssessments function so it can be reused
  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const data = await getAssessments();
      setAssessments(data);

      // Fetch response counts for each assessment
      const counts: Record<string, number> = {};
      for (const assessment of data) {
        try {
          const responses = await getResponsesByAssessment(assessment._id!);
          counts[assessment._id!] = responses.length;
        } catch (err) {
          console.error(`Failed to fetch responses for assessment ${assessment._id}`, err);
          counts[assessment._id!] = 0;
        }
      }
      setResponseCounts(counts);
    } catch (err) {
      setError('Failed to fetch assessments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch assessments on component mount
  useEffect(() => {
    fetchAssessments();
  }, []);

  // Handle assessment deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        await deleteAssessment(id);
        setAssessments(assessments.filter(assessment => assessment._id !== id));
        setSuccess('Assessment deleted successfully');
      } catch (err) {
        setError('Failed to delete assessment');
        console.error(err);
      }
    }
  };

  // Handle file selection for import
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a JSON file
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setError('Only JSON files are supported');
      setImportDialogOpen(false);
      setFileInputKey(prev => prev + 1); // Reset file input
      return;
    }

    setImportLoading(true);

    try {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const jsonContent = JSON.parse(event.target?.result as string);
          const result = await importAssessment(jsonContent);

          if (result.success) {
            setSuccess('Assessment imported successfully');
            fetchAssessments(); // Refresh the list
          } else {
            setError('Failed to import assessment');
          }
        } catch (parseError) {
          setError('Invalid JSON format');
        } finally {
          setImportLoading(false);
          setImportDialogOpen(false);
          setFileInputKey(prev => prev + 1); // Reset file input
        }
      };

      reader.onerror = () => {
        setError('Error reading file');
        setImportLoading(false);
        setImportDialogOpen(false);
        setFileInputKey(prev => prev + 1); // Reset file input
      };

      reader.readAsText(file);
    } catch (err) {
      setError('Error processing file');
      setImportLoading(false);
      setImportDialogOpen(false);
      setFileInputKey(prev => prev + 1); // Reset file input
    }
  };

  // Handle close of success/error message
  const handleClose = () => {
    setError('');
    setSuccess('');
  };

  return (
    <Box sx={{ mt: 4 }}>
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
        <Typography color="text.primary">Admin Dashboard</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Assessments
        </Typography>

        <Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<UploadFileIcon />}
            sx={{ mr: 2 }}
            onClick={() => setImportDialogOpen(true)}
          >
            Import
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/admin/create"
          >
            Create New Assessment
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : assessments.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No assessments found. Create your first assessment to get started.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Questions</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Responses</TableCell>
                <TableCell>Link</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assessments.map((assessment) => (
                <TableRow key={assessment._id}>
                  <TableCell>{assessment.title}</TableCell>
                  <TableCell>{assessment.description.substring(0, 50)}...</TableCell>
                  <TableCell>{assessment.questions.length}</TableCell>
                  <TableCell>
                    {assessment.createdAt && new Date(assessment.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      badgeContent={responseCounts[assessment._id!] || 0}
                      color="primary"
                      sx={{ mr: 2 }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        color="info"
                        startIcon={<AssessmentIcon />}
                        component={RouterLink}
                        to={`/admin/results/${assessment._id}`}
                        disabled={!responseCounts[assessment._id!]}
                      >
                        View Results
                      </Button>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/assessment/${assessment._id}`);
                        setSuccess('Assessment link copied to clipboard');
                      }}
                    >
                      Copy Link
                    </Button>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton
                        component={RouterLink}
                        to={`/admin/edit/${assessment._id}`}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(assessment._id!)}>
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

      {/* Import dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => !importLoading && setImportDialogOpen(false)}
      >
        <DialogTitle>Import Assessment</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select a JSON file to import an assessment. The file should contain a valid assessment structure with title, description, and questions.
          </DialogContentText>
          <Input
            type="file"
            inputProps={{ accept: 'application/json' }}
            onChange={handleFileImport}
            disabled={importLoading}
            key={fileInputKey}
            fullWidth
          />
          {importLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setImportDialogOpen(false)}
            disabled={importLoading}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success notification */}
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Error notification */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;