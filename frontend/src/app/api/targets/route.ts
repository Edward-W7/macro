import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Food from '@/models/food';

type Macros = {
  protein?: number;
  carbohydrates?: number;
  fat?: number;
};

type Meal = {
  macros?: Macros;
  calories?: number;
  money?: number;
};

type LockedMeal = {
  [mealTime: string]: Meal;
};

// Helper to compute totals for selectedMeals
function getMealTotals(selectedMeals: any[]) {
    // console.log("TOTALING MEALS", selectedMeals)
    return {
        protein: selectedMeals.reduce((sum, m) => sum + m[Object.keys(m)[0]].macros.protein, 0),
        calories: selectedMeals.reduce((sum, m) => sum + m[Object.keys(m)[0]].calories, 0),
        carbs: selectedMeals.reduce((sum, m) => sum + m[Object.keys(m)[0]].macros.carbohydrates, 0),
        fat: selectedMeals.reduce((sum, m) => sum + m[Object.keys(m)[0]].macros.fat, 0),
        money: selectedMeals.reduce((sum, m) => sum + m[Object.keys(m)[0]].money, 0),
    };
}
// Scoring function to weight money difference most, then protein, calories, carbs, fat
function scoreMealTotals(totals: any, goals: any) {
    // console.log("GOALS", goals);
    // console.log("totals", totals);
    const moneyBase = goals.money === 0 ? 1 : goals.money;
    const proteinBase = goals.protein === 0 ? 1 : goals.protein;
    const caloriesBase = goals.calories === 0 ? 1 : goals.calories;
    const carbsBase = goals.carbohydrates === 0 ? 1 : goals.carbohydrates;
    const fatBase = goals.fat === 0 ? 1 : goals.fat;

    const moneyDiff = Math.min(0, (totals.money - goals.money) / moneyBase) * -10;
    const proteinDiff = -Math.abs((totals.protein - goals.protein) / proteinBase) * 5;
    const caloriesDiff = -Math.abs((totals.calories - goals.calories) / caloriesBase) * 3;
    const carbsDiff = -Math.abs((totals.carbs - goals.carbohydrates) / carbsBase) * 2;
    const fatDiff = -Math.abs((totals.fat - goals.fat) / fatBase) * 1;
    return moneyDiff + proteinDiff + caloriesDiff + carbsDiff + fatDiff;
}

