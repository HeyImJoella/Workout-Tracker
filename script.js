/**
 * WORKOUT TRACKER - CORE LOGIC
 */

let showOnlyPR = false;

document.addEventListener('DOMContentLoaded', () => {
    loadInputValues();
    setupStrengthLevelLinks();
    setupInputListeners();
    renderHistory();
});

// 1. Laad opgeslagen waarden uit localStorage
function loadInputValues() {
    document.querySelectorAll('input').forEach(input => {
        const key = input.dataset.key;
        if (key) {
            const saved = localStorage.getItem(key);
            if (saved) input.value = saved;
        }
    });
}

// 2. Sla waarden direct op bij typen
function setupInputListeners() {
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            const key = input.dataset.key;
            if (key) localStorage.setItem(key, input.value);
        });
    });
}

// 3. Maak oefeningen klikbaar naar StrengthLevel
function setupStrengthLevelLinks() {
    const exerciseLinks = {
        "Bench Press": "https://strengthlevel.com/strength-standards/dumbbell-bench-press/kg",
        "Pull-Ups": "https://strengthlevel.com/strength-standards/pull-ups/kg",
        "Chest Supported Row": "https://strengthlevel.com/strength-standards/chest-supported-dumbbell-row/kg",
        "Incline Fly": "https://strengthlevel.com/strength-standards/incline-dumbbell-fly/kg",
        "Lateral Raises": "https://strengthlevel.com/strength-standards/lateral-raise/kg",
        "Overhead Extension": "https://strengthlevel.com/strength-standards/dumbbell-tricep-extension/kg",
        "Incline Bicep Curl": "https://strengthlevel.com/strength-standards/incline-dumbbell-curl/kg",
        "Goblet Squat": "https://strengthlevel.com/strength-standards/goblet-squat/kg",
        "Bulgarian Split Squat": "https://strengthlevel.com/strength-standards/dumbbell-bulgarian-split-squat/kg",
        "Romanian Deadlift": "https://strengthlevel.com/strength-standards/dumbbell-romanian-deadlift/kg",
        "Hamstring Curl": "https://strengthlevel.com/strength-standards/hamstring-curl/kg",
        "Calf Raises": "https://strengthlevel.com/strength-standards/dumbbell-calf-raise/kg",
        "Decline Sit-Up": "https://strengthlevel.com/strength-standards/decline-sit-up/kg",
        "Incline Bench Press": "https://strengthlevel.com/strength-standards/incline-dumbbell-press/kg",
        "Chin-Ups": "https://strengthlevel.com/strength-standards/chin-ups/kg",
        "Close Grip Press": "https://strengthlevel.com/strength-standards/close-grip-dumbbell-bench-press/kg",
        "Rear Delt Fly": "https://strengthlevel.com/strength-standards/rear-delt-fly/kg",
        "Skull Crusher": "https://strengthlevel.com/strength-standards/lying-dumbbell-tricep-extension/kg",
        "Incline Hammer Curl": "https://strengthlevel.com/strength-standards/hammer-curl/kg"
    };

    document.querySelectorAll('table tbody tr td:first-child').forEach(td => {
        const name = td.textContent.trim();
        if (exerciseLinks[name]) {
            td.style.cursor = "pointer";
            td.style.textDecoration = "underline";
            td.addEventListener('click', () => window.open(exerciseLinks[name], '_blank'));
        }
    });
}

// 4. Workout sessie opslaan
function logWorkoutSesssie(button) {
    const card = button.closest('.workout-card');
    const workoutName = card.querySelector('h2').innerText;
    const rows = card.querySelectorAll('tbody tr');
    const date = new Date().toLocaleDateString('nl-NL');
    
    let sessionEntries = [];
    rows.forEach(row => {
        const exercise = row.cells[0].innerText;
        const repsInput = row.querySelector('input[data-key*="-reps"]');
        const kgInput = row.querySelector('input[data-key*="-kg"]');

        if (kgInput && kgInput.value) {
            sessionEntries.push({
                exercise: exercise,
                reps: repsInput ? repsInput.value : "?",
                weight: kgInput.value
            });
        }
    });

    if (sessionEntries.length === 0) return;

    let history = JSON.parse(localStorage.getItem('workout_history')) || [];
    history.push({
        date: date,
        timestamp: new Date().getTime(),
        workoutName: workoutName,
        exercises: sessionEntries
    });
    
    localStorage.setItem('workout_history', JSON.stringify(history));

    // Visuele feedback op knop
    const originalText = button.innerText;
    button.innerText = "Opgeslagen! ✅";
    button.style.backgroundColor = "#10b981";
    setTimeout(() => {
        button.innerText = originalText;
        button.style.backgroundColor = "";
    }, 1000);

    renderHistory();
}

