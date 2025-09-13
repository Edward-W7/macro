"use client";

// HIGHLIGHT: Add useRouter for redirect after registration
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function Register() {
  // HIGHLIGHT: Add router for redirect
  const router = useRouter();

  // HIGHLIGHT: Registration handler
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
      // HIGHLIGHT: Registration successful, redirect to login
      router.push('/login');
    } else {
      // HIGHLIGHT: Show error
      const data = await res.json();
      alert(data.error || 'Registration failed');
    }
  }

  return (
    <main>
      <div className="card">
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
