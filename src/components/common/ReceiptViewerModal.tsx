import React, { useState } from 'react';
import { Modal } from './Modal.tsx';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client.ts';

interface ReceiptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl?: string;
  expenseTitle: string;
  onReceiptUploaded?: (url: string) => void;
  canUpload?: boolean;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  isOpen,
  onClose,
  receiptUrl,
  expenseTitle,
  onReceiptUploaded,
  canUpload = false,
}) => {
  const [currentUrl, setCurrentUrl] = useState<string | undefined>(receiptUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess(false);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await api.uploads.uploadReceipt(base64Data, file.name);
        if (res.data?.url) {
          setCurrentUrl(res.data.url);
          setUploadSuccess(true);
          if (onReceiptUploaded) {
            onReceiptUploaded(res.data.url);
          }
        }
      } catch (err) {
        console.error('Upload failed:', err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Receipt: ${expenseTitle}`} maxWidth="2xl">
      <div className="space-y-4">
        {currentUrl ? (
          <div className="bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-2 min-h-[300px] border border-slate-700">
            {currentUrl.startsWith('data:image') || currentUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i) || currentUrl.startsWith('/uploads/') ? (
              <img
                src={currentUrl}
                alt="Receipt Voucher"
                className="max-h-[500px] w-auto max-w-full object-contain rounded"
              />
            ) : (
              <div className="text-center p-8 text-white">
                <FileText className="w-16 h-16 mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-medium">Digital Receipt Document Attached</p>
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-semibold text-white"
                >
                  Open Document Link
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-lg">
            <FileText className="w-12 h-12 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-700">No physical receipt voucher attached yet</p>
            <p className="text-xs text-slate-500 mt-1">Upload a photo or scanned copy of the receipt / UPI payment screenshot.</p>
          </div>
        )}

        {canUpload && (
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>{currentUrl ? 'Replace Receipt' : 'Upload Receipt Voucher'}</span>
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>

            {isUploading && (
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                Processing upload...
              </span>
            )}

            {uploadSuccess && (
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Receipt saved successfully
              </span>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
