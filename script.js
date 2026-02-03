// Load/save inputs to localStorage
document.querySelectorAll('input').forEach(input => {
  const key = input.dataset.key;
  if (!key) return;

  // Load previous value
  const saved = localStorage.getItem(key);
  if (saved) input.value = saved;

  // Save on input change
  input.addEventListener('input', () => {
    localStorage.setItem(key, input.value);
  });
});

// Optional: simple progressive overload for reps
function checkRepsAndIncreaseKg(inputKg, inputReps) {
  const reps = inputReps.value.split('x').map(x => parseInt(x));
  const lastRep = reps[1];
  if (lastRep >= 12 && inputKg.value) {
    inputKg.value = parseFloat(inputKg.value) + 1;
    localStorage.setItem(inputKg.dataset.key, inputKg.value);
    alert(`Nice! ${inputKg.dataset.key} weight increased to ${inputKg.value}kg`);
  }
}