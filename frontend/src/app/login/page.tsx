"use client";

// HIGHLIGHT: Import js-cookie for cookie management
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function Login() {
  // HIGHLIGHT: Add router for redirect after login
  const router = useRouter();

  // HIGHLIGHT: Login handler to set cookie
  // HIGHLIGHT: Login handler to POST to /api/login
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.email.value;
    const password = form.password.value;

    // HIGHLIGHT: Send POST request to /api/login
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      // HIGHLIGHT: Set a login cookie (for demo, set a flag; in real app, set a token)
      Cookies.set('loggedIn', 'true', { expires: 7 }); // 7 days expiry
      // HIGHLIGHT: Redirect to dashboard
      router.push('/dashboard');
    } else {
      // HIGHLIGHT: Show error
      const data = await res.json();
      alert(data.error || 'Login failed');
    }
  }

  return (
    <main>
      <div className="card">
        <h2>Login</h2>
        {/* HIGHLIGHT: Add onSubmit handler to form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'flex-start', marginTop: '2rem', marginBottom: '1.5rem' }}>
          <label className="form-label-row">
            <span>Email:</span>
            <input type="email" name="email" className="input" style={{ width: '16rem' }} required />
          </label>
          <label className="form-label-row">
            <span>Password:</span>
            <input type="password" name="password" className="input" style={{ width: '16rem' }} required />
          </label>
          <div className="button-group">
            <button type="submit" className="button">Login</button>
          </div>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', width: '100%' }}>
          <span style={{ color: '#a1a1aa', fontSize: '0.97rem' }}>Don't have an account?</span>
          <div className="button-group" style={{ marginTop: '0.5rem' }}>
            <Link href="/register" className="button" style={{ padding: '0.5rem 1.5rem', fontSize: '0.95rem' }}>Register</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
