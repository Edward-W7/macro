import { useRef, useState, useEffect, useCallback, memo } from 'react';

export function useProgressPopup() {

  const [popup, setPopup] = useState<{ message: string; key: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const endTimeRef = useRef<number>(0);
  const durationRef = useRef(1800);

  // only animate when popup is visible
  useEffect(() => {
    if (!popup) return;
    let mounted = true;
    function animate() {
      if (!mounted) return;
      const now = Date.now();
      const remaining = endTimeRef.current - now;
      const percent = Math.max(0, 100 * (remaining / durationRef.current));
      setProgress(percent);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setPopup(null);
        setProgress(0);
        rafRef.current = null;
      }
    }
    animate();
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [popup]);

  const showPopup = useCallback((message: string, duration = 1800) => {
    setPopup({ message, key: Date.now() });
    setProgress(100);
    endTimeRef.current = Date.now() + duration;
    durationRef.current = duration;
  }, []);

  const ProgressPopup = memo(() => {
    if (!popup) return null;
    return (
      <div style={{
        position: 'fixed',
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
        zIndex: 2000,
        boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
        textAlign: 'center',
        letterSpacing: '0.01em',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.1rem',
        pointerEvents: 'none',
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
    );
  });

  return { showPopup, ProgressPopup };
}
