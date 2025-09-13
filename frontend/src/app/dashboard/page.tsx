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
  // State to track locked meals by meal time
  const [lockedMeals, setLockedMeals] = useState<{ [mealTime: string]: boolean }>({});

  // Lock icon SVGs
  const LockIcon = ({ locked }: { locked: boolean }) => (
    <span
      style={{
        display: 'inline-block',
        marginRight: '0.7rem',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        transform: locked ? 'scale(1.2) rotate(-10deg)' : 'scale(1)',
        color: locked ? '#6366f1' : '#a1a1aa',
        verticalAlign: 'middle',
      }}
      aria-label={locked ? 'Unlock meal' : 'Lock meal'}
    >
      {locked ? (
        <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><path d="M6 8V6a4 4 0 118 0v2h1a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2h1zm2-2a2 2 0 114 0v2H8V6zm-3 4v6a1 1 0 001 1h10a1 1 0 001-1v-6a1 1 0 00-1-1H5a1 1 0 00-1 1z"/></svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><path d="M6 8V6a4 4 0 118 0v2h1a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2h1zm2-2a2 2 0 114 0v2H8V6zm-3 4v6a1 1 0 001 1h10a1 1 0 001-1v-6a1 1 0 00-1-1H5a1 1 0 00-1 1z" opacity="0.4"/></svg>
      )}
    </span>
  );
  // State to show/hide all filters
  const [filtersExpanded, setFiltersExpanded] = useState(true);
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
  // Remove old openDropdown, use openDropdowns instead
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({
    restaurants: false,
    proteins: false,
    allergies: false,
    mealtimes: false,
  });

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
      let updated;
      if (selected.includes(option)) {
        updated = { ...prev, [key]: selected.filter(o => o !== option) };
      } else {
        updated = { ...prev, [key]: [...selected, option] };
      }
      setMealData([]); // Clear meals on filter change
      return updated;
    });
  }

  function handleMealTimeChange(option: string) {
    setChosenMealTimes(prev => {
      let updated;
      if (prev.includes(option)) {
        updated = prev.filter(o => o !== option);
      } else {
        updated = [...prev, option];
      }
      setMealData([]); // Clear meals on filter change
      return updated;
    });
  }
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Helper to get locked meal objects
  function getLockedMealsArray() {
    // Map mealTime to locked, then find the meal object for each locked mealTime
    return Object.entries(lockedMeals)
      .filter(([_, isLocked]) => isLocked)
      .map(([mealTime]) => {
        // Find the meal for this mealTime
        return mealData.find(entry => {
          const mt = (entry.meal.meal_time || chosenMealTimes[mealData.indexOf(entry)] || '');
          return mt === mealTime;
        })?.meal;
      })
      .filter(Boolean);
  }

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

        {/* Show/Hide Filters button */}
        <button
          type="button"
          style={{
            marginBottom: '0.7rem',
            background: '#23232b',
            color: '#f4f4f5',
            border: '1.5px solid #6366f1',
            borderRadius: '0.5rem',
            padding: '0.5rem 0.5rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '1rem',
            width: 'fit-content',
            alignSelf: 'flex-end',
            boxShadow: '0 1px 4px rgba(99,102,241,0.08)',
          }}
          onClick={() => setFiltersExpanded(f => !f)}
        >
          {filtersExpanded ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* Multi-select dropdowns for exclusions */}
        {filtersExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', margin: '1.2rem 0 1.5rem 0' }}>
          {/* Restaurants */}
          <div style={{ position: 'relative', width: '100%' }}>
            <button type="button" className="input" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', fontWeight: 600, background: '#23232b', color: '#f4f4f5', border: '1.5px solid #a1a1aa', borderRadius: '0.5rem', padding: '0.6rem 1rem', minHeight: '2.5rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }} onClick={() => setOpenDropdowns(prev => ({ ...prev, restaurants: !prev.restaurants }))}>
              <span style={{ marginRight: '0.5rem' }}>Exclude Restaurants:</span>
              {exclusions.restaurants.length > 0 ? (
                exclusions.restaurants.map(item => (
                  <span key={item} style={{ background: '#37373f', color: '#f4f4f5', borderRadius: '0.7em', padding: '0.18em 0.7em', fontWeight: 500, border: '1.5px solid #6366f1', boxShadow: '0 1px 4px rgba(99,102,241,0.08)', display: 'inline-block' }}>{item}</span>
                ))
              ) : (
                <span style={{ color: '#a1a1aa', fontWeight: 400 }}>None</span>
              )}
            </button>
            {openDropdowns.restaurants && (
              <div style={{ position: 'static', zIndex: 10, background: '#23232b', border: '1.5px solid #a1a1aa', borderRadius: '0.5rem', width: '100%', marginTop: '0.2rem', maxHeight: '210px', overflowY: 'auto', boxShadow: '0 2px 12px rgba(0,0,0,0.13)' }}>
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
            <button type="button" className="input" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', fontWeight: 600, background: '#23232b', color: '#f4f4f5', border: '1.5px solid #a1a1aa', borderRadius: '0.5rem', padding: '0.6rem 1rem', minHeight: '2.5rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }} onClick={() => setOpenDropdowns(prev => ({ ...prev, proteins: !prev.proteins }))}>
              <span style={{ marginRight: '0.5rem' }}>Exclude Proteins:</span>
              {exclusions.proteins.length > 0 ? (
                exclusions.proteins.map(item => (
                  <span key={item} style={{ background: '#37373f', color: '#f4f4f5', borderRadius: '0.7em', padding: '0.18em 0.7em', fontWeight: 500, border: '1.5px solid #6366f1', boxShadow: '0 1px 4px rgba(99,102,241,0.08)', display: 'inline-block' }}>{item}</span>
                ))
              ) : (
                <span style={{ color: '#a1a1aa', fontWeight: 400 }}>None</span>
              )}
            </button>
            {openDropdowns.proteins && (
              <div style={{ position: 'static', zIndex: 10, background: '#23232b', border: '1.5px solid #a1a1aa', borderRadius: '0.5rem', width: '100%', marginTop: '0.2rem', maxHeight: '210px', overflowY: 'auto', boxShadow: '0 2px 12px rgba(0,0,0,0.13)' }}>
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
            <button type="button" className="input" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', fontWeight: 600, background: '#23232b', color: '#f4f4f5', border: '1.5px solid #a1a1aa', borderRadius: '0.5rem', padding: '0.6rem 1rem', minHeight: '2.5rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }} onClick={() => setOpenDropdowns(prev => ({ ...prev, allergies: !prev.allergies }))}>
              <span style={{ marginRight: '0.5rem' }}>Allergies/Dietary:</span>
              {exclusions.allergies.length > 0 ? (
                exclusions.allergies.map(item => (
                  <span key={item} style={{ background: '#37373f', color: '#f4f4f5', borderRadius: '0.7em', padding: '0.18em 0.7em', fontWeight: 500, border: '1.5px solid #6366f1', boxShadow: '0 1px 4px rgba(99,102,241,0.08)', display: 'inline-block' }}>{item}</span>
                ))
              ) : (
                <span style={{ color: '#a1a1aa', fontWeight: 400 }}>None</span>
              )}
            </button>
            {openDropdowns.allergies && (
              <div style={{ position: 'static', zIndex: 10, background: '#23232b', border: '1.5px solid #a1a1aa', borderRadius: '0.5rem', width: '100%', marginTop: '0.2rem', maxHeight: '210px', overflowY: 'auto', boxShadow: '0 2px 12px rgba(99,102,241,0.13)' }}>
                {allergyOptions.map(option => (
                  <label key={option} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1rem', color: '#f4f4f5' }}>
                    <input type="checkbox" checked={exclusions.allergies.includes(option)} onChange={() => handleDropdownChange(option, 'allergies')} style={{ marginRight: '0.7em' }} />
                    {option}
                  </label>
                ))}
              </div>
            )}
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
                gap: '0.4rem',
              }}
              onClick={() => setOpenDropdowns(prev => ({ ...prev, mealtimes: !prev.mealtimes }))}
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
                    display: 'inline-block',
                  }}>{item}</span>
                ))
              ) : (
                <span style={{ color: '#a1a1aa', fontWeight: 400 }}>None</span>
              )}
            </button>
            {openDropdowns.mealtimes && (
              <div style={{
                position: 'static',
                zIndex: 10,
                background: '#23232b',
                border: '1.5px solid #a1a1aa',
                borderRadius: '0.5rem',
                width: '100%',
                marginTop: '0.2rem',
                maxHeight: '210px',
                overflowY: 'auto',
                boxShadow: '0 2px 12px rgba(99,102,241,0.13)',
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
                      color: '#f4f4f5',
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
          </div>
        )}



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
              e.currentTarget.blur();
              const lockedMealsData = getLockedMealsArray();
              console.log('Locked meals to be sent:', lockedMealsData);
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
                },
                lockedMealsData,
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
            }}
          >
            🔄 Reroll
          </button>
        </div>
        {mealData.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Suggested Meals</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#23232b', color: '#f4f4f5', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: '#18181b', color: '#a5b4fc' }}>
                    <th style={{ padding: '0.7rem', borderBottom: '1.5px solid #3b3b4f', fontWeight: 700 }}>Meal</th>
                    <th style={{ padding: '0.7rem', borderBottom: '1.5px solid #3b3b4f', fontWeight: 700 }}>Meal Time</th>
                    <th style={{ padding: '0.7rem', borderBottom: '1.5px solid #3b3b4f', fontWeight: 700 }}>Restaurant</th>
                    <th style={{ padding: '0.7rem', borderBottom: '1.5px solid #3b3b4f', fontWeight: 700 }}>Calories</th>
                    <th style={{ padding: '0.7rem', borderBottom: '1.5px solid #3b3b4f', fontWeight: 700 }}>Protein</th>
                    <th style={{ padding: '0.7rem', borderBottom: '1.5px solid #3b3b4f', fontWeight: 700 }}>Carbs</th>
                    <th style={{ padding: '0.7rem', borderBottom: '1.5px solid #3b3b4f', fontWeight: 700 }}>Fat</th>
                    <th style={{ padding: '0.7rem', borderBottom: '1.5px solid #3b3b4f', fontWeight: 700 }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Map meal times to their order
                    const mealOrder = { Breakfast: 0, Lunch: 1, Dinner: 2 };
                    // Build a list of meals with their meal time
                    const mealsWithTime = mealData.map((entry, index) => {
                      let mealTime = chosenMealTimes[index] || entry.meal.meal_time || '';
                      return { ...entry, mealTime, index };
                    });
                    // Deduplicate: only one meal per meal time (Breakfast, Lunch, Dinner)
                    const uniqueMeals = [];
                    const seen = new Set();
                    for (const meal of mealsWithTime) {
                      if (mealOrder[meal.mealTime] !== undefined && !seen.has(meal.mealTime)) {
                        uniqueMeals[mealOrder[meal.mealTime]] = meal;
                        seen.add(meal.mealTime);
                      }
                    }
                    // Fill in missing slots with undefined if needed
                    const orderedMeals = [uniqueMeals[0], uniqueMeals[1], uniqueMeals[2]].filter(Boolean);
                    return orderedMeals.map((entry, sortedIdx) => {
                      const meal = entry.meal;
                      const mealTime = entry.mealTime;
                      const locked = lockedMeals[mealTime] || false;
                      return (
                        <tr key={sortedIdx} style={{ borderBottom: '1px solid #3b3b4f', minHeight: '56px', height: '56px', verticalAlign: 'middle' }}>
                          <td style={{ padding: '0.7rem', fontWeight: 600, verticalAlign: 'middle', height: '56px', display: 'flex', alignItems: 'center' }}>
                            <span
                              onClick={() => setLockedMeals(lm => ({ ...lm, [mealTime]: !lm[mealTime] }))}
                              style={{ display: 'flex', alignItems: 'center' }}
                            >
                              <LockIcon locked={locked} />
                            </span>
                            {meal.dish_name || 'Unnamed Dish'}
                          </td>
                          <td style={{ padding: '0.7rem', verticalAlign: 'middle', height: '56px' }}>{mealTime}</td>
                          <td style={{ padding: '0.7rem', verticalAlign: 'middle', height: '56px' }}>{meal.restaurant || 'Unknown'}</td>
                          <td style={{ padding: '0.7rem', verticalAlign: 'middle', height: '56px' }}>{meal.calories}</td>
                          <td style={{ padding: '0.7rem', verticalAlign: 'middle', height: '56px' }}>{meal.macros.protein}g</td>
                          <td style={{ padding: '0.7rem', verticalAlign: 'middle', height: '56px' }}>{meal.macros.carbohydrates}g</td>
                          <td style={{ padding: '0.7rem', verticalAlign: 'middle', height: '56px' }}>{meal.macros.fat}g</td>
                          <td style={{ padding: '0.7rem', verticalAlign: 'middle', height: '56px' }}>{meal.notes || ''}</td>
                        </tr>
                      );
                    });
                  })()}
                  {/* Daily summary row */}
                  {mealData.length > 0 && (() => {
                    const total = mealData.reduce((acc, entry) => {
                      const m = entry.meal;
                      acc.calories += Number(m.calories) || 0;
                      acc.protein += Number(m.macros.protein) || 0;
                      acc.carbs += Number(m.macros.carbohydrates) || 0;
                      acc.fat += Number(m.macros.fat) || 0;
                      return acc;
                    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
                    return (
                      <tr style={{ background: '#18181b', fontWeight: 700, minHeight: '56px', height: '56px', verticalAlign: 'middle' }}>
                        <td style={{ padding: '0.7rem', verticalAlign: 'middle', height: '56px' }}>Daily Summary</td>
                        <td style={{ padding: '0.7rem', verticalAlign: 'middle', height: '56px' }}></td>
                        <td style={{ padding: '0.7rem', verticalAlign: 'middle', height: '56px' }}></td>
                        <td style={{ padding: '0.7rem', verticalAlign: 'middle', height: '56px' }}>{total.calories}</td>
                        <td style={{ padding: '0.7rem', verticalAlign: 'middle', height: '56px' }}>{total.protein}g</td>
                        <td style={{ padding: '0.7rem', verticalAlign: 'middle', height: '56px' }}>{total.carbs}g</td>
                        <td style={{ padding: '0.7rem', verticalAlign: 'middle', height: '56px' }}>{total.fat}g</td>
                        <td style={{ padding: '0.7rem', verticalAlign: 'middle', height: '56px' }}></td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
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
