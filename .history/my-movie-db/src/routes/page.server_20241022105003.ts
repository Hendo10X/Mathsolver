import { checkSolution } from '$lib/server/gemini';
import type { Problem, SolutionResult } from '$lib/types';
import { error, type Actions } from '@sveltejs/kit';

export const load = async () => {
    return {};
};

export const actions = {
    checkSolution: async ({ request }) => {
        const data = await request.formData();
        const imageBase64 = data.get('image') as string;
        const problemJson = data.get('problem') as string;
        
        if (!imageBase64 || !problemJson) {
            throw error(400, 'Missing required data');
        }

        const problem = JSON.parse(problemJson) as Problem;
        try {
            const result = await checkSolution(imageBase64, problem);
            return {
                solutionResult: result
            };
        } catch (e) {
            throw error(500, 'Failed to check solution');
        }
    }
} satisfies Actions;