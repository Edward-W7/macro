"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProgressPopup } from '../useProgressPopup';
import { useCallback } from 'react';

export default function Register() {
  const router = useRouter();
  const { showPopup, ProgressPopup } = useProgressPopup();
  const showRegisterSuccess = useCallback(() => showPopup('Registration successful!'), [showPopup]);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.email.value;
    const password = form.password.value;

    // HIGHLIGHT: Send POST request to /api/register
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      showRegisterSuccess();
      router.push('/login');
    } else {
      const data = await res.json();
      alert(data.error || 'Registration failed');
    }
  }

  return (
    <main>
      <ProgressPopup />
      <div className="card">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'inline-block',
            border: '2px solid #3b82f6',
            borderRadius: '1rem',
            padding: '0.75rem 1.5rem',
            marginBottom: '0.7rem',
            background: '#18181b',
            cursor: 'pointer',
          }}>
            <img src="/assets/macro2.png" alt="Macro Logo" style={{ width: '110px', display: 'block' }} />
          </div>
        </Link>
        <h2>Register to save your information!</h2>
        {/* HIGHLIGHT: Add onSubmit handler */}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'flex-start', marginTop: '2rem', marginBottom: '1.5rem' }}>
          <label className="form-label-row">
            <span>Email:</span>
            <input type="email" name="email" className="input" style={{ width: '16rem' }} required />
          </label>
          <label className="form-label-row">
            <span>Password:</span>
            <input type="password" name="password" className="input" style={{ width: '16rem' }} required />
          </label>
          <div className="button-group">
            <button type="submit" className="button">Register</button>
          </div>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', width: '100%' }}>
          <span style={{ color: '#a1a1aa', fontSize: '0.97rem' }}>Already have an account?</span>
          <div className="button-group" style={{ marginTop: '0.5rem' }}>
            <Link href="/login" className="button" style={{ padding: '0.5rem 1.5rem', fontSize: '0.95rem' }}>Login</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
