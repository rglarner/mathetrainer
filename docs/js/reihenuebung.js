// JavaScript für die Reihenübung

document.addEventListener("DOMContentLoaded", function() {
    const multiplicationCheckbox = document.getElementById("multiplication");
    const divisionCheckbox = document.getElementById("division");
    const rangeContainer = document.getElementById("rangeContainer");
    const maxFactorSelect = document.getElementById("maxFactor");
    const questionCountInput = document.getElementById("questionCount");
    const timeMinutesSelect = document.getElementById("timeMinutes");
    const timeSecondsSelect = document.getElementById("timeSeconds");
    const startButton = document.getElementById("startButton");
    const messageBox = document.getElementById("errorMessage");
    const timerDisplay = document.getElementById("timer");
    const resultDisplay = document.getElementById("correctAnswers");
    const exerciseArea = document.getElementById("exerciseArea");
    const questionsContainer = document.getElementById("questions");
    const submitAnswersBtn = document.getElementById("submitAnswers");
    const resultArea = document.getElementById("resultArea");
    const restartButton = document.getElementById("restartButton");

    let timer;
    let totalQuestions = 0;
    let correctAnswers = 0;
    let timeLeft = 0; // in Sekunden

    // sicherer Default für maxFactor falls HTML nicht gesetzt
    if (!maxFactorSelect.value) maxFactorSelect.value = "10";

    function getSelectedRows() {
        return Array.from(rangeContainer.querySelectorAll('input[name="rangeOption"]:checked'))
            .map(cb => parseInt(cb.value, 10))
            .filter(n => Number.isInteger(n) && n >= 1 && n <= 12);
    }

    function validateInputs() {
        const selectedRows = getSelectedRows();
        const maxFactor = parseInt(maxFactorSelect.value, 10);
        const questionCount = parseInt(questionCountInput.value, 10);
        const minutes = parseInt(timeMinutesSelect.value, 10);
        const seconds = parseInt(timeSecondsSelect.value, 10);

        const minutesOk = Number.isInteger(minutes) && minutes >= 0 && minutes <= 20;
        const secondsOk = Number.isInteger(seconds) && seconds >= 0 && seconds <= 59;
        const totalSec = (Number.isInteger(minutes) ? minutes : 0) * 60 + (Number.isInteger(seconds) ? seconds : 0);
        const timeOk = totalSec >= 1 && totalSec <= 20 * 60;

        if ((multiplicationCheckbox.checked || divisionCheckbox.checked) &&
            selectedRows.length > 0 &&
            Number.isInteger(maxFactor) && maxFactor >= 1 && maxFactor <= 12 &&
            Number.isInteger(questionCount) && questionCount >= 1 && questionCount <= 100 &&
            minutesOk && secondsOk && timeOk) {
            startButton.disabled = false;
            messageBox.textContent = "";
        } else {
            startButton.disabled = true;
            messageBox.textContent = "Bitte überprüfen Sie Ihre Eingaben. Wählen Sie mindestens eine Reihe und füllen Sie alle Felder korrekt aus.";
        }
    }

    function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateQuestions() {
        questionsContainer.innerHTML = "";
        const selectedRows = getSelectedRows();
        const maxFactor = parseInt(maxFactorSelect.value, 10);
        const includeMul = multiplicationCheckbox.checked;
        const includeDiv = divisionCheckbox.checked;

        for (let i = 0; i < totalQuestions; i++) {
            // wähle zufällig Multiplikation oder Division, falls beide ausgewählt
            let mode;
            if (includeMul && includeDiv) {
                mode = Math.random() < 0.5 ? "mul" : "div";
            } else if (includeMul) {
                mode = "mul";
            } else {
                mode = "div";
            }

            // operand1 = ein Element aus ausgewählten Reihen (z.B. 3)
            const row = selectedRows[randInt(0, selectedRows.length - 1)];

            let left, right, display;
            if (mode === "mul") {
                // left = row, right = 1..maxFactor
                left = row;
                right = randInt(1, maxFactor);
                display = `${left} × ${right} = `;
            } else {
                // Division: divisor = row, quotient = 1..maxFactor, dividend = divisor * quotient
                const divisor = row;
                const quotient = randInt(1, maxFactor);
                left = divisor * quotient; // dividend
                right = divisor; // divisor
                display = `${left} ÷ ${right} = `;
            }

            const qDiv = document.createElement("div");
            qDiv.className = "w3-margin-bottom";

            const label = document.createElement("label");
            label.className = "w3-margin-right";
            label.textContent = display;

            const input = document.createElement("input");
            // iOS: inputmode + pattern sorgen für die numerische Tastatur
            // type="number" beibehalten für semantische Bewertung, alternativ type="tel" wenn iOS Volltastatur zeigt
            input.type = "tel";
            input.setAttribute('inputmode', 'numeric');
            input.setAttribute('pattern', '[0-9]*');
            input.setAttribute('enterkeyhint', 'next');
            input.setAttribute('autocomplete', 'off');
            input.min = '0';
            input.step = '1';
            input.className = "w3-input w3-inline";
            input.style.maxWidth = "120px";
            if (mode === "mul") {
                input.dataset.answer = String(left * right);
            } else {
                input.dataset.answer = String(left / right);
            }
            input.addEventListener("input", () => {
                if (input.value && !/^-?\d+$/.test(input.value)) {
                    input.value = input.value.replace(/[^\d-]/g, '');
                }
            });

            // Neu: Enter verhält sich wie Tab — Fokus auf nächstes Eingabefeld (oder Button)
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    const allInputs = Array.from(questionsContainer.querySelectorAll('input[type="number"]'));
                    const idx = allInputs.indexOf(e.target);
                    const nextInput = allInputs[idx + 1];
                    if (nextInput) {
                        // kurzer Timeout, damit Browser-Default vollständig verhindert wurde
                        setTimeout(() => {
                            try { nextInput.focus(); if (typeof nextInput.select === 'function') nextInput.select(); } catch (_) {}
                        }, 0);
                    } else {
                        // Wenn keine weitere Eingabe vorhanden, fokussiere "Antworten einreichen"
                        try { submitAnswersBtn.focus(); } catch (_) {}
                    }
                }
            });

            qDiv.appendChild(label);
            qDiv.appendChild(input);
            questionsContainer.appendChild(qDiv);
        }
    }

    function evaluateAnswers() {
        correctAnswers = 0;
        const inputs = questionsContainer.querySelectorAll('input[type="number"]');
        inputs.forEach(inp => {
            const expected = parseInt(inp.dataset.answer, 10);
            const provided = parseInt(inp.value, 10);
            if (Number.isInteger(provided) && provided === expected) correctAnswers++;
        });
    }

    function endExercise() {
        clearInterval(timer);
        // disable inputs
        questionsContainer.querySelectorAll('input').forEach(i => i.disabled = true);
        evaluateAnswers();
        resultDisplay.textContent = `Sie haben ${correctAnswers} von ${totalQuestions} richtig beantwortet.`;
        exerciseArea.style.display = "none";
        resultArea.style.display = "block";
        startButton.disabled = false;
    }

    function startExercise() {
        totalQuestions = parseInt(questionCountInput.value, 10);
        correctAnswers = 0;
        const minutes = parseInt(timeMinutesSelect.value, 10) || 0;
        const seconds = parseInt(timeSecondsSelect.value, 10) || 0;
        timeLeft = minutes * 60 + seconds;

        // UI lock
        startButton.disabled = true;
        multiplicationCheckbox.disabled = true;
        divisionCheckbox.disabled = true;
        rangeContainer.querySelectorAll('input[name="rangeOption"]').forEach(cb => cb.disabled = true);
        maxFactorSelect.disabled = true;
        questionCountInput.disabled = true;
        timeMinutesSelect.disabled = true;
        timeSecondsSelect.disabled = true;

        // generate questions and show area
        generateQuestions();
        exerciseArea.style.display = "block";
        resultArea.style.display = "none";
        timerDisplay.textContent = formatTime(timeLeft);

        // Scroll so that the "Übung" heading is at the top of the viewport
        const heading = exerciseArea.querySelector('h2');
        if (heading && heading.scrollIntoView) {
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Fokus auf erstes Eingabefeld setzen (kleine Verzögerung, damit das sanfte Scrollen abgeschlossen ist)
        const firstInput = questionsContainer.querySelector('input[type="number"]');
        if (firstInput) {
            setTimeout(() => {
                try {
                    firstInput.focus();
                    if (typeof firstInput.select === 'function') firstInput.select();
                } catch (e) {
                    // still safe to ignore focus errors
                }
            }, 300);
        }

        timer = setInterval(() => {
            if (timeLeft <= 0) {
                timerDisplay.textContent = formatTime(0);
                clearInterval(timer);
                endExercise();
                return;
            }
            timeLeft--;
            timerDisplay.textContent = formatTime(timeLeft);
        }, 1000);
    }

    // Restart to initial state
    function restartExercise() {
        clearInterval(timer);
        questionsContainer.innerHTML = "";
        exerciseArea.style.display = "none";
        resultArea.style.display = "none";
        // enable controls
        multiplicationCheckbox.disabled = false;
        divisionCheckbox.disabled = false;
        rangeContainer.querySelectorAll('input[name="rangeOption"]').forEach(cb => cb.disabled = false);
        maxFactorSelect.disabled = false;
        questionCountInput.disabled = false;
        timeMinutesSelect.disabled = false;
        timeSecondsSelect.disabled = false;
        startButton.disabled = true; // keep disabled until valid again
        submitAnswersBtn.disabled = false; // wieder aktivieren für neue Runde
        validateInputs();
    }

    // Events
    multiplicationCheckbox.addEventListener("change", validateInputs);
    divisionCheckbox.addEventListener("change", validateInputs);

    // Delegated listener für dynamisch erzeugte / viele Checkboxen
    rangeContainer.addEventListener("change", (e) => {
        if (e.target && e.target.name === "rangeOption") validateInputs();
    });

    maxFactorSelect.addEventListener("change", validateInputs);
    questionCountInput.addEventListener("input", validateInputs);
    timeMinutesSelect.addEventListener("change", validateInputs);
    timeSecondsSelect.addEventListener("change", validateInputs);
    startButton.addEventListener("click", () => {
        validateInputs();
        if (!startButton.disabled) startExercise();
    });

    submitAnswersBtn.addEventListener("click", () => {
        clearInterval(timer);
        submitAnswersBtn.disabled = true; // nur einmal möglich
        correctAnswers = 0;
        const inputs = questionsContainer.querySelectorAll('input[type="number"]');
        inputs.forEach(inp => {
            const expected = parseInt(inp.dataset.answer, 10);
            const provided = parseInt(inp.value, 10);

            // disable input
            inp.disabled = true;

            // remove vorhandene Feedback-Elemente
            const existingFb = inp.parentElement.querySelector('.feedback');
            if (existingFb) existingFb.remove();

            // Feedback-Element erstellen
            const fb = document.createElement('span');
            fb.className = 'feedback w3-margin-left w3-small';

            if (Number.isInteger(provided) && provided === expected) {
                correctAnswers++;
                // grün markieren
                inp.style.backgroundColor = '#dff0d8';
                inp.style.borderColor = '#3c763d';
                fb.textContent = 'Richtig';
                fb.classList.add('w3-text-green');
            } else {
                // rot markieren und korrekte Lösung anzeigen
                inp.style.backgroundColor = '#f2dede';
                inp.style.borderColor = '#a94442';
                fb.innerHTML = `Falsch — korrekt: <strong>${expected}</strong>`;
                fb.classList.add('w3-text-red');
            }

            inp.parentElement.appendChild(fb);
        });

        // Gesamtanzeige wie zuvor
        resultDisplay.textContent = `Sie haben ${correctAnswers} von ${totalQuestions} richtig beantwortet.`;
        // Result-Bereich anzeigen, Aufgaben bleiben sichtbar
        resultArea.style.display = "block";
        exerciseArea.style.display = "block";
        startButton.disabled = false;

        // Scroll to "Ergebnisse" heading
        const resultHeading = resultArea.querySelector('h2');
        if (resultHeading && resultHeading.scrollIntoView) {
            // kleine Verzögerung, damit DOM-Update erfolgt
            setTimeout(() => {
                try {
                    resultHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } catch (e) {}
            }, 50);
        }
    });

    restartButton.addEventListener("click", restartExercise);

    // initial
    validateInputs();
});