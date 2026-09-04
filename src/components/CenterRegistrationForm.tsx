'use client';

import { FormEvent, useState } from 'react';

type Props = {
  centerName: string;
  centerId: string;
};

export default function CenterRegistrationForm({ centerName, centerId }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!name.trim() || name.trim().length < 2) {
      setStatus('error');
      setMessage('Please enter your name.');
      return;
    }

    if (!phone.trim() || !/^[0-9+\-\s()]{8,15}$/.test(phone.trim())) {
      setStatus('error');
      setMessage('Please enter a valid phone number.');
      return;
    }

    setStatus('submitting');

    try {
      const res = await fetch('/api/center-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), centerName, centerId }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setStatus('success');
        setMessage(data.message || 'Registration successful!');
        setName('');
        setPhone('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Unable to register right now.');
      }
    } catch {
      setStatus('error');
      setMessage('Unable to register right now. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)] text-[color:var(--success)]">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[color:var(--success)]">{message}</p>
        <button
          type="button"
          onClick={() => { setStatus('idle'); setMessage(''); }}
          className="mt-3 text-xs text-[color:var(--primary)] hover:underline"
        >
          Register another person
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="center-reg-name" className="mb-1.5 block text-sm font-medium text-[color:var(--ink)]">
          Name
        </label>
        <input
          id="center-reg-name"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setMessage(''); }}
          className="admin-input"
          placeholder="Your name"
          required
        />
      </div>
      <div>
        <label htmlFor="center-reg-phone" className="mb-1.5 block text-sm font-medium text-[color:var(--ink)]">
          Phone
        </label>
        <input
          id="center-reg-phone"
          type="tel"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setMessage(''); }}
          className="admin-input"
          placeholder="+91 98765 43210"
          inputMode="tel"
          required
        />
      </div>

      {message && (
        <p className={`text-sm ${status === 'error' ? 'text-[color:var(--danger)]' : 'text-[color:var(--success)]'}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)] px-5 py-2.5 text-sm font-semibold text-[color:var(--on-primary)] transition-colors hover:bg-[color:var(--primary-600)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'submitting' ? (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        )}
        {status === 'submitting' ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
