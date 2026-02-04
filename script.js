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

        // Formatteer Datum en Tijd
        const d = new Date(session.timestamp);
        const displayDate = d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'short' });
        const displayTime = d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });

        return `
        <div class="history-entry" style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 15px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05);">
            <div style="display:flex; justify-content:space-between; align-items: center; margin-bottom: 12px; gap: 10px;">
                <span style="font-weight: 700; font-size: 1.05rem; flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${session.workoutName}
                </span>
                
                <div style="background: rgba(255,255,255,0.07); padding: 4px 10px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--text-muted); white-space: nowrap;">
                    <span style="text-transform: capitalize;">${displayDate}</span>
                    <span style="opacity: 0.4;">•</span>
                    <span>${displayTime}</span>
                </div>
                
                <button onclick="deleteSingleLog(${session.timestamp})" 
                        style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 18px; padding: 0 5px; line-height: 1; transition: color 0.2s;"
                        onmouseover="this.style.color='#ff4444'" 
                        onmouseout="this.style.color='var(--text-muted)'">
                    ✕
                </button>
            </div>
            
            <div style="display: grid; gap: 8px;">
                ${relevantExercises.map(ex => {
                    const isPR = isPersonalRecord(ex.exercise, ex.weight, history, session.timestamp);
                    return `
                    <div style="display:flex; justify-content:space-between; align-items: center; font-size: 0.9rem;">
                        <span style="opacity:0.9; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 10px;">
                            ${ex.exercise} ${isPR ? '<span style="color: #ffd700; font-size: 0.75rem; margin-left: 5px;">⭐ PR</span>' : ''}
                        </span>
                        
                        <div style="font-variant-numeric: tabular-nums; display: flex; align-items: center; text-align: right;">
                            <span style="width: 30px; opacity: 0.6; margin-right: 10px;">${ex.reps}</span>
                            
                            <span style="width: 48px; text-align: right;">
                                <strong style="font-size: 1rem;">${ex.weight}</strong>
                                <span style="font-size: 0.8rem; opacity: 0.8; margin-left: -1px;">kg</span>
                            </span>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }).join('');
}

// 7. MODAL LOGICA
function deleteSingleLog(timestamp) {
    logToDelete = timestamp;
    
    const modalText = document.querySelector('#deleteModal p');
    const confirmBtn = document.querySelector('#deleteModal .confirm-btn');
    const cancelBtn = document.querySelector('#deleteModal .cancel-btn');

    if (modalText) modalText.innerText = "Wil je deze log verwijderen?";
    if (confirmBtn) confirmBtn.innerText = "Verwijder log";
    if (cancelBtn) cancelBtn.innerText = "Annuleren";

    openDeleteModal();
}

function setupClearAll() {
    logToDelete = 'all';
    
    const modalText = document.querySelector('#deleteModal p');
    const confirmBtn = document.querySelector('#deleteModal .confirm-btn');
    const cancelBtn = document.querySelector('#deleteModal .cancel-btn');

    if (modalText) modalText.innerText = "Wil je deze volledige log historie verwijderen?";
    if (confirmBtn) confirmBtn.innerText = "Verwijder volledige historie";
    if (cancelBtn) cancelBtn.innerText = "Annuleren";

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
        location.reload();
    } else if (logToDelete !== null) {
        history = history.filter(session => session.timestamp !== logToDelete);
        localStorage.setItem('workout_history', JSON.stringify(history));
        closeDeleteModal();
        renderHistory();
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