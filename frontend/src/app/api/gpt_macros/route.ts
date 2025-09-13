import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Initialize the OpenAI client with the API key from environment variables
// This is done once when the server starts, and reused for all requests
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define a type for the incoming request data for better type-safety
interface UserProfile {
  height: number;
  weight: number;
  gender: string;
  age: number;
  goal: string;
  description: string;
}

export async function POST(req: NextRequest) {
  // Check if the OpenAI API key is configured on the server
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: { message: "OpenAI API key not configured." } },
      { status: 500 }
    );
  }

  try {
    // Parse the request body
    const body: UserProfile = await req.json();
    const { height, weight, gender, age, goal, description } = body;

    // Basic validation to ensure all required fields are present
    if (!height || !weight || !gender || !age || !goal || !description) {
      return NextResponse.json(
        { error: { message: "Missing required fields. Please provide height, weight, gender, age, goal, and description." } },
        { status: 400 }
      );
    }

    // System prompt to set the persona and desired output format for the AI
    const system_prompt = `
      You are an expert nutritionist and personal trainer. Your task is to calculate the daily
      macronutrient and caloric needs for a user based on their personal data and goals.
      Analyze the provided information and respond ONLY with a valid JSON object containing
      the recommended calories, protein, carbohydrates, and fat, along with a brief
      justification for your recommendations. Do not include any text outside of the JSON object.
      The JSON object should have the following structure:
      {
        "calories": <integer>,
        "protein": <integer>,
        "carbs": <integer>,
        "fat": <integer>,
        "reasoning": "<string>"
      }
    `;

    // User data prompt constructed from the request body
    const user_data_prompt = `
      Please calculate the nutritional targets for the following user:
      - Height: ${height} cm
      - Weight: ${weight} kg
      - Gender: ${gender}
      - Age: ${age} years
      - Primary Goal: ${goal}
      - Additional Notes & Dietary Wants: "${description}"
    `;

    // Make the API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini-2025-08-07",
      messages: [
        { "role": "system", "content": system_prompt },
        { "role": "user", "content": user_data_prompt }
      ],
      temperature: 0.2,
      response_format: { "type": "json_object" }
    });

    const content = completion.choices[0].message.content;
    const macros = JSON.parse(content as string);

    // Send the successful response back to the client
    return NextResponse.json(macros);

  } catch (error) {
    // Handle potential errors from the API call or JSON parsing
    console.error("Error in generate-macros route:", error);
    return NextResponse.json(
      { error: { message: 'An internal server error occurred.' } },
      { status: 500 }
    );
  }
}
