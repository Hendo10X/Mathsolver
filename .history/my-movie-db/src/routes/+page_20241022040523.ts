import type { SolutionResult } from '$lib/types';

export interface ActionData {
    success: boolean;
    data: {
        result: SolutionResult;
    };
}
