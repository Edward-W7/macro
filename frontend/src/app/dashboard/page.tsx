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
  // ...existing code...
  // Options for dropdowns (loaded from JSON)
  const [restaurantOptions, setRestaurantOptions] = useState<string[]>([]);
  const [proteinOptions, setProteinOptions] = useState<string[]>([]);
  const [allergyOptions, setAllergyOptions] = useState<string[]>([]);
  const mealTimeOptions = ['Breakfast', 'Lunch', 'Dinner']; // You can expand this as needed
  const [chosenMealTimes, setChosenMealTimes] = useState<string[]>(mealTimeOptions); // all selected by default
  // State for dropdowns
  // Encapsulate all exclusions in a single object
  const [exclusions, setExclusions] = useState<{
    restaurants: string[];
    proteins: string[];
    allergies: string[];
  }>({
    restaurants: [],
    proteins: [],
    allergies: [],
  });
  const [mealData, setMealData] = useState<any[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    console.log('Exclusions updated:', exclusions);
  }, [exclusions]);

  useEffect(() => {
    async function fetchOptions() {
      const [restaurantsRes, proteinsRes, allergiesRes] = await Promise.all([
        fetch('/data/restaurants.json'),
        fetch('/data/proteins.json'),
        fetch('/data/allergies.json'),
      ]);
      if (restaurantsRes.ok) setRestaurantOptions(await restaurantsRes.json());
      if (proteinsRes.ok) setProteinOptions(await proteinsRes.json());
      if (allergiesRes.ok) setAllergyOptions(await allergiesRes.json());
    }
    fetchOptions();
  }, []);

  // State for dropdowns

  function handleDropdownChange(
    option: string,
    key: 'restaurants' | 'proteins' | 'allergies'
  ) {
    setExclusions(prev => {
      const selected = prev[key];
      if (selected.includes(option)) {
        return { ...prev, [key]: selected.filter(o => o !== option) };
      } else {
        return { ...prev, [key]: [...selected, option] };
      }
    });
  }

  function handleMealTimeChange(option: string) {
  setChosenMealTimes(prev => {
    if (prev.includes(option)) {
      return prev.filter(o => o !== option);
    } else {
      return [...prev, option];
    }
  });
}
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
        <h2>Welcome to your dashboard!</h2>
        <p>You are now logged in. Here you can view your meal suggestions:</p>


        {/* Multi-select dropdowns for exclusions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', margin: '1.2rem 0 1.5rem 0' }}>
          {/* Restaurants */}
          <div style={{ position: 'relative', width: '100%' }}>
            <button type="button" className="input" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', fontWeight: 600, background: '#23232b', color: '#f4f4f5', border: '1.5px solid #a1a1aa', borderRadius: '0.5rem', padding: '0.6rem 1rem', minHeight: '2.5rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }} onClick={() => setOpenDropdown(openDropdown === 'restaurants' ? null : 'restaurants')}>
              <span style={{ marginRight: '0.5rem' }}>Exclude Restaurants:</span>
              {exclusions.restaurants.length > 0 ? (
                exclusions.restaurants.map(item => (
                  <span key={item} style={{ background: '#37373f', color: '#f4f4f5', borderRadius: '0.7em', padding: '0.18em 0.7em', fontWeight: 500, border: '1.5px solid #6366f1', boxShadow: '0 1px 4px rgba(99,102,241,0.08)', display: 'inline-block' }}>{item}</span>
                ))
              ) : (
                <span style={{ color: '#a1a1aa', fontWeight: 400 }}>None</span>
              )}
            </button>
            {openDropdown === 'restaurants' && (
              <div style={{ position: 'absolute', zIndex: 10, background: '#23232b', border: '1.5px solid #a1a1aa', borderRadius: '0.5rem', width: '100%', marginTop: '0.2rem', maxHeight: '210px', overflowY: 'auto', boxShadow: '0 2px 12px rgba(0,0,0,0.13)' }}>
                {restaurantOptions.map(option => (
                  <label key={option} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1rem', color: '#f4f4f5' }}>
                    <input type="checkbox" checked={exclusions.restaurants.includes(option)} onChange={() => handleDropdownChange(option, 'restaurants')} style={{ marginRight: '0.7em' }} />
                    {option}
                  </label>
                ))}
              </div>
            )}
          </div>
          {/* Proteins */}
          <div style={{ position: 'relative', width: '100%' }}>
            <button type="button" className="input" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', fontWeight: 600, background: '#23232b', color: '#f4f4f5', border: '1.5px solid #a1a1aa', borderRadius: '0.5rem', padding: '0.6rem 1rem', minHeight: '2.5rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }} onClick={() => setOpenDropdown(openDropdown === 'proteins' ? null : 'proteins')}>
              <span style={{ marginRight: '0.5rem' }}>Exclude Proteins:</span>
              {exclusions.proteins.length > 0 ? (
                exclusions.proteins.map(item => (
                  <span key={item} style={{ background: '#37373f', color: '#f4f4f5', borderRadius: '0.7em', padding: '0.18em 0.7em', fontWeight: 500, border: '1.5px solid #6366f1', boxShadow: '0 1px 4px rgba(99,102,241,0.08)', display: 'inline-block' }}>{item}</span>
                ))
              ) : (
                <span style={{ color: '#a1a1aa', fontWeight: 400 }}>None</span>
              )}
            </button>
            {openDropdown === 'proteins' && (
              <div style={{ position: 'absolute', zIndex: 10, background: '#23232b', border: '1.5px solid #a1a1aa', borderRadius: '0.5rem', width: '100%', marginTop: '0.2rem', maxHeight: '210px', overflowY: 'auto', boxShadow: '0 2px 12px rgba(0,0,0,0.13)' }}>
                {proteinOptions.map(option => (
                  <label key={option} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1rem', color: '#f4f4f5' }}>
                    <input type="checkbox" checked={exclusions.proteins.includes(option)} onChange={() => handleDropdownChange(option, 'proteins')} style={{ marginRight: '0.7em' }} />
                    {option}
                  </label>
                ))}
              </div>
            )}
          </div>
          {/* Allergies/Dietary */}
          <div style={{ position: 'relative', width: '100%' }}>
            <button type="button" className="input" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', fontWeight: 600, background: '#23232b', color: '#f4f4f5', border: '1.5px solid #a1a1aa', borderRadius: '0.5rem', padding: '0.6rem 1rem', minHeight: '2.5rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }} onClick={() => setOpenDropdown(openDropdown === 'allergies' ? null : 'allergies')}>
              <span style={{ marginRight: '0.5rem' }}>Allergies/Dietary:</span>
              {exclusions.allergies.length > 0 ? (
                exclusions.allergies.map(item => (
                  <span key={item} style={{ background: '#37373f', color: '#f4f4f5', borderRadius: '0.7em', padding: '0.18em 0.7em', fontWeight: 500, border: '1.5px solid #6366f1', boxShadow: '0 1px 4px rgba(99,102,241,0.08)', display: 'inline-block' }}>{item}</span>
                ))
              ) : (
                <span style={{ color: '#a1a1aa', fontWeight: 400 }}>None</span>
              )}
            </button>
            {openDropdown === 'allergies' && (
              <div style={{ position: 'absolute', zIndex: 10, background: '#23232b', border: '1.5px solid #a1a1aa', borderRadius: '0.5rem', width: '100%', marginTop: '0.2rem', maxHeight: '210px', overflowY: 'auto', boxShadow: '0 2px 12px rgba(0,0,0,0.13)' }}>
                {allergyOptions.map(option => (
                  <label key={option} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1rem', color: '#f4f4f5' }}>
                    <input type="checkbox" checked={exclusions.allergies.includes(option)} onChange={() => handleDropdownChange(option, 'allergies')} style={{ marginRight: '0.7em' }} />
                    {option}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Meal Times */}
        <div style={{ position: 'relative', width: '100%' }}>
          <button
            type="button"
            className="input"
            style={{
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              fontWeight: 600,
              background: '#23232b',
              color: '#f4f4f5',
              border: '1.5px solid #a1a1aa',
              borderRadius: '0.5rem',
              padding: '0.6rem 1rem',
              minHeight: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.4rem'
            }}
            onClick={() => setOpenDropdown(openDropdown === 'mealtimes' ? null : 'mealtimes')}
          >
            <span style={{ marginRight: '0.5rem' }}>Select Meal Times:</span>
            {chosenMealTimes.length > 0 ? (
              chosenMealTimes.map(item => (
                <span key={item} style={{
                  background: '#37373f',
                  color: '#f4f4f5',
                  borderRadius: '0.7em',
                  padding: '0.18em 0.7em',
                  fontWeight: 500,
                  border: '1.5px solid #6366f1',
                  boxShadow: '0 1px 4px rgba(99,102,241,0.08)',
                  display: 'inline-block'
                }}>{item}</span>
              ))
            ) : (
              <span style={{ color: '#a1a1aa', fontWeight: 400 }}>None</span>
            )}
          </button>

          {openDropdown === 'mealtimes' && (
            <div style={{
              position: 'absolute',
              zIndex: 10,
              background: '#23232b',
              border: '1.5px solid #a1a1aa',
              borderRadius: '0.5rem',
              width: '100%',
              marginTop: '0.2rem',
              maxHeight: '210px',
              overflowY: 'auto',
              boxShadow: '0 2px 12px rgba(0,0,0,0.13)'
            }}>
              {mealTimeOptions.map(option => (
                <label
                  key={option}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    color: '#f4f4f5'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={chosenMealTimes.includes(option)}
                    onChange={() => handleMealTimeChange(option)}
                    style={{ marginRight: '0.7em' }}
                  />
                  {option}
                </label>
              ))}
            </div>
          )}
        </div>


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
            onClick={async (e) => {
                // some logic here for requerying
                e.currentTarget.blur();
                const body = {
                  money: 0,
                  macros: {
                    protein: 100,
                    carbohydrates: 120,
                    fat: 45,
                  },
                  calories: 1200,
                  restrictions: chosenMealTimes,
                  exclusions: {
                    restaurants: exclusions.restaurants,
                    protein: exclusions.proteins,
                    dietary: exclusions.allergies,
                  }
                };
                const res = await fetch('/api/targets', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(body),
                });
                if (!res.ok) {
                  console.error('API error:', res.statusText);
                  return;
                }
                const data = await res.json();
                setMealData(data.bestResult);
                // console.log("DATA", data);
                // console.log("CHOSEN DATA",mealData);
                // console.log("LENGTH", mealData.length);
            }}
          >
            🔄 Reroll
          </button>
        </div>
        {mealData.length > 0 && (
  <div style={{ marginTop: '2rem' }}>
    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Suggested Meals</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      {mealData.map((entry, index) => {
        const meal = entry.meal; // 🔥 unwrap the actual meal object
        // console.log("MEAL CHOSEN", meal);
        return (
          <div
            key={index}
            style={{
              background: '#1f1f27',
              border: '1px solid #3b3b4f',
              borderRadius: '0.5rem',
              padding: '1rem',
              color: '#f4f4f5',
            }}
          >
            <h4 style={{ marginBottom: '0.5rem', color: '#a5b4fc' }}>
              {meal.dish_name || 'Unnamed Dish'} ({chosenMealTimes[index]})
            </h4>
            
            <p><strong>Restaurant:</strong> {meal.restaurant || 'Unknown'}</p>
            <p><strong>Calories:</strong> {meal.calories}</p>
            <p><strong>Protein:</strong> {meal.macros.protein}g</p>
            <p><strong>Carbohydrates:</strong> {meal.macros.carbohydrates}g</p>
            <p><strong>Fat:</strong> {meal.macros.fat}g</p>
            {meal.notes && <p><strong>Notes:</strong> {meal.notes}</p>}
          </div>
        );
      })}
    </div>
  </div>
)}



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
