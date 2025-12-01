// JavaScript für die Reihenübung

// Vollständige Logik mit festem Timer oben rechts

document.addEventListener("DOMContentLoaded", function() {
    const multiplicationCheckbox = document.getElementById("multiplication");
    const divisionCheckbox = document.getElementById("division");
    const rangeContainer = document.getElementById("rangeContainer");
    const maxFactorSelect = document.getElementById("maxFactor");
    const maxScaleSelect = document.getElementById("maxScale");
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

    const fixedTimer = document.getElementById("fixedTimer");
    const fixedTimerText = document.getElementById("fixedTimerText");

    let timer;
    let totalQuestions = 0;
    let correctAnswers = 0;
    let timeLeft = 0; // in Sekunden

    // Default maxFactor fallback
    if (maxFactorSelect && !maxFactorSelect.value) maxFactorSelect.value = "10";

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
        // parse maxScale als Zahl (Fallback 1)
        const maxScaleValue = parseInt(maxScaleSelect && maxScaleSelect.value ? maxScaleSelect.value : "1", 10) || 1;
        const includeMul = multiplicationCheckbox.checked;
        const includeDiv = divisionCheckbox.checked;

        for (let i = 0; i < totalQuestions; i++) {
            let mode;
            if (includeMul && includeDiv) mode = Math.random() < 0.5 ? "mul" : "div";
            else if (includeMul) mode = "mul";
            else mode = "div";

            const row = selectedRows[randInt(0, selectedRows.length - 1)];
            let display;
            // wähle zufällige zulässige Skalierung basierend auf der Benutzerauswahl
            const scale = pickRandomScale(maxScaleValue);

            if (mode === "mul") {
                // Skalierung auf beide Faktoren anwenden
                const a = row * scale;
                const b = randInt(1, maxFactor) * scale;
                const swap = Math.random() < 0.5;
                display = swap ? `${b} × ${a} = ` : `${a} × ${b} = `;
                var expectedAnswer = a * b;
                var inputValueMin = 0;
            } else {
                // Skalierung auf Divisor und Quotient anwenden
                const divisor = row * scale;
                const quotient = randInt(1, maxFactor) * scale;
                const dividend = divisor * quotient;
                display = `${dividend} ÷ ${divisor} = `;
                var expectedAnswer = quotient;
                var inputValueMin = 0;
            }

            const qDiv = document.createElement("div");
            qDiv.className = "w3-margin-bottom";

            const label = document.createElement("label");
            label.className = "w3-margin-right";
            label.textContent = display;

            const input = document.createElement("input");
            input.type = "number";
            input.setAttribute('inputmode', 'numeric');
            input.setAttribute('pattern', '[0-9]*');
            input.setAttribute('enterkeyhint', 'next');
            input.setAttribute('autocomplete', 'off');
            input.min = String(inputValueMin);
            input.step = '1';
            input.className = "w3-input w3-inline";
            input.style.maxWidth = "120px";

            input.dataset.answer = String(expectedAnswer);

            input.addEventListener("input", () => {
                if (input.value && !/^-?\d+$/.test(input.value)) {
                    input.value = input.value.replace(/[^\d-]/g, '');
                }
            });

            // Enter behaves like Tab
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    const allInputs = Array.from(questionsContainer.querySelectorAll('input[type="number"]'));
                    const idx = allInputs.indexOf(e.target);
                    const nextInput = allInputs[idx + 1];
                    if (nextInput) {
                        setTimeout(() => { try { nextInput.focus(); if (typeof nextInput.select === 'function') nextInput.select(); } catch (_) {} }, 0);
                    } else {
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

    // Note berechnen: (5 / möglichePunkte * erreichtePunkte) + 1
    function computeGrade(possiblePoints, achievedPoints) {
        if (!Number.isFinite(possiblePoints) || possiblePoints <= 0) return 1.0;
        const grade = (5 / possiblePoints) * achievedPoints + 1;
        const clamped = Math.min(6, Math.max(1, grade));
        return Math.round(clamped * 10) / 10; // auf 1 Dezimalstelle runden
    }

    function showFixedTimer() {
        if (fixedTimer && fixedTimerText) {
            fixedTimerText.textContent = formatTime(timeLeft);
            fixedTimer.style.display = 'block';
            fixedTimer.setAttribute('aria-hidden', 'false');
            fixedTimer.classList.remove('time-warning');
        }
    }

    function hideFixedTimer() {
        if (fixedTimer) {
            fixedTimer.style.display = 'none';
            fixedTimer.setAttribute('aria-hidden', 'true');
            fixedTimer.classList.remove('time-warning');
        }
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
        // Skalierungs-Dropdown während der Übung sperren
        if (maxScaleSelect) maxScaleSelect.disabled = true;
        // "Alle"-Button sperren wie die anderen Form-Elemente
        if (selectAllRowsBtn) selectAllRowsBtn.disabled = true;
        questionCountInput.disabled = true;
        timeMinutesSelect.disabled = true;
        timeSecondsSelect.disabled = true;

        // generate questions and show area
        generateQuestions();
        exerciseArea.style.display = "block";
        resultArea.style.display = "none";
        timerDisplay.textContent = formatTime(timeLeft);

        // show fixed timer
        showFixedTimer();

        // Scroll so that the "Übung" heading is at the top of the viewport
        const heading = exerciseArea.querySelector('h2');
        if (heading && heading.scrollIntoView) {
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // focus first input
        const firstInput = questionsContainer.querySelector('input[type="number"]');
        if (firstInput) {
            setTimeout(() => {
                try { firstInput.focus(); if (typeof firstInput.select === 'function') firstInput.select(); } catch (e) {}
            }, 300);
        }

        // start timer
        clearInterval(timer);
        timer = setInterval(() => {
            if (timeLeft <= 0) {
                timerDisplay.textContent = formatTime(0);
                if (fixedTimerText) fixedTimerText.textContent = formatTime(0);
                clearInterval(timer);
                endExercise();
                return;
            }
            timeLeft--;
            timerDisplay.textContent = formatTime(timeLeft);
            if (fixedTimerText) fixedTimerText.textContent = formatTime(timeLeft);

            // last 10 seconds: warning
            if (fixedTimer) {
                if (timeLeft <= 10) fixedTimer.classList.add('time-warning');
                else fixedTimer.classList.remove('time-warning');
            }
        }, 1000);
    }

    function endExercise() {
        clearInterval(timer);
        questionsContainer.querySelectorAll('input').forEach(i => i.disabled = true);
        evaluateAnswers();
        const grade = computeGrade(totalQuestions, correctAnswers);
        resultDisplay.innerHTML = `Sie haben ${correctAnswers} von ${totalQuestions} richtig beantwortet.<br><strong>Note: ${grade.toFixed(1)}</strong>`;
        exerciseArea.style.display = "none";
        resultArea.style.display = "block";
        startButton.disabled = false;
        hideFixedTimer();
    }

    submitAnswersBtn.addEventListener("click", () => {
        clearInterval(timer);
        submitAnswersBtn.disabled = true;
        correctAnswers = 0;
        const inputs = questionsContainer.querySelectorAll('input[type="number"]');
        inputs.forEach(inp => {
            const expected = parseInt(inp.dataset.answer, 10);
            const provided = parseInt(inp.value, 10);
            inp.disabled = true;

            const existingFb = inp.parentElement.querySelector('.feedback');
            if (existingFb) existingFb.remove();

            const fb = document.createElement('span');
            fb.className = 'feedback w3-margin-left w3-small';

            if (Number.isInteger(provided) && provided === expected) {
                correctAnswers++;
                inp.style.backgroundColor = '#dff0d8';
                inp.style.borderColor = '#3c763d';
                fb.textContent = 'Richtig';
                fb.classList.add('w3-text-green');
            } else {
                inp.style.backgroundColor = '#f2dede';
                inp.style.borderColor = '#a94442';
                fb.innerHTML = `Falsch — korrekt: <strong>${expected}</strong>`;
                fb.classList.add('w3-text-red');
            }

            inp.parentElement.appendChild(fb);
        });

        const gradeSubmit = computeGrade(totalQuestions, correctAnswers);
        resultDisplay.innerHTML = `Sie haben ${correctAnswers} von ${totalQuestions} richtig beantwortet.<br><strong>Note: ${gradeSubmit.toFixed(1)}</strong>`;
        // Result-Bereich anzeigen, Aufgaben bleiben sichtbar
        resultArea.style.display = "block";
        exerciseArea.style.display = "block";
        // Startbutton nach Einreichen inaktiv lassen
        startButton.disabled = true;

        // Fixed timer verbergen nach Einreichen
        if (fixedTimer) {
            fixedTimer.style.display = 'none';
            fixedTimer.setAttribute('aria-hidden', 'true');
            fixedTimer.classList.remove('time-warning');
        }

        // Beim Einreichen ganz nach unten scrollen (mobil + desktop)
        setTimeout(() => {
            try {
                window.scrollTo({ top: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight), behavior: 'smooth' });
            } catch (e) {
                window.scrollTo(0, document.body.scrollHeight);
            }
        }, 80);
    });

    restartButton.addEventListener("click", () => {
        clearInterval(timer);
        questionsContainer.innerHTML = "";
        exerciseArea.style.display = "none";
        resultArea.style.display = "none";
        multiplicationCheckbox.disabled = false;
        divisionCheckbox.disabled = false;
        rangeContainer.querySelectorAll('input[name="rangeOption"]').forEach(cb => cb.disabled = false);
        maxFactorSelect.disabled = false;
        if (maxScaleSelect) maxScaleSelect.disabled = false;
        // "Alle"-Button wieder aktivieren
        if (selectAllRowsBtn) selectAllRowsBtn.disabled = false;
        questionCountInput.disabled = false;
        timeMinutesSelect.disabled = false;
        timeSecondsSelect.disabled = false;
        startButton.disabled = true;
        submitAnswersBtn.disabled = false;
        hideFixedTimer();
        validateInputs();

        // Beim Neustart ganz nach oben scrollen (mobil + desktop)
        setTimeout(() => {
            try {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (e) {
                window.scrollTo(0, 0);
            }
        }, 60);
    });

    // Neue Skalierungen (10000 hinzugefügt)
    const SCALES = [1, 10, 100, 1000, 10000];
    
    function getAllowedScales(maxScaleValue) {
        const max = Number(maxScaleValue) || 1;
        return SCALES.filter(s => s <= max);
    }
    
    function pickRandomScale(maxScaleValue) {
        const allowed = getAllowedScales(maxScaleValue);
        if (allowed.length === 0) return 1;
        const nonOne = allowed.filter(s => s > 1);
        if (nonOne.length === 0) return 1;
        const chooseNonOne = Math.random() < 0.8;
        if (chooseNonOne) {
            return nonOne[Math.floor(Math.random() * nonOne.length)];
        }
        return allowed.includes(1) ? 1 : nonOne[Math.floor(Math.random() * nonOne.length)];
    }

    // Beispiel: Integration in existierende Fragegenerierung.
    // Ersetze bzw. erweitere die Stelle, an der Faktoren / Dividend/Divisor erzeugt werden,
    // durch die folgende Logik. (Anpassung an vorhandene Variablennamen nötig.)

    function generateQuestionForRow(rowValue, maxFactor, isMultiplication, maxScaleValue) {
        // rowValue: die gewählte Reihen-Zahl (z.B. 3 für 3er-Reihe)
        // maxFactor: maximaler Faktor (1..12)
        // isMultiplication: true = Multiplikation, false = Division
        // maxScaleValue: Wert des neuen Selects (1,10,100,1000)

        const scale = pickRandomScale(maxScaleValue);

        // wähle einen zufälligen weiteren Faktor (1..maxFactor)
        const other = Math.floor(Math.random() * maxFactor) + 1;

        if (isMultiplication) {
            // Skalierung auf beide Faktoren anwenden
            const a = rowValue * scale;
            const b = other * scale;
            const questionText = `${a} × ${b} = ?`;
            const answer = a * b;
            return { questionText, answer, scaleUsed: scale };
        } else {
            // Division: Skalierung auf Divisor und Quotient anwenden, Dividend entsprechend konstruieren
            const divisor = rowValue * scale;
            const quotient = other * scale;
            const dividend = divisor * quotient;
            const questionText = `${dividend} ÷ ${divisor} = ?`;
            const answer = quotient;
            return { questionText, answer, scaleUsed: scale };
        }
    }

    // Beispiel-Aufruf innerhalb der bestehenden Logik:
    // const q = generateQuestionForRow(chosenRow, Number(document.getElementById('maxFactor').value), multiplicationChecked, document.getElementById('maxScale').value);

    // Event bindings
    multiplicationCheckbox.addEventListener("change", validateInputs);
    divisionCheckbox.addEventListener("change", validateInputs);
    rangeContainer.addEventListener("change", (e) => { if (e.target && e.target.name === "rangeOption") validateInputs(); });
    maxFactorSelect.addEventListener("change", validateInputs);
    if (maxScaleSelect) maxScaleSelect.addEventListener("change", validateInputs);
    questionCountInput.addEventListener("input", validateInputs);
    timeMinutesSelect.addEventListener("change", validateInputs);
    timeSecondsSelect.addEventListener("change", validateInputs);
    startButton.addEventListener("click", () => { validateInputs(); if (!startButton.disabled) startExercise(); });

    // initial validation
    validateInputs();

    // nachdem DOM-Elemente erstellt/zugewiesen sind
    const selectAllRowsBtn = document.getElementById('selectAllRows');

    if (selectAllRowsBtn) {
        selectAllRowsBtn.addEventListener('click', () => {
            // Alle Reihen-Checkboxen aktivieren
            const boxes = rangeContainer.querySelectorAll('input[name="rangeOption"]');
            boxes.forEach(cb => {
                cb.checked = true;
            });
            // Ausgabe/Validierung aktualisieren
            try { validateInputs(); } catch (e) {}
        });
    }
});