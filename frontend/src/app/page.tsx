"use client";

import Link from 'next/link';
import { colors } from './colors';
export default function Home() {
  return (
    <main style={{ background: colors.background, minHeight: '100vh', color: colors.text }}>
      <div className="card">
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1.1rem', letterSpacing: '0.03em', color: colors.text }}>
          Welcome to
        </h1>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'inline-block',
            border: `2px solid ${colors.primary}`,
            borderRadius: '1rem',
            padding: '0.75rem 1.5rem',
            marginBottom: '1.5rem',
            background: colors.background,
            cursor: 'pointer',
            boxShadow: colors.shadow,
          }}>
            <img src="/assets/macro2.png" alt="Macro Logo" style={{ width: '110px', display: 'block' }} />
          </div>
        </Link>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 600, marginBottom: '2.2rem', color: colors.secondary }}>
          Campus Food can still meet your nutritional goals!
        </h2>
        <div className="button-group">
          <Link href="/questionnaire" className="button">Get Started</Link>
          <Link href="/login" className="button">Login</Link>
        </div>
      </div>
    </main>
  );
}