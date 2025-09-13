import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define a type for the new, simplified incoming request data
interface UserProfile {
  height: number;
  weight: number;
  goals: string; // Combined field for goal and description
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: { message: "OpenAI API key not configured." } },
      { status: 500 }
    );
  }

  try {
    const body: UserProfile = await req.json();
    const { height, weight, goals } = body;

    // Updated validation for the new, simpler fields
    if (!height || !weight || !goals) {
      return NextResponse.json(
        { error: { message: "Missing required fields. Please provide height, weight, and goals." } },
        { status: 400 }
      );
    }

    // Updated system prompt to handle missing data and match frontend types
    const system_prompt = `
      You are an expert nutritionist. Your task is to calculate daily macronutrient needs
      based on the user's height, weight, and goals. Since you are not given age or gender,
      make a reasonable assumption (e.g., a moderately active young adult) unless the user's
      goals specify otherwise.
      Respond ONLY with a valid JSON object. Do not include any text outside of the JSON object.
      The JSON object must have the following structure, using these exact keys:
      {
        "calories": <integer>,
        "protein_grams": <integer>,
        "carbs_grams": <integer>,
        "fat_grams": <integer>,
        "reasoning": "<a 1-sentence justification for your recommendations>"
      }
    `;

    // Updated user data prompt using the simplified 'goals' string
    const user_data_prompt = `
      Please calculate the nutritional targets for the following user:
      - Height: ${height} cm
      - Weight: ${weight} kg
      - Goals and Dietary Notes: "${goals}"
    `;

    // Make the API call to OpenAI - 'temperature' parameter has been removed
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { "role": "system", "content": system_prompt },
        { "role": "user", "content": user_data_prompt }
      ],
      response_format: { "type": "json_object" }
    });

    const content = completion.choices[0].message.content;
    const macros = JSON.parse(content as string);

    return NextResponse.json(macros);

  } catch (error) {
    console.error("Error in generate-macros route:", error);
    return NextResponse.json(
      { error: { message: 'An internal server error occurred.' } },
      { status: 500 }
    );
  }
}

