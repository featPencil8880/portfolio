/* Stroop Test */
(function () {
    const introPanel   = document.getElementById('introPanel');
    const stagePanel   = document.getElementById('stagePanel');
    const resultsPanel = document.getElementById('resultsPanel');
    const startBtn     = document.getElementById('startBtn');
    const againBtn     = document.getElementById('againBtn');
    const wordEl       = document.getElementById('stroopWord');
    const buttonsEl    = document.getElementById('stroopButtons');
    const roundEl      = document.getElementById('currentRound');
    const statCorrect  = document.getElementById('statCorrect');
    const statAvgTime  = document.getElementById('statAvgTime');
    const statTotal    = document.getElementById('statTotal');
    const resultsNote  = document.getElementById('resultsNote');

    if (!wordEl) return;

    const COLORS = [
        { key: 'red',    name: 'RED',    hex: '#ef4444' },
        { key: 'blue',   name: 'BLUE',   hex: '#3b82f6' },
        { key: 'green',  name: 'GREEN',  hex: '#22c55e' },
        { key: 'yellow', name: 'YELLOW', hex: '#eab308' }
    ];

    const ROUNDS = 20;
    let round = 0;
    let correct = 0;
    let times = [];
    let trialStart = 0;
    let currentInk = null;
    let accepting = false;
    let totalTime = 0;

    // Build color buttons once
    buttonsEl.innerHTML = COLORS.map(c =>
        `<button class="stroop-btn" data-color="${c.key}" style="border-color: ${c.hex}; color: ${c.hex};" type="button">${c.name}</button>`
    ).join('');

    buttonsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.stroop-btn');
        if (!btn || !accepting) return;
        accepting = false;

        const chosen = btn.dataset.color;
        const elapsed = performance.now() - trialStart;
        times.push(elapsed);
        totalTime += elapsed;

        if (chosen === currentInk.key) {
            correct++;
            btn.classList.add('is-correct');
        } else {
            btn.classList.add('is-wrong');
        }

        setTimeout(() => {
            btn.classList.remove('is-correct', 'is-wrong');
            nextTrial();
        }, 250);
    });

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function nextTrial() {
        round++;
        if (round > ROUNDS) { showResults(); return; }
        roundEl.textContent = round;

        // 75% incongruent, 25% congruent
        const isCongruent = Math.random() < 0.25;
        let wordColor, inkColor;

        if (isCongruent) {
            const c = COLORS[Math.floor(Math.random() * COLORS.length)];
            wordColor = c;
            inkColor = c;
        } else {
            const idxs = shuffle([0, 1, 2, 3]);
            wordColor = COLORS[idxs[0]];
            inkColor  = COLORS[idxs[1]];
        }

        currentInk = inkColor;
        wordEl.textContent = wordColor.name;
        wordEl.style.color = inkColor.hex;

        trialStart = performance.now();
        accepting = true;
    }

    function showResults() {
        stagePanel.style.display = 'none';
        resultsPanel.style.display = '';

        const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);

        statCorrect.textContent = correct + ' / ' + ROUNDS;
        statAvgTime.textContent = avg + ' ms';
        statTotal.textContent   = (Math.round(totalTime / 100) / 10) + ' s';

        let note;
        const accuracy = correct / ROUNDS;
        if (accuracy >= 0.95) {
            note = 'Near-perfect accuracy on a task designed to trip you up. Strong inhibition of automatic reading.';
        } else if (accuracy >= 0.8) {
            note = 'Solid performance. The Stroop interference effect is real — most adults score between 70% and 90%.';
        } else if (accuracy >= 0.6) {
            note = 'Some interference crept in — completely normal. Reading is automatic; suppressing it takes effort.';
        } else {
            note = 'High interference. The word won this round — try again when focused. Practice genuinely improves this task.';
        }
        resultsNote.textContent = note;
    }

    function startGame() {
        introPanel.style.display   = 'none';
        resultsPanel.style.display = 'none';
        stagePanel.style.display   = '';
        round = 0;
        correct = 0;
        times = [];
        totalTime = 0;
        currentInk = null;
        accepting = false;
        wordEl.textContent = 'READY';
        wordEl.style.color = 'var(--text-dim)';
        setTimeout(nextTrial, 600);
    }

    startBtn.addEventListener('click', startGame);
    againBtn.addEventListener('click', startGame);
})();