document.addEventListener("DOMContentLoaded", function() {
    const operationRadios = document.querySelectorAll('input[name="operation"]');
    const uebertragCheckbox = document.getElementById("uebertrag");
    const zahlContainer = document.getElementById("zahlContainer");
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
    const zahlenraumInput = document.getElementById("zahlenraum");

    let timer;
    let totalQuestions = 0;
    let correctAnswers = 0;
    let timeLeft = 0;

    function getSelectedNumbers() {
        return Array.from(zahlContainer.querySelectorAll('input[name="zahlOption"]:checked'))
            .map(cb => parseInt(cb.value, 10))
            .filter(n => Number.isInteger(n) && n >= 1 && n <= 12);
    }

    function validateInputs() {
        const selectedNumbers = getSelectedNumbers();
        const zahlenraum = parseInt(zahlenraumInput.value, 10);
        const questionCount = parseInt(questionCountInput.value, 10);
        const minutes = parseInt(timeMinutesSelect.value, 10);
        const seconds = parseInt(timeSecondsSelect.value, 10);
        const minutesOk = Number.isInteger(minutes) && minutes >= 0 && minutes <= 20;
        const secondsOk = Number.isInteger(seconds) && seconds >= 0 && seconds <= 59;
        const totalSec = (Number.isInteger(minutes) ? minutes : 0) * 60 + (Number.isInteger(seconds) ? seconds : 0);
        const timeOk = totalSec >= 1 && totalSec <= 20 * 60;
        const zahlenraumOk = Number.isInteger(zahlenraum) && zahlenraum >= 10 && zahlenraum <= 100;

        if (selectedNumbers.length > 0 &&
            zahlenraumOk &&
            Number.isInteger(questionCount) && questionCount >= 1 && questionCount <= 100 &&
            minutesOk && secondsOk && timeOk) {
            startButton.disabled = false;
            messageBox.textContent = "";
        } else {
            startButton.disabled = true;
            messageBox.textContent = "Bitte wählen Sie mindestens eine Zahl und füllen Sie alle Felder korrekt aus.";
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
        const selectedNumbers = getSelectedNumbers();
        const uebertrag = uebertragCheckbox.checked;
        const operation = Array.from(operationRadios).find(r => r.checked).value;
        const zahlenraum = parseInt(zahlenraumInput.value, 10);

        for (let i = 0; i < totalQuestions; i++) {
            let a, b, display, answer;

            if (operation === "add") {
                // Summand a zufällig aus den aktivierten Zahlen
                a = selectedNumbers[randInt(0, selectedNumbers.length - 1)];
                // Summand b so wählen, dass a + b <= zahlenraum
                // b darf maximal zahlenraum - a sein, aber muss auch aus den aktivierten Zahlen stammen
                const possibleB = selectedNumbers.filter(num => (a + num) <= zahlenraum);
                // Falls keine Zahl passt, nimm das Minimum aus den aktivierten Zahlen
                if (possibleB.length === 0) {
                    b = Math.min(...selectedNumbers);
                } else {
                    b = possibleB[randInt(0, possibleB.length - 1)];
                }
                display = `${a} + ${b} = `;
                answer = a + b;
            } else {
                // Subtraktion wie gehabt, mit/ohne Übertrag und zahlenraum als Maximalwert für Minuend
                a = selectedNumbers[randInt(0, selectedNumbers.length - 1)];
                b = selectedNumbers[randInt(0, selectedNumbers.length - 1)];
                if (uebertrag) {
                    while (a > zahlenraum) {
                        a = selectedNumbers[randInt(0, selectedNumbers.length - 1)];
                    }
                } else {
                    while ((a - b < 0) || (a > zahlenraum)) {
                        a = selectedNumbers[randInt(0, selectedNumbers.length - 1)];
                        b = selectedNumbers[randInt(0, selectedNumbers.length - 1)];
                    }
                }
                display = `${a} - ${b} = `;
                answer = a - b;
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
            input.min = '-99';
            input.step = '1';
            input.className = "w3-input w3-inline";
            input.style.maxWidth = "120px";
            input.dataset.answer = String(answer);

            input.addEventListener("input", () => {
                if (input.value && !/^-?\d+$/.test(input.value)) {
                    input.value = input.value.replace(/[^\d-]/g, '');
                }
            });

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

    function computeGrade(possiblePoints, achievedPoints) {
        if (!Number.isFinite(possiblePoints) || possiblePoints <= 0) return 1.0;
        const grade = (5 / possiblePoints) * achievedPoints + 1;
        const clamped = Math.min(6, Math.max(1, grade));
        return Math.round(clamped * 10) / 10;
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

        startButton.disabled = true;
        Array.from(operationRadios).forEach(r => r.disabled = true);
        uebertragCheckbox.disabled = true;
        zahlContainer.querySelectorAll('input[name="zahlOption"]').forEach(cb => cb.disabled = true);
        questionCountInput.disabled = true;
        timeMinutesSelect.disabled = true;
        timeSecondsSelect.disabled = true;

        generateQuestions();
        exerciseArea.style.display = "block";
        resultArea.style.display = "none";
        timerDisplay.textContent = formatTime(timeLeft);

        showFixedTimer();

        const heading = exerciseArea.querySelector('h2');
        if (heading && heading.scrollIntoView) {
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        const firstInput = questionsContainer.querySelector('input[type="number"]');
        if (firstInput) {
            setTimeout(() => {
                try { firstInput.focus(); if (typeof firstInput.select === 'function') firstInput.select(); } catch (e) {}
            }, 300);
        }

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
        resultArea.style.display = "block";
        exerciseArea.style.display = "block";
        startButton.disabled = false;
        hideFixedTimer();

        const resultHeading = resultArea.querySelector('h2');
        if (resultHeading && resultHeading.scrollIntoView) {
            setTimeout(() => { try { resultHeading.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} }, 50);
        }
    });

    restartButton.addEventListener("click", () => {
        clearInterval(timer);
        questionsContainer.innerHTML = "";
        exerciseArea.style.display = "none";
        resultArea.style.display = "none";
        Array.from(operationRadios).forEach(r => r.disabled = false);
        uebertragCheckbox.disabled = false;
        zahlContainer.querySelectorAll('input[name="zahlOption"]').forEach(cb => cb.disabled = false);
        questionCountInput.disabled = false;
        timeMinutesSelect.disabled = false;
        timeSecondsSelect.disabled = false;
        startButton.disabled = true;
        submitAnswersBtn.disabled = false;
        hideFixedTimer();
        validateInputs();
    });

    Array.from(operationRadios).forEach(r => r.addEventListener("change", validateInputs));
    uebertragCheckbox.addEventListener("change", validateInputs);
    zahlContainer.addEventListener("change", (e) => { if (e.target && e.target.name === "zahlOption") validateInputs(); });
    questionCountInput.addEventListener("input", validateInputs);
    timeMinutesSelect.addEventListener("change", validateInputs);
    timeSecondsSelect.addEventListener("change", validateInputs);
    zahlenraumInput.addEventListener("input", validateInputs);
    startButton.addEventListener("click", () => { validateInputs(); if (!startButton.disabled) startExercise(); });

    validateInputs();
});