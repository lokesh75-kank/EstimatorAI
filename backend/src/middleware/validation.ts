import { Request, Response, NextFunction } from 'express';
import { ProjectParams } from '../bom/types';

export function validateProjectParams(req: Request, res: Response, next: NextFunction) {
  const params = req.body as ProjectParams;

  // Validate required fields
  if (!params.floor_area || typeof params.floor_area !== 'number' || params.floor_area <= 0) {
    return res.status(400).json({
      error: 'Invalid floor area',
      details: 'Floor area must be a positive number'
    });
  }

  if (!params.stories || typeof params.stories !== 'number' || params.stories <= 0) {
    return res.status(400).json({
      error: 'Invalid number of stories',
      details: 'Number of stories must be a positive number'
    });
  }

  if (!params.occupancy_type || typeof params.occupancy_type !== 'string') {
    return res.status(400).json({
      error: 'Invalid occupancy type',
      details: 'Occupancy type is required and must be a string'
    });
  }

  // Validate optional fields
  if (params.special_features) {
    if (!Array.isArray(params.special_features)) {
      return res.status(400).json({
        error: 'Invalid special features',
        details: 'Special features must be an array of strings'
      });
    }

    if (!params.special_features.every(feature => typeof feature === 'string')) {
      return res.status(400).json({
        error: 'Invalid special features',
        details: 'All special features must be strings'
      });
    }
  }

  if (params.overrides) {
    if (typeof params.overrides !== 'object') {
      return res.status(400).json({
        error: 'Invalid overrides',
        details: 'Overrides must be an object'
      });
    }

    for (const [itemCode, override] of Object.entries(params.overrides)) {
      if (typeof override.quantity !== 'number' || override.quantity <= 0) {
        return res.status(400).json({
          error: 'Invalid override quantity',
          details: `Quantity for item ${itemCode} must be a positive number`
        });
      }
    }
  }

  if (params.location) {
    if (typeof params.location !== 'object') {
      return res.status(400).json({
        error: 'Invalid location',
        details: 'Location must be an object'
      });
    }

    if (params.location.zip_code && typeof params.location.zip_code !== 'string') {
      return res.status(400).json({
        error: 'Invalid zip code',
        details: 'Zip code must be a string'
      });
    }

    if (params.location.state && typeof params.location.state !== 'string') {
      return res.status(400).json({
        error: 'Invalid state',
        details: 'State must be a string'
      });
    }
  }

  next();
} 