/* Memory Match */
(function () {
    const introPanel    = document.getElementById('introPanel');
    const stagePanel    = document.getElementById('stagePanel');
    const resultsPanel  = document.getElementById('resultsPanel');
    const startBtn      = document.getElementById('startBtn');
    const againBtn      = document.getElementById('againBtn');
    const gridEl        = document.getElementById('memoryGrid');
    const moveCountEl   = document.getElementById('moveCount');
    const timerEl       = document.getElementById('timerDisplay');
    const pairCountEl   = document.getElementById('pairCount');
    const statMoves     = document.getElementById('statMoves');
    const statTime      = document.getElementById('statTime');
    const statRank      = document.getElementById('statRank');
    const resultsNote   = document.getElementById('resultsNote');

    if (!gridEl) return;

    const EMOJIS = ['🍎', '🍌', '🍇', '🍓', '🥝', '🍊', '🍋', '🍒'];
    const EMOJI_NAMES = {
        '🍎': 'Apple', '🍌': 'Banana', '🍇': 'Grapes', '🍓': 'Strawberry',
        '🥝': 'Kiwi', '🍊': 'Orange', '🍋': 'Lemon', '🍒': 'Cherries'
    };

    let cards = [];
    let flipped = [];
    let matched = 0;
    let moves = 0;
    let timerStart = 0;
    let timerInterval = null;
    let lock = false;
    let totalPairs = 8;

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function formatTime(ms) {
        const totalSec = Math.floor(ms / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return m + ':' + String(s).padStart(2, '0');
    }

    function startTimer() {
        timerStart = performance.now();
        timerInterval = setInterval(() => {
            timerEl.textContent = formatTime(performance.now() - timerStart);
        }, 200);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function buildDeck() {
        const pairs = [];
        EMOJIS.forEach(emoji => {
            pairs.push({ emoji: emoji, matched: false });
            pairs.push({ emoji: emoji, matched: false });
        });
        return shuffle(pairs);
    }

    function renderGrid() {
        gridEl.innerHTML = cards.map((card, i) => `
            <button class="memory-card" data-index="${i}" type="button" aria-label="Card ${i + 1}, face down" aria-pressed="false">
                <span class="memory-card-back" aria-hidden="true">?</span>
                <span class="memory-card-front" aria-hidden="true">${card.emoji}</span>
            </button>
        `).join('');
    }

    gridEl.addEventListener('click', (e) => {
        const cardEl = e.target.closest('.memory-card');
        if (!cardEl || lock) return;

        const idx = parseInt(cardEl.dataset.index, 10);
        if (flipped.includes(idx)) return;
        if (cards[idx].matched) return;

        cardEl.classList.add('is-flipped');
        cardEl.setAttribute('aria-label', `Card ${idx + 1}, ${EMOJI_NAMES[cards[idx].emoji]}`);
        cardEl.setAttribute('aria-pressed', 'true');
        flipped.push(idx);

        if (flipped.length === 2) {
            moves++;
            moveCountEl.textContent = moves;

            const [a, b] = flipped;
            if (cards[a].emoji === cards[b].emoji) {
                // Match
                cards[a].matched = true;
                cards[b].matched = true;
                matched++;
                pairCountEl.textContent = matched;

                setTimeout(() => {
                    document.querySelectorAll('.memory-card').forEach((el, i) => {
                        if (i === a || i === b) {
                            el.classList.add('is-matched');
                            el.setAttribute('aria-label', `Card ${i + 1}, ${EMOJI_NAMES[cards[i].emoji]}, matched`);
                            el.setAttribute('aria-disabled', 'true');
                        }
                    });
                    flipped = [];
                    if (matched === totalPairs) showResults();
                }, 350);
            } else {
                // No match
                lock = true;
                setTimeout(() => {
                    document.querySelectorAll('.memory-card').forEach((el, i) => {
                        if (i === a || i === b) {
                            el.classList.remove('is-flipped');
                            el.setAttribute('aria-label', `Card ${i + 1}, face down`);
                            el.setAttribute('aria-pressed', 'false');
                        }
                    });
                    flipped = [];
                    lock = false;
                }, 800);
            }
        }
    });

    function showResults() {
        stopTimer();
        const elapsed = performance.now() - timerStart;

        setTimeout(() => {
            stagePanel.style.display = 'none';
            resultsPanel.style.display = '';
            resultsPanel.querySelector('.game-title')?.focus();

            statMoves.textContent = moves;
            statTime.textContent  = formatTime(elapsed);

            let result;
            if (moves <= 12) {
                result = 'Few moves';
            } else if (moves <= 18) {
                result = 'Steady pace';
            } else if (moves <= 24) {
                result = 'More moves';
            } else {
                result = 'Many moves';
            }
            statRank.textContent = result;
            resultsNote.textContent = `You found all eight pairs in ${moves} moves. This casual game is not a validated measure of working memory; strategy, familiarity, and chance affect results.`;
        }, 400);
    }

    function startGame() {
        introPanel.style.display   = 'none';
        resultsPanel.style.display = 'none';
        stagePanel.style.display   = '';

        cards = buildDeck();
        flipped = [];
        matched = 0;
        moves = 0;
        lock = false;

        moveCountEl.textContent = '0';
        timerEl.textContent = '0:00';
        pairCountEl.textContent = '0';

        renderGrid();
        gridEl.querySelector('.memory-card')?.focus();
        stopTimer();
        startTimer();
    }

    startBtn.addEventListener('click', startGame);
    againBtn.addEventListener('click', startGame);
})();