export async function POST(req: NextRequest) {
    await connectDB();
    const { money, macros, calories, restrictions, exclusions, locks = [] } = await req.json();
    // console.log("PASSED", locks);
    // Set goals based on initial constraints
    const goals = {
        money,
        protein: macros.protein,
        calories,
        carbohydrates: macros.carbohydrates,
        fat: macros.fat,
    };

    const ogGoals = goals;


  let relaxCalories = 0;
  let relaxProtein = 0;
  let relaxFlex = 0;
  let relaxCarbohydrates = 0;
  let relaxFats = 0;
  let selectedMeals: any[] = [];
  let bestResult: any[] = [];
  let cycles = 100;
  let bestScore = -10000;
  const lockedMeals = Array.isArray(locks) ? locks : [];

for (const locked of lockedMeals as LockedMeal[]) {
  // locked is e.g. { Breakfast: {...} }
  const [mealTime, meal] = Object.entries(locked)[0];  // Get first (and only) key/value

  goals.protein        -= meal.macros?.protein        || 0;
  goals.carbohydrates  -= meal.macros?.carbohydrates  || 0;
  goals.fat            -= meal.macros?.fat            || 0;
  goals.calories       -= meal.calories               || 0;
  goals.money          -= meal.money                  || 0;
}

// console.log("Goals", goals);

  // Exclude foods from specified restaurants, with specified proteins, and with specified dietary tags, in addition to blacklisted
  let prunedFoods = await Food.find({
  blacklisted: { $ne: true },
  ...(exclusions?.restaurants?.length > 0 ? {
    restaurant: { $nin: exclusions.restaurants }
  } : {}),
  ...(exclusions?.protein?.length > 0 ? {
    proteinType: { $nin: exclusions.protein }
  } : {})
});

  const lockedMealTypes = locks.map(lock => Object.keys(lock)[0]);
  let filteredRestrictions = restrictions?.filter(r => !lockedMealTypes.includes(r));
  console.log("FILTERD RESTRICTION", filteredRestrictions);
//   console.log("LCOKED", lockedMeals)
  for (let i: number = 0; i < 5; i++) {
    // 5 stages of relaxing constraints
    let fail = true;
    for (let j: number = 0; j < cycles; j++) {
        let remainingFlex = goals.money + relaxFlex;
        let remainingProtein = goals.protein + relaxProtein;
        let remainingCalories = goals.calories + relaxCalories;
        let remainingCarbs = goals.carbohydrates + relaxCarbohydrates;
        let remainingFat = goals.fat + relaxFats;
        let burnerMeals = JSON.parse(JSON.stringify(lockedMeals));
        let finished = true;
        for (const meal of filteredRestrictions) {
            // Query for foods that fit this meal, flex, protein, and calorie constraints, and are not blacklisted
            const foods = prunedFoods
                .filter(food => Object.values(food.meal_type).includes(meal))
                .filter(food => food.money <= remainingFlex)
                .filter(food => food.calories <= remainingCalories)
                .filter(food => (food.macros.protein) <= remainingProtein) // assumes food.price exists
                .filter(food => (food.macros.carbohydrates) <= remainingCarbs)
                .filter(food => (food.macros.fat) <= remainingFat);
            
            // console.log(`\n--- MEAL: ${meal} ---`);
            // console.log(`Available Foods: ${foods.length}`);
            // console.log(`Remaining Flex: ${remainingFlex}`);
            // console.log(`Remaining Calories: ${remainingCalories}`);
            // console.log(`Remaining Protein: ${remainingProtein}`);
            // console.log(`Remaining Carbs: ${remainingCarbs}`);
            // console.log(`Remaining Fat: ${remainingFat}`);
            if (foods.length > 0) {
                let food;
                // If this is the last meal in restrictions, pick the food with the highest protein
                if (meal === filteredRestrictions[filteredRestrictions.length]) {
                    const endIndex = Math.floor(length * 0.1); // 10% mark
                    const randomIndex = Math.floor(Math.random() * endIndex);
                    food = foods.sort((a, b) => b.macros.protein - a.macros.protein)[randomIndex];
                } else {
                    food = foods[Math.floor(Math.random() * foods.length)];
                }
                burnerMeals.push({ [meal]: food });
                // Update remaining constraints
                remainingFlex -= food.money;
                remainingProtein -= food.macros.protein;
                remainingCalories -= food.calories;
                remainingCarbs -= food.macros.carbohydrates;
                remainingFat -= food.macros.fat;
            } else {
                finished = false;
                break;
            }
        }
        // console.log("FINISHED ", finished);
        if (!finished) {
            continue;
        }
        const mealOrder = ['breakfast', 'lunch', 'dinner'];

        burnerMeals.sort((a, b) => {
            const mealTypeA = Object.keys(a)[0].toLowerCase();
            const mealTypeB = Object.keys(b)[0].toLowerCase();

            return mealOrder.indexOf(mealTypeA) - mealOrder.indexOf(mealTypeB);
        });
        
        let selectedMeals = burnerMeals.map(obj => {
            const mealKey = Object.keys(obj)[0];
            const food = obj[mealKey];
            return { meal: food };
        });
        // console.log("BURNER LENGTH", burnerMeals.length)
        // console.log("selectedMeals Length", selectedMeals.length)

        fail = false;
        let val = scoreMealTotals(getMealTotals(selectedMeals), ogGoals);
        // console.log("PRev best wcore", bestScore)
        // console.log("Scored value", val);
        if (val >= bestScore) {
            console.log("BEST", burnerMeals);
            bestScore = val;
            bestResult = selectedMeals;
            // console.log("BEST RES", bestResult);
            // selectedMeals = [];
            // console.log("BEST RES", bestResult);
        }

    }
    if (fail) {
        relaxCalories += 350;
        relaxProtein += 100;
        if (i >= 2) {
            relaxFlex += 2;
        }
        relaxCarbohydrates += 200;
        relaxFats += 20;
    } else {
        break;
    }
  }

  console.log("FINAL RESULT")
  console.log(bestResult);

  // Final pruning: filter selectedMeals to ensure all goals are met, or relax constraints if needed

  return NextResponse.json({ bestResult });
}