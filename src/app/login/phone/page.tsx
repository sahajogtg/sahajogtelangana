'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function PhoneLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/phone/otp-send', {
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
      const verifyRes = await fetch('/api/auth/phone/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setError(verifyData.error || 'Invalid OTP');
        return;
      }

      const loginRes = await fetch('/api/auth/phone/otp-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name: name || undefined }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        if (loginData.error?.includes('Name is required')) {
          setStep('name');
          return;
        }
        setError(loginData.error || 'Login failed');
        return;
      }

      localStorage.setItem('auth_token', loginData.token);
      localStorage.setItem('user_session', JSON.stringify(loginData.user));

      toast.success(`Welcome, ${loginData.user.name}!`);
      router.push('/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const verifyRes = await fetch('/api/auth/phone/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        setError(data.error || 'Verification failed');
        return;
      }

      const loginRes = await fetch('/api/auth/phone/otp-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        setError(loginData.error || 'Registration failed');
        return;
      }

      localStorage.setItem('auth_token', loginData.token);
      localStorage.setItem('user_session', JSON.stringify(loginData.user));

      toast.success(`Welcome, ${loginData.user.name}!`);
      router.push('/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--bg)] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[color:var(--ink)]">Phone Login</h1>
          <p className="text-[color:var(--muted)] mt-2">
            {step === 'phone' && 'Enter your phone number to receive an OTP'}
            {step === 'otp' && 'Enter the 6-digit code sent to your phone'}
            {step === 'name' && 'Please provide your name to complete registration'}
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
                {loading ? 'Verifying...' : 'Verify & Login'}
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

          {step === 'name' && (
            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[color:var(--ink)] mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="admin-input w-full"
                  required
                  minLength={2}
                />
              </div>

              {error && (
                <p className="text-sm text-[color:var(--danger)]">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || name.length < 2}
                className="btn btn-primary w-full"
              >
                {loading ? 'Completing Registration...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-[color:var(--primary)] hover:underline"
          >
            Back to Email Login
          </Link>
        </div>
      </div>
    </div>
  );
}
