import { useRef, useState, useEffect, useCallback, memo } from 'react';
import { colors } from './colors';

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
        width: '340px',
        minHeight: '60px',
        height: 'auto',
  background: colors.background,
  color: colors.text,
  border: `2.5px solid ${colors.secondary}`,
        borderRadius: '0',
        padding: '0',
        fontWeight: 700,
        fontSize: '1.13rem',
        zIndex: 2000,
  boxShadow: colors.shadow,
        textAlign: 'center',
        letterSpacing: '0.01em',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          minHeight: '2.5em',
        }}>
          <span style={{
            fontWeight: 800,
            color: colors.text,
            fontSize: '1.15rem',
            width: '100%',
            textAlign: 'center',
            whiteSpace: 'pre-line',
            wordBreak: 'break-word',
            lineHeight: 1.3,
          }}>{popup.message}</span>
        </div>
        <div style={{
          width: '80%',
          height: '8px',
          background: colors.background,
          borderRadius: '0',
          overflow: 'hidden',
          marginTop: '0.2rem',
          boxShadow: colors.shadowInset
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: colors.secondary,
            borderRadius: '0',
            transition: 'width 0.13s linear',
          }} />
        </div>
      </div>
    );
  });

  return { showPopup, ProgressPopup };
}
