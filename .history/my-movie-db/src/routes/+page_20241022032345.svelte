<script lang="ts">
    import { enhance } from '$app/forms';
    import { Button } from '$lib/components/ui/button';
    import { Card } from '$lib/components/ui/card';
    import { Camera } from 'lucide-svelte';
    import type { Problem, SolutionResult } from '$lib/types';
    import type { ActionData } from '$lib/types';

    export let form: ActionData;

    let selectedImage: string | null = null;
    let isChecking = false;
    let result: SolutionResult | null = null;

    let currentProblem: Problem = {
        id: 1,
        question: "Solve the quadratic equation: x² + 5x + 6 = 0",
        difficulty: "Intermediate",
        topic: "Algebra"
    };

    function handleImageUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                selectedImage = e.target?.result as string;
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    function nextProblem() {
        currentProblem = {
            id: currentProblem.id + 1,
            question: "Find the derivative of f(x) = x³ - 2x² + 4x - 1",
            difficulty: "Advanced",
            topic: "Calculus"
        };
        selectedImage = null;
        result = null;
    }
</script>

<div class="max-w-2xl mx-auto p-4 space-y-4">
    <Card class="p-6">
        <!-- Previous card header and content remains the same -->

        {#if selectedImage && !result}
            <form
                method="POST"
                action="?/checkSolution"
                use:enhance={() => {
                    isChecking = true;
                    return async ({ update }) => {
                        await update();
                        isChecking = false;
                        if (form?.result) {
                            result = form.result;
                        }
                    };
                }}
            >
                <input type="hidden" name="image" value={selectedImage} />
                <input type="hidden" name="problem" value={JSON.stringify(currentProblem)} />
                <Button class="w-full" type="submit" disabled={isChecking}>
                    {isChecking ? "Checking solution..." : "Check My Solution"}
                </Button>
            </form>
        {/if}

        {#if result}
            <div class={`p-4 rounded-lg ${result.correct ? 'bg-green-50' : 'bg-red-50'}`}>
                <h3 class={`font-medium mb-2 ${result.correct ? 'text-green-800' : 'text-red-800'}`}>
                    {result.correct ? 'Correct!' : 'Not quite right'}
                </h3>
                <p class={result.correct ? 'text-green-700' : 'text-red-700'}>
                    {result.feedback}
                </p>
            </div>

            <Button class="w-full" on:click={nextProblem}>
                Next Problem
            </Button>
        {/if}
    </Card>
</div>