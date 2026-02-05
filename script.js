/**
 * WORKOUT TRACKER - CORE LOGIC
 */
let showOnlyPR = false;
let logToDelete = null; 

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
        timestamp: new Date().getTime(),
        workoutName: workoutName,
        exercises: sessionEntries
    });
    
    localStorage.setItem('workout_history', JSON.stringify(history));

    const originalText = button.innerText;
    button.innerText = "Opgeslagen!";
    button.style.backgroundColor = "var(--text-main)";
    button.style.color = "var(--bg-card)";
    setTimeout(() => {
        button.innerText = originalText;
        button.style.backgroundColor = "";
        button.style.color = "";
    }, 1000);

    renderHistory();
}

// 5. Records Filter Toggle
function togglePR() {
    showOnlyPR = !showOnlyPR;
    const btn = document.getElementById('pr-button');
    if (btn) {
        btn.classList.toggle('active', showOnlyPR);
        btn.innerHTML = showOnlyPR ? "✕ Record filter uit" : "Show Records 🏆";
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
        container.innerHTML = '<p style="padding:40px; opacity:0.5; text-align:center;">Nog geen historie beschikbaar.</p>';
        return;
    }

    const exFilter = document.getElementById('filter-exercise')?.value || 'all';
    const monthFilter = document.getElementById('filter-month')?.value || 'all';
    const yearFilter = document.getElementById('filter-year')?.value || 'all';

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

        // 1. Formatteer de datum (bijv. Tue 4 Feb)
        const d = new Date(session.timestamp);
        const displayDate = d.toLocaleDateString('en-GB', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
        });

        // 2. De return statement van de map functie (vervangen vanaf de span met displayDate)
        // VERVANG het return gedeelte in renderHistory() door dit:
        // VERVANG het return gedeelte in renderHistory() door dit:
        return `
        <div class="history-entry">
            <div class="history-header">
                <span class="history-workout-title">
                    ${session.workoutName}
                </span>
                
                <div class="history-date-tag">
                    <span>${displayDate}</span>
                </div>
                
                <button class="delete-log-btn" onclick="deleteSingleLog(${session.timestamp})">
                    ✕
                </button>
            </div>
            
            <div class="history-exercises-list">
                ${relevantExercises.map(ex => {
                    const isPR = isPersonalRecord(ex.exercise, ex.weight, history, session.timestamp);
                    return `
                    <div class="exercise-row">
                        <span class="exercise-name">
                            ${ex.exercise} ${isPR ? '<span class="pr-star">⭐ PR</span>' : ''}
                        </span>
                        
                        <div class="exercise-stats">
                            <span class="exercise-reps">${ex.reps}</span>
                            <span class="exercise-weight">
                                <strong>${ex.weight}</strong>
                                <span class="unit">kg</span>
                            </span>
                        </div>
                    </div>`;
                }).join('')}
            </div>
</div>`;
    }).join('');
}

// 7. MODAL LOGICA
// Voor één enkele log
function deleteSingleLog(timestamp) {
    logToDelete = timestamp;
    
    const modalTitle = document.querySelector('#deleteModal h3');
    const modalText = document.querySelector('#deleteModal p');
    const confirmBtn = document.querySelector('#deleteModal .confirm-btn');

    if (modalTitle) modalTitle.innerText = "Log verwijderen";
    if (modalText) modalText.innerText = "Wil je deze specifieke training verwijderen?";
    if (confirmBtn) confirmBtn.innerText = "Wissen";

    openDeleteModal();
}

// Voor alle logs tegelijk
function setupClearAll() {
    logToDelete = 'all';
    
    const modalTitle = document.querySelector('#deleteModal h3');
    const modalText = document.querySelector('#deleteModal p');
    const confirmBtn = document.querySelector('#deleteModal .confirm-btn');

    if (modalTitle) modalTitle.innerText = "Alle logs wissen";
    if (modalText) modalText.innerText = "Alle training worden definitief gewist.";
    if (confirmBtn) confirmBtn.innerText = "Wissen";

    openDeleteModal();
}

function openDeleteModal() { 
    document.getElementById('deleteModal').style.display = 'flex'; 
}

function closeDeleteModal() { 
    document.getElementById('deleteModal').style.display = 'none'; 
    logToDelete = null; 
}

function confirmDeletion() {
    let history = JSON.parse(localStorage.getItem('workout_history')) || [];
    
    if (logToDelete === 'all') {
        localStorage.removeItem('workout_history');
        location.reload(); // Herlaad alles voor een schone lei
    } else if (logToDelete !== null) {
        // Filter de specifieke log eruit
        history = history.filter(session => session.timestamp !== logToDelete);
        localStorage.setItem('workout_history', JSON.stringify(history));
        
        closeDeleteModal(); // Sluit de modal
        renderHistory();    // Update de lijst op je scherm
    }
}

// 8. HELPERS
function isPersonalRecord(exercise, weight, history, currentTS) {
    const prevBest = history
        .filter(s => s.timestamp < currentTS)
        .flatMap(s => s.exercises)
        .filter(ex => ex.exercise === exercise)
        .reduce((max, ex) => Math.max(max, parseFloat(ex.weight)), 0);
    
    const currentWeight = parseFloat(weight);
    return currentWeight > prevBest && prevBest > 0;
}

function updateExerciseDropdown(history) {
    const dropdown = document.getElementById('filter-exercise');
    if (!dropdown || dropdown.options.length > 1) return;
    const exercises = [...new Set(history.flatMap(s => s.exercises.map(ex => ex.exercise)))].sort();
    let html = '<option value="all">Alle Oefeningen</option>';
    exercises.forEach(ex => html += `<option value="${ex}">${ex}</option>`);
    dropdown.innerHTML = html;
}

window.onclick = function(event) {
    const modal = document.getElementById('deleteModal');
    if (event.target == modal) closeDeleteModal();
}