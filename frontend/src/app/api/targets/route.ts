import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Food from '@/models/food';


// Helper to compute totals for selectedMeals
function getMealTotals(selectedMeals: any[]) {
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
    const { money, macros, calories, restrictions } = await req.json();

    // Set goals based on initial constraints
    const goals = {
        money,
        protein: macros.protein,
        calories,
        carbohydrates: macros.carbohydrates,
        fat: macros.fat,
    };


  let relaxCalories = 0;
  let relaxProtein = 0;
  let relaxFlex = 0;
  let relaxCarbohydrates = 0;
  let relaxFats = 0;
  let selectedMeals: any[] = [];
  let bestResult: any[] = [];
  let bestScore = -10000;
  for (let i: number = 0; i < 5; i++) {
    // 5 stages of relaxing constraints
    let fail = true;
    let prunedFoods = await Food.find({ blacklisted: { $ne: true } });
    for (let j: number = 0; j < 1000; j++) {
        let remainingFlex = money + relaxFlex;
        let remainingProtein = macros.protein + relaxProtein;
        let remainingCalories = calories + relaxCalories;
        let remainingCarbs = macros.carbohydrates + relaxCarbohydrates;
        let remainingFat = macros.fat + relaxFats;
        selectedMeals = [];
        let finished = true;
        for (const meal of restrictions) {
            // Query for foods that fit this meal, flex, protein, and calorie constraints, and are not blacklisted
            const foods = prunedFoods
                .filter(food => food.meal_type.includes(meal))
                .filter(food => food.money <= remainingFlex)
                .filter(food => food.calories <= remainingCalories)
                .filter(food => (food.macros.protein) <= remainingProtein) // assumes food.price exists
                .filter(food => (food.macros.carbohydrates) <= remainingCarbs)
                .filter(food => (food.macros.fat) <= remainingFat);

            if (foods.length > 0) {
                let food;
                // If this is the last meal in restrictions, pick the food with the highest protein
                if (meal === restrictions[restrictions.length - 1]) {
                    food = foods.sort((a, b) => b.macros.protein - a.macros.protein)[0];
                } else {
                    food = foods[Math.floor(Math.random() * foods.length)];
                }
                selectedMeals.push({ meal: food });
                // Update remaining constraints
                remainingFlex -= food.money;
                remainingProtein -= food.macros.protein;
                remainingCalories -= food.calories;
                remainingCarbs -= food.macros.carbohydrates;
                remainingFat -= food.macros.fat;
            } else {
                finished = false;
            }
        }
        if (!finished) {
            continue;
        }
        fail = false;
        let val = scoreMealTotals(getMealTotals(selectedMeals), goals);
        if (val >= bestScore) {
            bestScore = val;
            bestResult = selectedMeals;
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

  // Final pruning: filter selectedMeals to ensure all goals are met, or relax constraints if needed

  return NextResponse.json({ bestResult });
}