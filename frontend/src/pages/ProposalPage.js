import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Download,
  Print,
  Share,
  ArrowBack,
} from '@mui/icons-material';

function ProposalPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proposal, setProposal] = useState(null);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!location.state?.estimate) {
        navigate('/estimate');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/proposal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(location.state.estimate),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to generate proposal');
        }

        const data = await response.json();
        setProposal(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [location.state, navigate]);

  const handleDownload = () => {
    // TODO: Implement PDF download functionality
    console.log('Download proposal as PDF');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    // TODO: Implement sharing functionality
    console.log('Share proposal');
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!proposal) {
    return null;
  }

  const { estimate } = proposal;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/estimate')}
          sx={{ mb: 2 }}
        >
          Back to Estimate
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {estimate.project_name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Client: {estimate.client_name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Proposal Date: {new Date().toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownload}
            >
              Download
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={handlePrint}
            >
              Print
            </Button>
            <Button
              variant="outlined"
              startIcon={<Share />}
              onClick={handleShare}
            >
              Share
            </Button>
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Executive Summary
            </Typography>
            <Typography variant="body1" paragraph>
              {proposal.executive_summary}
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Scope of Work
            </Typography>
            <Typography variant="body1" paragraph>
              {proposal.scope_of_work}
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Cost Breakdown
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Materials</TableCell>
                    <TableCell align="right">
                      ${estimate.cost_breakdown.materials.reduce((sum, m) => sum + m.total_cost, 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Labor</TableCell>
                    <TableCell align="right">
                      ${estimate.cost_breakdown.labor.reduce((sum, l) => sum + l.total_cost, 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Equipment</TableCell>
                    <TableCell align="right">
                      ${estimate.cost_breakdown.equipment.reduce((sum, e) => sum + e.total_cost, 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Subcontractors</TableCell>
                    <TableCell align="right">
                      ${estimate.cost_breakdown.subcontractors.reduce((sum, s) => sum + s.cost, 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Contingency</TableCell>
                    <TableCell align="right">
                      ${estimate.cost_breakdown.contingency_amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tax</TableCell>
                    <TableCell align="right">
                      ${estimate.cost_breakdown.tax_amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Total</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>
                        ${estimate.cost_breakdown.grand_total.toLocaleString()}
                      </strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Project Details
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1">
                  {estimate.location.city}, {estimate.location.state_province}
                  <br />
                  {estimate.location.country} {estimate.location.postal_code}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Systems
                </Typography>
                <List dense>
                  {estimate.systems.map((system, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={system.system_type.replace('_', ' ').toUpperCase()}
                        secondary={`${system.manufacturer} ${system.model}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Compliance Codes
                </Typography>
                <List dense>
                  {estimate.compliance_codes.map((code, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={code} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Value Engineering Suggestions
        </Typography>
        <Grid container spacing={2}>
          {estimate.value_engineering_suggestions.map((suggestion, index) => (
            <Grid item xs={12} key={index}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {suggestion}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Risk Factors
        </Typography>
        <Grid container spacing={2}>
          {estimate.risk_factors.map((risk, index) => (
            <Grid item xs={12} key={index}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {risk}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Terms and Conditions
        </Typography>
        <Typography variant="body2" paragraph>
          {proposal.terms_and_conditions}
        </Typography>

        <Typography variant="h6" gutterBottom>
          Payment Schedule
        </Typography>
        <Typography variant="body2" paragraph>
          {proposal.payment_schedule}
        </Typography>

        <Typography variant="h6" gutterBottom>
          Project Timeline
        </Typography>
        <Typography variant="body2" paragraph>
          {proposal.timeline}
        </Typography>
      </Paper>
    </Container>
  );
}

export default ProposalPage; 