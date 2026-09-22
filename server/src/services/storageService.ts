import fs from 'fs';
import path from 'path';

export interface StorageResult {
  url: string;
  provider: 'local' | 's3' | 'cloudinary';
  filename: string;
}

export interface IStorageService {
  uploadFile(base64Data: string, filename: string): Promise<StorageResult>;
  deleteFile(fileUrl: string): Promise<boolean>;
}

class LocalStorageService implements IStorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      try {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      } catch (err) {
        console.warn('Could not create upload directory:', err);
      }
    }
  }

  async uploadFile(base64Data: string, filename: string): Promise<StorageResult> {
    // Check if it is a data URL (e.g., data:image/png;base64,...)
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const ext = filename.split('.').pop() || 'png';
    const safeName = `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

    if (matches && matches.length === 3) {
      const buffer = Buffer.from(matches[2], 'base64');
      const filePath = path.join(this.uploadDir, safeName);
      try {
        fs.writeFileSync(filePath, buffer);
        return {
          url: `/uploads/${safeName}`,
          provider: 'local',
          filename: safeName,
        };
      } catch (err) {
        console.warn('Failed to write file to disk, returning data URL directly:', err);
        return {
          url: base64Data,
          provider: 'local',
          filename: safeName,
        };
      }
    }

    return {
      url: base64Data,
      provider: 'local',
      filename: safeName,
    };
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    if (!fileUrl.startsWith('/uploads/')) return false;
    const filename = path.basename(fileUrl);
    const filePath = path.join(this.uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }
}

export const storageService = new LocalStorageService();
