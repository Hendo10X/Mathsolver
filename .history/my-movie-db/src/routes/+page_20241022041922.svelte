<script lang="ts">
    import { enhance } from '$app/forms';
    import { Button } from '$lib/components/ui/button';
    import { Card } from '$lib/components/ui/card';
    import { Upload, X } from 'lucide-svelte';
    import type { Problem, SolutionResult } from '$lib/types';
    import type { ActionData } from '$lib/types';

    export let form: ActionData;

    // Gemini API configuration
    const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';

    let selectedImage: string | null = null;
    let isChecking = false;
    let result: SolutionResult | null = null;
    let dragActive = false;

    // Math problem generation
    const topics = ['Algebra', 'Calculus', 'Geometry', 'Trigonometry'];
    const difficulties = ['Basic', 'Intermediate', 'Advanced'];

    const problemTemplates = {
        Algebra: {
            Basic: [
                "Solve for x: {a}x + {b} = {c}",
                "Simplify: {a}x + {b}x + {c}",
            ],
            Intermediate: [
                "Solve the quadratic equation: {a}x² + {b}x + {c} = 0",
                "Factor: {a}x² + {b}x + {c}",
            ],
            Advanced: [
                "Solve the system of equations:\n{a}x + {b}y = {c}\n{d}x + {e}y = {f}",
                "Find the domain of: ({a}x + {b}) / ({c}x + {d})",
            ]
        },
        // Add more templates for other topics...
    };

    function generateRandomProblem(): Problem {
        const topic = topics[Math.floor(Math.random() * topics.length)];
        const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        
        // Generate random coefficients
        const coefficients = {
            a: Math.floor(Math.random() * 10) + 1,
            b: Math.floor(Math.random() * 10) - 5,
            c: Math.floor(Math.random() * 10) - 5,
            d: Math.floor(Math.random() * 10) + 1,
            e: Math.floor(Math.random() * 10) - 5,
            f: Math.floor(Math.random() * 10) - 5,
        };
        // Get templates for selected topic and difficulty
        const templates = problemTemplates[topic as keyof typeof problemTemplates]?.[difficulty as keyof typeof problemTemplates[keyof typeof problemTemplates]] || ["Solve: x + 1 = 0"];
        let question = templates[Math.floor(Math.random() * templates.length)];

        // Replace placeholders with random coefficients
        Object.entries(coefficients).forEach(([key, value]) => {
            question = question.replace(new RegExp(`{${key}}`, 'g'), value.toString());
        });

        return {
            id: Math.floor(Math.random() * 1000) + 1,
            question,
            difficulty: difficulty as "Basic" | "Intermediate" | "Advanced",
            topic
        };
    }

    let currentProblem: Problem = generateRandomProblem();

    async function checkSolutionWithGemini(imageBase64: string, problem: Problem) {
        const imageData = imageBase64.split(',')[1]; // Remove data URL prefix

        const requestBody = {
            contents: [{
                parts: [
                    {
                        text: `Please check if this solution is correct for the following math problem: ${problem.question}\n\nProvide feedback in JSON format with 'correct' (boolean) and 'feedback' (string) fields.`
                    },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: imageData
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.4,
                topK: 32,
                topP: 1,
                maxOutputTokens: 1024,
            }
        };

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error('Gemini API request failed');
            }

            const data = await response.json();
            const resultText = data.candidates[0].content.parts[0].text;
            
            try {
                // Parse the JSON response from Gemini
                const parsedResult = JSON.parse(resultText);
                return {
                    correct: parsedResult.correct,
                    feedback: parsedResult.feedback
                };
            } catch (e) {
                // Fallback if JSON parsing fails
                return {
                    correct: resultText.toLowerCase().includes('correct'),
                    feedback: resultText
                };
            }
        } catch (error) {
            console.error('Error checking solution:', error);
            return {
                correct: false,
                feedback: 'Sorry, there was an error checking your solution. Please try again.'
            };
        }
    }

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

    async function handleSubmit() {
        if (!selectedImage) return;
        
        isChecking = true;
        result = await checkSolutionWithGemini(selectedImage, currentProblem);
        isChecking = false;
    }

    function nextProblem() {
        currentProblem = generateRandomProblem();
        selectedImage = null;
        result = null;
    }
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center py-8">
    <div class="w-full max-w-2xl mx-auto px-4">
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
                    <Button 
                        class="w-full" 
                        variant="default" 
                        on:click={handleSubmit}
                        disabled={isChecking}
                    >
                        {isChecking ? "Checking solution..." : "Check My Solution"}
                    </Button>
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