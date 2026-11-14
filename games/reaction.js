/* Reaction Time — standalone game logic */
(function () {
    const introPanel   = document.getElementById('introPanel');
    const stagePanel   = document.getElementById('stagePanel');
    const resultsPanel = document.getElementById('resultsPanel');
    const startBtn     = document.getElementById('startBtn');
    const againBtn     = document.getElementById('againBtn');
    const gameBox      = document.getElementById('gameBox');
    const boxLabel     = document.getElementById('boxLabel');
    const currentTrial = document.getElementById('currentTrial');
    const statAvg      = document.getElementById('statAvg');
    const statBest     = document.getElementById('statBest');
    const statRank     = document.getElementById('statRank');
    const resultsNote  = document.getElementById('resultsNote');

    if (!gameBox) return;

    const TRIALS = 5;
    let times = [];
    let trialIndex = 0;
    let phase = 'idle'; // idle | waiting | ready | result | complete
    let waitTimeout = null;
    let readyTime = 0;

    function setBoxState(state, label) {
        gameBox.className = 'game-box state-' + state;
        boxLabel.textContent = label;
    }

    function beginTrial() {
        trialIndex++;
        currentTrial.textContent = trialIndex;
        setBoxState('waiting', 'Wait...');
        phase = 'waiting';

        const delay = 1000 + Math.random() * 2000;
        waitTimeout = setTimeout(() => {
            setBoxState('ready', 'CLICK!');
            phase = 'ready';
            readyTime = performance.now();
        }, delay);
    }

    function handleBoxClick() {
        if (phase === 'waiting') {
            clearTimeout(waitTimeout);
            setBoxState('too-soon', 'Too soon!');
            phase = 'result';
            trialIndex--; // restart this trial
            setTimeout(() => beginTrial(), 1000);
            return;
        }

        if (phase === 'ready') {
            const elapsed = Math.round(performance.now() - readyTime);
            times.push(elapsed);
            setBoxState('result', elapsed + ' ms');
            phase = 'result';

            setTimeout(() => {
                if (times.length >= TRIALS) showResults();
                else beginTrial();
            }, 1000);
        }
    }

    function showResults() {
        stagePanel.style.display = 'none';
        resultsPanel.style.display = '';
        phase = 'complete';

        const avg  = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
        const best = Math.min.apply(null, times);

        statAvg.textContent  = avg + ' ms';
        statBest.textContent = best + ' ms';

        let rank, note;
        if (avg < 200) {
            rank = 'Exceptional';
            note = 'That reaction time sits in the top tier of published adult averages — faster than roughly 95% of adults tested.';
        } else if (avg < 250) {
            rank = 'Fast';
            note = 'Well above the median. Most studies put the adult average between 250 and 300 ms — you are clearly on the faster side.';
        } else if (avg < 300) {
            rank = 'Average';
            note = 'Right in the middle of the typical adult range (250–300 ms). Solid, reliable reflexes.';
        } else if (avg < 400) {
            rank = 'Relaxed';
            note = 'Slightly above the average range. Could be caffeine, fatigue, or device lag — try again when rested.';
        } else {
            rank = 'Take Your Time';
            note = 'Notably slower than average. Nothing wrong — reaction time varies widely — but if this is a surprise, try again on a fresh morning.';
        }

        statRank.textContent = rank;
        resultsNote.textContent = note;
    }

    function startGame() {
        introPanel.style.display   = 'none';
        resultsPanel.style.display = 'none';
        stagePanel.style.display   = '';
        times = [];
        trialIndex = 0;
        clearTimeout(waitTimeout);
        setBoxState('waiting', 'Wait...');
        beginTrial();
    }

    gameBox.addEventListener('click', handleBoxClick);
    startBtn.addEventListener('click', startGame);
    againBtn.addEventListener('click', startGame);

    gameBox.addEventListener('mousedown', (e) => e.preventDefault());
})();