import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface ComplianceIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  code: string;
  location?: string;
}

interface AnalysisResult {
  status: 'success' | 'error' | 'warning';
  issues: ComplianceIssue[];
  recommendations: string[];
}

const AIAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const analyzeDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement AI analysis logic
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sample data
      setAnalysisResult({
        status: 'warning',
        issues: [
          {
            type: 'warning',
            message: 'Missing strobe in stairwell',
            code: 'NFPA 72-10.4.4',
            location: 'Floor 2, Stairwell B',
          },
          {
            type: 'error',
            message: 'Insufficient coverage in storage area',
            code: 'NFPA 72-17.7.3',
            location: 'Basement, Storage Room',
          },
        ],
        recommendations: [
          'Add strobe notification appliance in Stairwell B',
          'Install additional smoke detectors in storage area',
          'Consider upgrading to addressable system for better zone control',
        ],
      });
    } catch (err) {
      setError('Error analyzing documents');
    } finally {
      setLoading(false);
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <CheckCircleIcon color="success" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        AI Document Analysis
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={analyzeDocuments}
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Analyze Documents'}
      </Button>

      {analysisResult && (
        <>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Compliance Issues
            </Typography>
            <List>
              {analysisResult.issues.map((issue, index) => (
                <ListItem key={index}>
                  <ListItemIcon>{getIssueIcon(issue.type)}</ListItemIcon>
                  <ListItemText
                    primary={issue.message}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.secondary">
                          {issue.code}
                        </Typography>
                        {issue.location && (
                          <Chip
                            label={issue.location}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recommendations
            </Typography>
            <List>
              {analysisResult.recommendations.map((recommendation, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={recommendation} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default AIAnalysis; 