// 5. Records Filter Toggle
function togglePR() {
    showOnlyPR = !showOnlyPR;
    const btn = document.getElementById('pr-button');
    
    if (btn) {
        btn.classList.toggle('active', showOnlyPR);
        
        if (showOnlyPR) {
            // De 'tertiaire' staat: subtieler en geeft aan dat je terug kunt
            btn.innerHTML = "✕ Record filter uit";
        } else {
            // De normale staat
            btn.innerHTML = "Show Records 🏆";
        }
    }
    renderHistory();
}

// 6. Historie Renderen
function renderHistory() {
    const container = document.getElementById('history-content');
    if (!container) return;

    const history = JSON.parse(localStorage.getItem('workout_history')) || [];
    updateExerciseDropdown(history);

    if (history.length === 0) {
        container.innerHTML = '<p style="padding:20px; opacity:0.5; text-align:center;">Nog geen historie beschikbaar.</p>';
        return;
    }

    const exFilter = document.getElementById('filter-exercise').value;
    const monthFilter = document.getElementById('filter-month').value;
    const yearFilter = document.getElementById('filter-year').value;

    let filtered = history.filter(session => {
        const d = new Date(session.timestamp);
        const matchesMonth = monthFilter === 'all' || d.getMonth().toString() === monthFilter;
        const matchesYear = yearFilter === 'all' || d.getFullYear().toString() === yearFilter;
        return matchesMonth && matchesYear;
    });

    filtered.sort((a, b) => b.timestamp - a.timestamp);

    container.innerHTML = filtered.map(session => {
        const relevantExercises = session.exercises.filter(ex => {
            const matchesEx = (exFilter === 'all' || ex.exercise === exFilter);
            if (showOnlyPR) {
                return matchesEx && isPersonalRecord(ex.exercise, ex.weight, history, session.timestamp);
            }
            return matchesEx;
        });

        if (relevantExercises.length === 0) return '';

        return `
            <div class="history-entry">
                <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
                    <span style="font-weight: 700;">${session.workoutName}</span>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">${session.date}</span>
                </div>
                <div style="display: grid; gap: 8px;">
                    ${relevantExercises.map(ex => {
                        const isPR = isPersonalRecord(ex.exercise, ex.weight, history, session.timestamp);
                        return `
                        <div style="display:flex; justify-content:space-between; align-items: center;">
                            <span style="opacity:0.9;">${ex.exercise} ${isPR ? '⭐' : ''}</span>
                            <span>
                                <span style="margin-right: 4px;">${ex.reps}</span>
                                <strong>${ex.weight} kg</strong>
                            </span>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
    }).join('');
}

function isPersonalRecord(exercise, weight, history, currentTS) {
    const prevBest = history
        .filter(s => s.timestamp < currentTS)
        .flatMap(s => s.exercises)
        .filter(ex => ex.exercise === exercise)
        .reduce((max, ex) => Math.max(max, parseFloat(ex.weight)), 0);
    return parseFloat(weight) > prevBest && prevBest > 0;
}

function updateExerciseDropdown(history) {
    const dropdown = document.getElementById('filter-exercise');
    if (!dropdown || dropdown.options.length > 1) return;

    const exercises = [...new Set(history.flatMap(s => s.exercises.map(ex => ex.exercise)))].sort();
    let html = '<option value="all">Alle Oefeningen</option>';
    exercises.forEach(ex => html += `<option value="${ex}">${ex}</option>`);
    dropdown.innerHTML = html;
}

// Modal functies
function openDeleteModal() {
    document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

function clearAllHistory() {
    // Verwijder alleen de historie uit localStorage
    localStorage.removeItem('workout_history');
    
    // Sluit de modal
    closeDeleteModal();
    
    // Ververs de lijst (zodat de "Nog geen historie" melding verschijnt)
    // En herlaad de pagina om de dropdowns (oefeningen) ook te resetten
    location.reload(); 
}

// Sluit de modal als je buiten het witte vlak klikt
window.onclick = function(event) {
    const modal = document.getElementById('deleteModal');
    if (event.target == modal) {
        closeDeleteModal();
    }
}