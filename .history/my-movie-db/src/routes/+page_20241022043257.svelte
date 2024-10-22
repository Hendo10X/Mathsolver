<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Card } from '$lib/components/ui/card';
    import { Upload, X } from 'lucide-svelte';
    import type { Problem, SolutionResult } from '$lib/types';
  
    let selectedImage: string | null = null;
    let isChecking = false;
    let result: SolutionResult | null = null;
  
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
  
    async function handleSubmit(problem: Problem) {
      if (!selectedImage) return;
      isChecking = true;
  
      try {
        const res = await fetch('/api/solution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: selectedImage, question: problem.question }),
        });
  
        const data = await res.json();
        result = data;
      } catch (error) {
        console.error('Error checking solution:', error);
        result = { correct: false, feedback: 'An error occurred. Try again.' };
      } finally {
        isChecking = false;
      }
    }
  </script>
  
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-8">
    <div class="w-full max-w-2xl mx-auto px-4">
      <Card class="p-6">
        <h2 class="text-2xl font-bold mb-4">Math Problem Solver</h2>
  
        <input type="file" accept="image/*" on:change={handleImageUpload} />
  
        {#if selectedImage}
          <img src={selectedImage} alt="Uploaded solution" class="w-full h-auto rounded-lg mt-4" />
        {/if}
        <!-- svelte-ignore missing-declaration -->
        <Button on:click={() => handleSubmit(problem)} disabled={isChecking} class="mt-4">
          {isChecking ? 'Checking...' : 'Check Solution'}
        </Button>
        {#if result}
          <div class={`mt-4 p-4 rounded-lg ${result.correct ? 'bg-green-50' : 'bg-red-50'}`}>
            <h3 class={`${result.correct ? 'text-green-800' : 'text-red-800'}`}>
              {result.correct ? 'Correct!' : 'Incorrect'}
            </h3>
            <p>{result.feedback}</p>
          </div>
        {/if}
      </Card>
    </div>
  </div>
  