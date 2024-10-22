// src/routes/api/solution/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { imageBase64, question } = await request.json();
    const imageData = imageBase64.split(',')[1]; // Remove data URL prefix

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Please check if this solution is correct for the following math problem: ${question}\n\nProvide feedback in JSON format with 'correct' (boolean) and 'feedback' (string) fields.`,
            },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: imageData,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 1024,
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('Gemini API request failed');
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    const parsedResult = JSON.parse(resultText);

    return json({
      correct: parsedResult.correct,
      feedback: parsedResult.feedback,
    });
  } catch (error) {
    console.error('Error in solution checking:', error);
    return json(
      { correct: false, feedback: 'Error processing the solution' },
      { status: 500 }
    );
  }
};
