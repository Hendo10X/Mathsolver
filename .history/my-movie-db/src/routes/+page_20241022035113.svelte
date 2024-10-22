<script lang="ts">
    import { enhance } from '$app/forms';
    import { Button } from '$lib/components/ui/button';
    import { Card } from '$lib/components/ui/card';
    import { Camera, Upload, X } from 'lucide-svelte';
    import type { Problem, SolutionResult } from '$lib/types';
    import type { ActionData } from '$lib/types';

    export let form: ActionData;

    let selectedImage: string | null = null;
    let isChecking = false;
    let result: SolutionResult | null = null;
    let dragActive = false;

    let currentProblem: Problem = {
        id: 1,
        question: "Solve the quadratic equation: x² + 5x + 6 = 0",
        difficulty: "Intermediate",
        topic: "Algebra"
    };

    function handleDragEnter(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        dragActive = true;
    }

    function handleDragLeave(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        dragActive = false;
    }

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        dragActive = false;
        
        if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }

    function handleImageUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            handleFile(input.files[0]);
        }
    }

    function handleFile(file: File) {
        const reader = new FileReader();
        reader.onload = (e) => {
            selectedImage = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }

    function clearImage() {
        selectedImage = null;
        result = null;
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

<div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-4">
        <Card class="p-6">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-bold">Math Problem Solver</h2>
                    <p class="text-gray-600">Upload your solution and get instant feedback</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {currentProblem.topic}
                    </span>
                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {currentProblem.difficulty}
                    </span>
                </div>
            </div>

            <div class="space-y-6">
                <div class="p-4 bg-gray-50 rounded-lg">
                    <h3 class="font-medium mb-2">Problem #{currentProblem.id}</h3>
                    <p>{currentProblem.question}</p>
                </div>

                {#if !selectedImage}
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div
                        class="relative"
                        on:dragenter={handleDragEnter}
                        on:dragleave={handleDragLeave}
                        on:dragover|preventDefault
                        on:drop={handleDrop}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            on:change={handleImageUpload}
                            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div class={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
                            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                            <Upload class="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p class="text-lg font-medium text-gray-700 mb-1">Drop your solution here</p>
                            <p class="text-sm text-gray-500">or click to upload</p>
                        </div>
                    </div>
                {:else}
                    <div class="relative">
                        <img
                            src={selectedImage}
                            alt="Uploaded solution"
                            class="w-full h-auto rounded-lg"
                        />
                        <button
                            on:click={clearImage}
                            class="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
                        >
                            <X class="w-5 h-5" />
                        </button>
                    </div>
                {/if}

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
                        <Button 
                            class="w-full" 
                            variant="default" 
                            disabled={isChecking}
                        >
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

                    <Button variant="outline" class="w-full" on:click={nextProblem}>
                        Next Problem
                    </Button>
                {/if}
            </div>
        </Card>
    </div>
</div>