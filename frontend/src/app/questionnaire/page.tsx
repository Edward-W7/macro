"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useLayoutEffect } from "react";

export default function Questionnaire() {
  const router = useRouter();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [about, setAbout] = useState('');
  const [popup, setPopup] = useState<{ message: string; key: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const popupTimeout = useRef<NodeJS.Timeout | null>(null);
  const [restoredOnMount, setRestoredOnMount] = useState(false);

  function showPopup(message: string, duration = 1800) {
    const key = Date.now();
    setPopup({ message, key });
    setProgress(100);

    if (popupTimeout.current) clearTimeout(popupTimeout.current);

    // animation
    let start = Date.now();
    function animate() {
      const elapsed = Date.now() - start;
      const percent = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(percent);
      if (percent > 0) {
        popupTimeout.current = setTimeout(animate, 16);
      } else {
        setPopup(null);
      }
    }
    animate();
  }

  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('questionnaire');
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          const isRestored = Boolean(
            (saved.height && saved.height !== '') ||
            (saved.weight && saved.weight !== '') ||
            (saved.about && saved.about !== '')
          );
          if (isRestored) {
            setHeight(saved.height || '');
            setWeight(saved.weight || '');
            setAbout(saved.about || '');
            setRestoredOnMount(true);
          }
        } catch {}
      }
    }

    return () => {
      if (popupTimeout.current) clearTimeout(popupTimeout.current);
      setProgress(0);
      setPopup(null);
    };
  }, []);

  useEffect(() => {
    if (restoredOnMount) {
      showPopup('Restored saved data');
      setRestoredOnMount(false);
    }
  }, [restoredOnMount]);

  // cookie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('questionnaire', JSON.stringify({ height, weight, about }));
    }
  }, [height, weight, about]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('questionnaire', JSON.stringify({ height, weight, about }));
      showPopup('Saved!');
    }
    router.push("/register");
  }
  return (
    <main>
      <div className="card">
        <a href="/" style={{ textDecoration: 'none' }}>
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
        </a>
        <h2>Tell us more about yourself.</h2>
        <p>All of your information will be kept confidential and will only be used for the purpose of determining your macro nutrition targets.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
          <label className="form-label-row">
            <span>Enter your height (in inches):</span>
            <input
              type="number"
              name="height"
              min="0"
              step="1"
              className="input"
              style={{ width: '8rem' }}
              value={height}
              onChange={e => setHeight(e.target.value)}
              placeholder="67"
            />
          </label>
          <label className="form-label-row">
            <span>Enter your weight (in pounds):</span>
            <input
              type="number"
              name="weight"
              min="0"
              step="1"
              className="input"
              style={{ width: '8rem' }}
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="150"
            />
          </label>

          <label style={{ width: '100%' }}> 
            Tell us more about your nutrition goals:
            <textarea
              name="about"
              rows={4}
              className="input-textarea"
              value={about}
              onChange={e => setAbout(e.target.value)}
              placeholder="Tell us more..."
            />
          </label>
          <div className="button-group">
            {/* This will need some backend queries */}
            <button type="submit" className="button">Submit</button>
          </div>
        </form>
        {popup && (
          <div style={{
            position: 'absolute',
            top: '1.2rem',
            left: 0,
            right: 0,
            margin: '0 auto',
            width: '320px',
            height: '60px',
            background: '#23232b',
            color: '#fff',
            border: '2.5px solid #a1a1aa',
            borderRadius: '0',
            padding: '0',
            fontWeight: 700,
            fontSize: '1.13rem',
            zIndex: 20,
            boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
            textAlign: 'center',
            letterSpacing: '0.01em',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.1rem',
          }}>
            <span style={{ fontWeight: 800, color: '#f4f4f5', fontSize: '1.15rem' }}>{popup.message}</span>
            <div style={{
              width: '80%',
              height: '8px',
              background: '#18181b',
              borderRadius: '0',
              overflow: 'hidden',
              marginTop: '0.2rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: '#a1a1aa',
                borderRadius: '0',
                transition: 'width 0.13s linear',
              }} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
