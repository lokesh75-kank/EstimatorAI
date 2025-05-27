import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';

interface EstimateItem {
  category: string;
  item: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface EstimateData {
  items: EstimateItem[];
  subtotal: number;
  markup: number;
  total: number;
}

const EstimateGeneration: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<EstimateData | null>(null);

  const generateEstimate = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement AI estimation logic
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sample data
      setEstimate({
        items: [
          {
            category: 'Fire Detection',
            item: 'Smoke Detector',
            quantity: 24,
            unitCost: 150,
            totalCost: 3600,
          },
          {
            category: 'Fire Alarm',
            item: 'Control Panel',
            quantity: 1,
            unitCost: 2500,
            totalCost: 2500,
          },
        ],
        subtotal: 6100,
        markup: 1220,
        total: 7320,
      });
    } catch (err) {
      setError('Error generating estimate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Generate Estimate
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={generateEstimate}
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Generate Estimate'}
      </Button>

      {estimate && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Item</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Unit Cost</TableCell>
                <TableCell align="right">Total Cost</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estimate.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.item}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">${item.unitCost}</TableCell>
                  <TableCell align="right">${item.totalCost}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} align="right">
                  <strong>Subtotal:</strong>
                </TableCell>
                <TableCell align="right">${estimate.subtotal}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} align="right">
                  <strong>Markup (20%):</strong>
                </TableCell>
                <TableCell align="right">${estimate.markup}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} align="right">
                  <strong>Total:</strong>
                </TableCell>
                <TableCell align="right">${estimate.total}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default EstimateGeneration; 