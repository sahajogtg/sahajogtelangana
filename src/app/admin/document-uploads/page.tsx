'use client';

import { useState, useEffect } from 'react';
import { MdUpload, MdCheckCircle, MdPending, MdVisibility } from 'react-icons/md';
import axios from 'axios';
import EmptyState from '@/components/EmptyState';

type DocumentUpload = {
  _id: string;
  fileName: string;
  fileData: string;
  fileType: 'image' | 'csv' | 'pdf';
  uploadedByName: string;
  uploadedByEmail: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const FILE_TYPE_ICONS: Record<string, string> = {
  image: '🖼️',
  pdf: '📄',
  csv: '📊',
};

export default function DocumentUploadsPage() {
  const [uploads, setUploads] = useState<DocumentUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUpload, setSelectedUpload] = useState<DocumentUpload | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/auth/admin/document-uploads');
      if (res.data.data) {
        setUploads(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch uploads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'completed' | 'failed') => {
    try {
      setUpdatingId(id);
      await axios.patch(`/api/auth/admin/document-uploads/${id}`, { status });
      setUploads((prev) =>
        prev.map((u) => (u._id === id ? { ...u, status } : u))
      );
      if (selectedUpload?._id === id) {
        setSelectedUpload((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="admin-card p-6 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Document Uploads
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--ink)] md:text-4xl">
              Review seeker registration documents
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)] md:text-base">
              Documents uploaded by volunteers through the mobile app. Review and process seeker registrations.
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="admin-card p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-[color:var(--muted)]">Loading uploads...</p>
        </section>
      ) : uploads.length === 0 ? (
        <EmptyState
          icon={<MdUpload size={48} />}
          title="No document uploads"
          description="Documents uploaded through the mobile app will appear here."
        />
      ) : (
        <section className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[color:var(--border)]">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                    File
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                    Uploaded By
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {uploads.map((upload) => (
                  <tr key={upload._id} className="hover:bg-[color:var(--surface-2)]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{FILE_TYPE_ICONS[upload.fileType] || '📁'}</span>
                        <div>
                          <p className="text-sm font-medium text-[color:var(--ink)]">{upload.fileName}</p>
                          <p className="text-xs text-[color:var(--muted)] capitalize">{upload.fileType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[color:var(--ink)]">{upload.uploadedByName || 'Unknown'}</p>
                      <p className="text-xs text-[color:var(--muted)]">{upload.uploadedByEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[color:var(--ink)]">
                        {new Date(upload.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-[color:var(--muted)]">
                        {new Date(upload.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[upload.status]}`}>
                        {upload.status === 'pending' && <MdPending size={14} className="mr-1" />}
                        {upload.status === 'completed' && <MdCheckCircle size={14} className="mr-1" />}
                        {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedUpload(upload)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs font-medium text-[color:var(--ink)] transition-colors hover:bg-[color:var(--surface-2)]"
                        >
                          <MdVisibility size={14} /> View
                        </button>
                        {upload.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(upload._id, 'completed')}
                              disabled={updatingId === upload._id}
                              className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                            >
                              <MdCheckCircle size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(upload._id, 'failed')}
                              disabled={updatingId === upload._id}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* View Modal */}
      {selectedUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedUpload(null)}>
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[color:var(--surface)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[color:var(--ink)]">{selectedUpload.fileName}</h2>
              <button onClick={() => setSelectedUpload(null)} className="text-[color:var(--muted)] hover:text-[color:var(--ink)]">
                ✕
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[color:var(--muted)]">Uploaded by</p>
                <p className="font-medium text-[color:var(--ink)]">{selectedUpload.uploadedByName || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-[color:var(--muted)]">Email</p>
                <p className="font-medium text-[color:var(--ink)]">{selectedUpload.uploadedByEmail}</p>
              </div>
              <div>
                <p className="text-[color:var(--muted)]">File type</p>
                <p className="font-medium text-[color:var(--ink)] capitalize">{selectedUpload.fileType}</p>
              </div>
              <div>
                <p className="text-[color:var(--muted)]">Date</p>
                <p className="font-medium text-[color:var(--ink)]">
                  {new Date(selectedUpload.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-sm text-[color:var(--muted)]">Document Preview</p>
              {selectedUpload.fileType === 'image' ? (
                <img
                  src={selectedUpload.fileData}
                  alt={selectedUpload.fileName}
                  className="max-h-[500px] w-full rounded-lg border border-[color:var(--border)] object-contain"
                />
              ) : selectedUpload.fileType === 'pdf' ? (
                <iframe
                  src={selectedUpload.fileData}
                  className="h-[500px] w-full rounded-lg border border-[color:var(--border)]"
                  title="PDF Preview"
                />
              ) : (
                <pre className="max-h-[300px] overflow-auto rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4 text-sm">
                  CSV data available for download
                </pre>
              )}
            </div>

            {selectedUpload.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusUpdate(selectedUpload._id, 'completed')}
                  disabled={updatingId === selectedUpload._id}
                  className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  Approve & Process
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedUpload._id, 'failed')}
                  disabled={updatingId === selectedUpload._id}
                  className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
