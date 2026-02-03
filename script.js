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
