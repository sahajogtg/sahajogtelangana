'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LinkPhonePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp' | 'complete'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/link-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send OTP');
        return;
      }

      setStep('otp');
      toast.success('OTP sent to your phone');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/link-phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed');
        return;
      }

      setStep('complete');
      toast.success('Phone number linked successfully!');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--bg)]">
        <div className="text-[color:var(--muted)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--bg)] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[color:var(--ink)]">Link Phone Number</h1>
          <p className="text-[color:var(--muted)] mt-2">
            {step === 'phone' && 'Add your phone number for easier login and notifications'}
            {step === 'otp' && 'Enter the 6-digit code sent to your phone'}
            {step === 'complete' && 'Your phone number has been linked successfully!'}
          </p>
        </div>

        <div className="bg-[color:var(--surface)] rounded-[var(--radius-lg)] p-8 shadow-card">
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[color:var(--ink)] mb-1">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-[var(--radius-sm)] border border-r-0 border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--muted)] text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="admin-input flex-1 rounded-l-none"
                    required
                    pattern="[0-9+\-\s()]{8,15}"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-[color:var(--danger)]">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="btn btn-primary w-full"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[color:var(--ink)] mb-1">
                  OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="admin-input w-full text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-[color:var(--muted)] mt-1 text-center">
                  Sent to +91 {phone}
                </p>
              </div>

              {error && (
                <p className="text-sm text-[color:var(--danger)]">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn btn-primary w-full"
              >
                {loading ? 'Verifying...' : 'Verify & Link'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                className="btn btn-ghost w-full"
              >
                Change Phone Number
              </button>
            </form>
          )}

          {step === 'complete' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-[color:var(--success)] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[color:var(--ink)]">
                Your phone number <strong>+91 {phone}</strong> has been linked to your account.
              </p>
              <p className="text-sm text-[color:var(--muted)]">
                You can now use your phone number to log in.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="btn btn-primary w-full"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.back()}
            className="text-sm text-[color:var(--primary)] hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
