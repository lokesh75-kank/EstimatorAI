import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const ProposalBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Proposal Builder</Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => console.log('Save proposal')}
        >
          Save Proposal
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Summary
              </Typography>
              <Typography variant="body1">
                Project ID: {id}
              </Typography>
              <Typography variant="body1">
                Status: Draft
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cost Breakdown
              </Typography>
              <Typography variant="body1">
                No costs calculated yet.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProposalBuilder; 