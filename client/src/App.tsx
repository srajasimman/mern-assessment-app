import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Container, Box } from '@mui/material';

// Import components
import AdminDashboard from './components/admin/AdminDashboard';
import CreateAssessment from './components/admin/CreateAssessment';
import EditAssessment from './components/admin/EditAssessment';
import ViewAssessmentResults from './components/admin/ViewAssessmentResults';
import TakeAssessment from './components/assessment/TakeAssessment';
import AssessmentResult from './components/assessment/AssessmentResult';
import Home from './components/Home';
import NavBar from './components/layout/NavBar';

function App() {
  // State to track the current theme mode (light/dark)
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  // Theme toggle handler
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Create theme based on current mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#2196f3',
          },
          secondary: {
            main: '#f50057',
          },
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            bgcolor: 'background.default',
          }}
        >
          <NavBar toggleColorMode={toggleColorMode} />
          <Container 
            maxWidth="lg" 
            sx={{ 
              flexGrow: 1,
              py: 3,
            }}
          >
            <Routes>
              {/* Home page */}
              <Route path="/" element={<Home />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/create" element={<CreateAssessment />} />
              <Route path="/admin/edit/:id" element={<EditAssessment />} />
              <Route path="/admin/results/:id" element={<ViewAssessmentResults />} />
              
              {/* Responder routes */}
              <Route path="/assessment/:id" element={<TakeAssessment />} />
              <Route path="/result/:id" element={<AssessmentResult />} />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
