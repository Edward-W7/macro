"use client";
import Cookies from 'js-cookie'; // HIGHLIGHT: Import js-cookie
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// HIGHLIGHT: Auth check using cookie only
function isAuthenticated() {
  if (typeof window === "undefined") return false;
  return Cookies.get('loggedIn') === 'true';
}

export default function Dashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const authed = isAuthenticated();
    setAuthed(authed);
    setAuthChecked(true);
    if (!authed) {
      router.replace("/login");
    }
  }, [router]);

  if (!authChecked) {
    return null; // or a loading spinner/message
  }
  if (!authed) {
    return null;
  }
  // HIGHLIGHT: Main dashboard UI with meal info, macro summary, etc.
  return (
    <main>
      <div className="card">
        <h2>Welcome to your dashboard!</h2>
        <p>You are now logged in. Here you can view your meal suggestions:</p>

        {/* Quick summary of your macro goals */}

        {/* List of meals presented nicely with a lock button next to it*/}

        {/* click to expand for full macro information on all meals*/}
        <div style={{ margin: '1.2rem 0' }}>
          <button
            className="button button-small"
            style={{ marginBottom: expanded ? '0.5rem' : 0, minWidth: '7.5rem', fontSize: '0.75rem', padding: '0.18rem 0.5rem', transition: 'background 0.2s, color 0.2s, border 0.2s' }}
            onClick={e => {
              setExpanded(val => !val);
              e.currentTarget.blur();
            }}
            aria-expanded={expanded}
          >
            {expanded ? 'Hide Full Info' : 'Show Full Info'}
          </button>
          <div
            style={{
              maxHeight: expanded ? '200px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)',
              marginTop: expanded ? '0.5rem' : '0',
            }}
            aria-hidden={!expanded}
          >
            <div style={{
              background: '#23232b',
              border: '1px solid #444',
              borderRadius: '0.5rem',
              padding: expanded ? '0.5rem' : '0 0.5rem',
              textAlign: 'left',
              color: '#f4f4f5',
              fontSize: '0.78rem',
              opacity: expanded ? 1 : 0,
              transition: 'opacity 0.2s 0.1s',
            }}>
              {/* Replace with real macro info */}
              <strong style={{ fontSize: '0.81rem' }}>Full Macro Information:</strong>
              <ul style={{ margin: '0.3rem 0 0 0.05rem', paddingLeft: '1.1em' }}>
                <li>Meal 1: 30g protein, 50g carbs, 10g fat</li>
                <li>Meal 2: 25g protein, 40g carbs, 12g fat</li>
                <li>Meal 3: 28g protein, 45g carbs, 8g fat</li>
              </ul>
            </div>
          </div>
        </div>

        {/* quick text that says whether you're meeting your goals */}
        {true ? (
          <div style={{ margin: '1rem 0', color: '#22c55e', fontWeight: 600 }}>
            ✅ You are meeting your macro goals!
          </div>
        ) : (
          <div style={{ margin: '1rem 0', color: '#fdf911ff', fontWeight: 600 }}>
            ⚠️ You cannot currently meet your macro goals. Consider broadening your search.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: '1.5rem' }}>
          <button
            className="button button-small"
            style={{ minWidth: '5.2rem', fontSize: '0.75rem', padding: '0.18rem 0.5rem' }}
            onClick={e => {
                // some logic here for requerying
                alert('Rerolling meals! (implement logic here)');
                e.currentTarget.blur();
            }}
          >
            🔄 Reroll
          </button>
        </div>

        {/* Logout button at the very bottom */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '2.5rem' }}>
          <button
            className="button"
            style={{ padding: '0.4rem 1.1rem', fontSize: '0.95rem', minWidth: 0 }}
            onClick={() => {
              Cookies.remove('loggedIn');
              router.replace('/');
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}
