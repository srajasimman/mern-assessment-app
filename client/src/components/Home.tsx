import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid,
  Paper,
  Container
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Home = () => {
  return (
    <Box sx={{ mt: 4 }}>
      <Container>
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center', mb: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Assessment Platform
          </Typography>
          <Typography variant="h5" color="textSecondary" paragraph>
            Create, manage, and take assessments with ease
          </Typography>
        </Paper>

        <Grid container spacing={4} justifyContent="center">
          {/* Admin Card */}
          <Grid sx={{ gridColumn: 'span 12', '@media (min-width: 900px)': { gridColumn: 'span 6' } }}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                <AdminPanelSettingsIcon sx={{ fontSize: 60, mb: 2, color: 'primary.main' }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Assessment Admin
                </Typography>
                <Typography variant="body1" paragraph>
                  Create and manage assessments with multiple-choice questions.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large" 
                  component={RouterLink} 
                  to="/admin"
                >
                  Go to Admin Dashboard
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Responder Card */}
          <Grid sx={{ gridColumn: 'span 12', '@media (min-width: 900px)': { gridColumn: 'span 6' } }}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                <AssessmentIcon sx={{ fontSize: 60, mb: 2, color: 'secondary.main' }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Take Assessment
                </Typography>
                <Typography variant="body1" paragraph>
                  Access assessments via a provided URL and view your results upon completion.
                </Typography>
                <Typography variant="body2" color="textSecondary" mb={2}>
                  You'll need a specific assessment URL to proceed.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;