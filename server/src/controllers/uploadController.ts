import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { storageService } from '../services/storageService.ts';

export async function uploadReceipt(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { fileData, filename } = req.body;

    if (!fileData) {
      res.status(400).json({ success: false, message: 'File data is required' });
      return;
    }

    const safeFilename = filename || `receipt_${Date.now()}.png`;
    const result = await storageService.uploadFile(fileData, safeFilename);

    res.json({
      success: true,
      data: {
        url: result.url,
        filename: result.filename,
        provider: result.provider,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload receipt',
      error: error.message,
    });
  }
}
