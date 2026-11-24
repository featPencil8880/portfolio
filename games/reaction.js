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
        resultsPanel.querySelector('.game-title')?.focus();

        const avg  = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
        const best = Math.min.apply(null, times);

        statAvg.textContent  = avg + ' ms';
        statBest.textContent = best + ' ms';

        let band;
        if (avg < 200) {
            band = 'Under 200 ms';
        } else if (avg < 250) {
            band = '200–249 ms';
        } else if (avg < 300) {
            band = '250–299 ms';
        } else if (avg < 400) {
            band = '300–399 ms';
        } else {
            band = '400 ms or more';
        }

        statRank.textContent = band;
        resultsNote.textContent = `Your average response time was ${avg} ms in this run. This informal browser task is not a validated assessment; display, device, and input latency affect results.`;
    }

    function startGame() {
        introPanel.style.display   = 'none';
        resultsPanel.style.display = 'none';
        stagePanel.style.display   = '';
        times = [];
        trialIndex = 0;
        clearTimeout(waitTimeout);
        setBoxState('waiting', 'Wait...');
        gameBox.focus();
        beginTrial();
    }

    gameBox.addEventListener('click', handleBoxClick);
    startBtn.addEventListener('click', startGame);
    againBtn.addEventListener('click', startGame);

    gameBox.addEventListener('mousedown', (e) => e.preventDefault());
})();