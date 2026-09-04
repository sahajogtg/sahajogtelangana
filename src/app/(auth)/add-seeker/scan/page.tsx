'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FiCamera, FiUpload, FiCheck, FiAlertCircle, FiFileText } from 'react-icons/fi';
import YogiDashboardShell from '@/components/YogiDashboardShell';

export default function ScanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'image' | 'pdf' | 'csv'>('image');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 text-center text-sm text-[color:var(--muted)]">Loading...</div>
    );
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, captureMode?: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const uri = ev.target?.result as string;
      setImagePreview(captureMode ? uri : null);
      setFileData(uri);
      setFileName(file.name);

      if (file.name.toLowerCase().endsWith('.csv')) {
        setFileType('csv');
      } else if (file.name.toLowerCase().endsWith('.pdf')) {
        setFileType('pdf');
      } else {
        setFileType('image');
      }
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmitUpload = async () => {
    if (!fileData) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/document-uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileData,
          fileType,
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setMessageType('success');
        setMessage(data.message || 'Document uploaded successfully. Seekers will be added within 24 hours.');
        setImagePreview(null);
        setFileData(null);
        setFileName('');
      } else {
        setMessageType('error');
        setMessage(data?.error || 'Failed to upload document.');
      }
    } catch {
      setMessageType('error');
      setMessage('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setFileData(null);
    setFileName('');
    setMessage('');
  };

  const userRole = session?.user?.role as string | undefined;

  return (
    <YogiDashboardShell memberName={session?.user?.name || undefined} userRole={userRole} activeKey="add-seeker">
      <main>
        <section className="relative overflow-hidden py-8 md:py-12">
          <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
            <div className="rounded-[32px] border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_88%,transparent)] p-6 shadow-soft md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--primary)_10%,transparent)]">
                  <FiCamera className="text-[color:var(--primary)]" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-[color:var(--ink)]">Upload Registration Document</h1>
                  <p className="text-sm text-[color:var(--muted)] mt-1">
                    Upload a photo or document of a physical registration list. Our team will process it and add the seekers within 24 hours.
                  </p>
                </div>
              </div>

              {message && (
                <div
                  className={`mb-6 flex items-start gap-3 rounded-[20px] border px-4 py-3 text-sm ${
                    messageType === 'success'
                      ? 'border-[color:color-mix(in_srgb,var(--success)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--success)_10%,transparent)] text-[color:var(--success)]'
                      : 'border-[color:color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--danger)_10%,transparent)] text-[color:var(--danger)]'
                  }`}
                >
                  {messageType === 'success' ? (
                    <FiCheck className="mt-0.5 h-5 w-5 shrink-0" />
                  ) : (
                    <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  )}
                  <p>{message}</p>
                </div>
              )}

              {/* Upload Options */}
              {!fileData && !isSubmitting && (
                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-[color:var(--border)] p-10 transition-colors hover:border-[color:color-mix(in_srgb,var(--primary)_40%,transparent)]"
                  >
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleFile(e, true)}
                      className="hidden"
                    />
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--primary)_10%,transparent)]">
                      <FiCamera className="text-[color:var(--primary)]" size={28} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-[color:var(--ink)]">Open Camera</p>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">Capture a registration list page</p>
                    </div>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-[color:var(--border)] p-10 transition-colors hover:border-[color:color-mix(in_srgb,var(--primary)_40%,transparent)]"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.csv,.pdf"
                      onChange={(e) => handleFile(e, false)}
                      className="hidden"
                    />
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--primary)_10%,transparent)]">
                      <FiUpload className="text-[color:var(--primary)]" size={28} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-[color:var(--ink)]">Upload File</p>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">Image, PDF, or CSV from your device</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-[color:var(--border)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Uploaded document" className="w-full max-h-80 object-contain bg-black/5" />
                </div>
              )}

              {/* File Info (non-image) */}
              {!imagePreview && fileData && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4">
                  <FiFileText className="h-8 w-8 text-[color:var(--primary)]" />
                  <div>
                    <p className="font-medium text-[color:var(--ink)]">{fileName}</p>
                    <p className="text-sm text-[color:var(--muted)]">Ready to upload</p>
                  </div>
                </div>
              )}

              {/* Submit / Reset Buttons */}
              {fileData && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSubmitUpload}
                    disabled={isSubmitting}
                    className="admin-btn-primary inline-flex items-center gap-2 px-8 py-3 disabled:opacity-60"
                  >
                    {isSubmitting ? 'Uploading...' : 'Submit for Processing'}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className="rounded-full border border-[color:var(--border)] px-6 py-3 text-sm font-semibold text-[color:var(--muted)] transition-colors hover:bg-[color:var(--surface-2)] disabled:opacity-60"
                  >
                    Choose Different File
                  </button>
                </div>
              )}

              {/* Info Note */}
              <div className="mt-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-5">
                <p className="text-sm font-semibold text-[color:var(--ink)]">How it works</p>
                <ol className="mt-2 space-y-1 text-sm text-[color:var(--muted)] list-decimal list-inside">
                  <li>Take a photo or upload a document containing seeker details</li>
                  <li>Our team will review and extract the information</li>
                  <li>Seekers will be added to the system within 24 hours</li>
                  <li>You will be notified once the seekers are added</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      </main>
    </YogiDashboardShell>
  );
}
