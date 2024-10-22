import { GEMINI_API_KEY } from '$env/static/private';
import type { Problem, SolutionResult } from '$lib/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function checkSolution(imageBase64: string, problem: Problem) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    const prompt = `You are a math teacher checking a student's solution to this problem: "${problem.question}". 
    Analyze the handwritten solution in the image and determine:
    1. Is the solution correct?
    2. Are the steps clearly shown?
    3. What feedback would you give?
    
    Respond in JSON format with two fields:
    - correct: boolean
    - feedback: string (detailed explanation)`;

    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64.split(',')[1]
            }
        }
    ]);

    const response = result.response;
    const text = response.text();
    
    try {
        return JSON.parse(text) as SolutionResult;
    } catch (e) {
        return {
            correct: false,
            feedback: "Sorry, there was an error analyzing your solution. Please try again."
        };
    }
}

