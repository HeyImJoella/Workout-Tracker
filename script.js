// Light/Dark mode based on system preference
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
document.body.classList.add(prefersDark ? 'dark' : 'light');

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    document.body.classList.toggle('dark', e.matches);
    document.body.classList.toggle('light', !e.matches);
});

// LocalStorage for weights AND reps
document.querySelectorAll('input').forEach(input => {
    const key = input.dataset.key;
    if(!key) return;

    // Load saved value
    const saved = localStorage.getItem(key);
    if(saved) input.value = saved;

    // Save on change
    input.addEventListener('input', () => {
        localStorage.setItem(key, input.value);
    });
});

// Optional: simple progressive overload helper
// Call this function when je klaar bent met een set
function checkRepsAndIncreaseKg(inputKg, inputReps) {
    const reps = inputReps.value.split('x').map(x => parseInt(x)); // bv "3x12" => [3,12]
    const lastRep = reps[1]; // laatste reps per set
    if(lastRep >= 12) {
        inputKg.value = parseFloat(inputKg.value) + 1; // verhoog 1 kg
        localStorage.setItem(inputKg.dataset.key, inputKg.value);
        alert(`Nice! ${inputKg.dataset.key} weight increased to ${inputKg.value}kg`);
    }
}

<script>
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Voeg 'dark' of 'light' class toe aan body
  document.body.classList.add(prefersDark ? 'dark' : 'light');

  // Optioneel: luister naar veranderingen in systeem
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(e.matches ? 'dark' : 'light');
  });
</script>