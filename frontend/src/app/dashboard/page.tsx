"use client";
import Cookies from 'js-cookie';
import { useEffect, useState } from "react";
import { useProgressPopup } from '../useProgressPopup';
import { useRouter } from "next/navigation";

// Auth check using cookie only
function isAuthenticated() {
  if (typeof window === "undefined") return false;
  return Cookies.get('loggedIn') === 'true';
}

// Define a type for the AI-generated macros for type-safety
interface TargetMacros {
  calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  reasoning: string;
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  // Updated userProfile state to use the new simplified structure
  const [userProfile, setUserProfile] = useState({
    height: 180,
    weight: 75,
    goals: 'Build lean muscle. I am vegetarian and prefer a higher protein diet.'
  });
  const [targetMacros, setTargetMacros] = useState<TargetMacros | null>(null);
  const { showPopup, ProgressPopup } = useProgressPopup();

  useEffect(() => {
    showPopup('Welcome back!');
  }, [showPopup]);

  const [lockedMeals, setLockedMeals] = useState<{ [mealTime: string]: boolean }>({});

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

  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [restaurantOptions, setRestaurantOptions] = useState<string[]>([]);
  const [proteinOptions, setProteinOptions] = useState<string[]>([]);
  const [allergyOptions, setAllergyOptions] = useState<string[]>([]);
  const mealTimeOptions = ['Breakfast', 'Lunch', 'Dinner'];
  const [chosenMealTimes, setChosenMealTimes] = useState<string[]>(mealTimeOptions);

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

  function handleDropdownChange(
    option: string,
    key: 'restaurants' | 'proteins' | 'allergies'
  ) {
    setExclusions(prev => {
      const selected = prev[key];
      const updated = selected.includes(option)
        ? { ...prev, [key]: selected.filter(o => o !== option) }
        : { ...prev, [key]: [...selected, option] };
      setMealData([]);
      return updated;
    });
  }

  function handleMealTimeChange(option: string) {
    setChosenMealTimes(prev => {
      const updated = prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option];
      setMealData([]);
      return updated;
    });
  }

  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  function getLockedMealsArray() {
    const result: { [key: string]: any }[] = [];
    Object.entries(lockedMeals)
      .filter(([_, isLocked]) => isLocked)
      .forEach(([mealTime]) => {
        const mealEntry = mealData.find(entry => {
          const mt = entry.meal.meal_time || chosenMealTimes[mealData.indexOf(entry)] || '';
          return mt === mealTime;
        });
        if (mealEntry?.meal) {
          result.push({ [mealTime]: mealEntry.meal });
        }
      });
    return result;
  }

  // --- Main function to handle fetching macros and then meals ---
  async function generatePlan() {
    setIsLoading(true);
    setMealData([]); // Clear previous meals on reroll
    showPopup('Generating your new plan...');

    try {
      // Step 1: Call the generate-macros API with the user's profile
      const macroResponse = await fetch('/api/generate-macros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile),
      });

      if (!macroResponse.ok) {
        const errorData = await macroResponse.json();
        throw new Error(errorData.error.message || 'Failed to fetch macros.');
      }

      const calculatedMacros: TargetMacros = await macroResponse.json();

      console.log('AI-Generated Macros:', calculatedMacros);

      setTargetMacros(calculatedMacros);

      // Step 2: Use the AI-calculated macros to call the meal generation API
      const locks = getLockedMealsArray();
      const targetsBody = {
        money: 0,
        macros: {
          protein: calculatedMacros.protein_grams,
          carbohydrates: calculatedMacros.carbs_grams,
          fat: calculatedMacros.fat_grams,
        },
        calories: calculatedMacros.calories,
        restrictions: chosenMealTimes,
        exclusions: {
          restaurants: exclusions.restaurants,
          protein: exclusions.proteins,
          dietary: exclusions.allergies,
        },
        locks,
      };

      const targetsResponse = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetsBody),
      });

      if (!targetsResponse.ok) {
        throw new Error(`Meal generation failed: ${targetsResponse.statusText}`);
      }

      const mealPlanData = await targetsResponse.json();
      setMealData(mealPlanData.bestResult);
      showPopup('Your new meal plan is ready!');

    } catch (error) {
      console.error("An error occurred during plan generation:", error);
      showPopup(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const authed = isAuthenticated();
    setAuthed(authed);
    setAuthChecked(true);
    if (!authed) {
      router.replace("/login");
    }
  }, [router]);

  if (!authChecked || !authed) {
    return null; // or a loading spinner/message
  }

  return (
    <>
      <ProgressPopup />
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

          {targetMacros && (
            <div style={{
              background: '#23232b',
              border: '1.5px solid #6366f1',
              borderRadius: '0.5rem',
              padding: '1rem',
              margin: '1.5rem 0',
              boxShadow: '0 1px 4px rgba(99,102,241,0.08)'
            }}>
              <h3 style={{ marginTop: 0, color: '#a5b4fc' }}>Your AI-Generated Daily Goals</h3>
              <p style={{ margin: '0.5rem 0 1rem 0', fontStyle: 'italic', color: '#d4d4d8' }}>
                &quot;{targetMacros.reasoning}&quot;
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-around', fontWeight: 600 }}>
                <span>Calories: {targetMacros.calories}</span>
                <span>Protein: {targetMacros.protein_grams}g</span>
                <span>Carbs: {targetMacros.carbs_grams}g</span>
                <span>Fat: {targetMacros.fat_grams}g</span>
              </div>
            </div>
          )}

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

          {mealData.length > 0 ? (
            <div style={{ margin: '1rem 0', color: '#22c55e', fontWeight: 600 }}>
              ✅ Here is your generated meal plan!
            </div>
          ) : (
            !isLoading && <div style={{ margin: '1rem 0', color: '#fdf911ff', fontWeight: 600 }}>
               Click &quot;Generate Plan&quot; to get started.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '0.7rem 0 0.7rem 0' }}>
            <button
              className="button button-large"
              style={{
                minWidth: '10rem',
                fontSize: '1.15rem',
                padding: '0.6rem 2.2rem',
                fontWeight: 700,
                borderRadius: '0.7rem',
                boxShadow: '0 2px 8px rgba(59,130,246,0.13)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
              onClick={() => generatePlan()}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : (mealData.length > 0 ? '🔄 Reroll' : 'Generate Plan')}
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
                      const mealOrder: { [key: string]: number } = { Breakfast: 0, Lunch: 1, Dinner: 2 };
                      const mealsWithTime = mealData.map((entry, index) => {
                        let mealTime = entry.meal.meal_time || chosenMealTimes[index] || '';
                        return { ...entry, mealTime, index };
                      });
                      const uniqueMeals: any[] = [];
                      const seen = new Set();
                      for (const meal of mealsWithTime) {
                        if (mealOrder[meal.mealTime] !== undefined && !seen.has(meal.mealTime)) {
                          uniqueMeals[mealOrder[meal.mealTime]] = meal;
                          seen.add(meal.mealTime);
                        }
                      }
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
    </>
  );
}

