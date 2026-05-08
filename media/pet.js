const pet = document.getElementById('pet');
const statusEl = document.getElementById('status');
const bubble = document.getElementById('bubble');

const states = ['idle', 'thinking', 'tool_use', 'responding', 'error', 'coding', 'reading', 'running', 'searching'];
const stateLabels = {
    idle: 'Idle',
    thinking: 'Thinking...',
    tool_use: 'Using Tool',
    responding: 'Responding',
    error: 'Error!',
    coding: 'Coding...',
    reading: 'Reading...',
    running: 'Running...',
    searching: 'Searching...'
};

const stateBubbles = {
    idle: ['Waiting...', 'Ready!', 'Listening...'],
    thinking: ['Hmm...', 'Let me think...', 'Processing...'],
    tool_use: ['Running tool...', 'Fetching data...', 'Executing...'],
    responding: ['Here you go!', 'Got it!', 'Replying...'],
    error: ['Oops!', 'Something went wrong', 'Error!'],
    coding: ['Typing...', 'Writing code...', 'Fixing bugs...'],
    reading: ['Reading file...', 'Let me see...', 'Checking...'],
    running: ['Running command...', 'Executing...', 'Wait a sec...'],
    searching: ['Searching...', 'Looking for...', 'Finding...']
};

let bubbleTimer = null;

function setState(newState, detail = '') {
    if (!states.includes(newState)) {
        console.warn('Unknown state:', newState);
        return;
    }

    // Remove all state classes
    states.forEach(s => pet.classList.remove(s));
    // Add new state
    pet.classList.add(newState);

    // Update status text
    statusEl.textContent = detail || stateLabels[newState];

    // Show speech bubble occasionally
    showRandomBubble(newState);
}

function showRandomBubble(state) {
    if (bubbleTimer) {
        clearTimeout(bubbleTimer);
    }

    const messages = stateBubbles[state];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    bubble.textContent = msg;
    bubble.classList.add('show');

    bubbleTimer = setTimeout(() => {
        bubble.classList.remove('show');
    }, 2000);
}

// Listen for messages from VS Code extension
window.addEventListener('message', event => {
    const message = event.data;
    if (message.type === 'stateChange') {
        setState(message.state, message.detail);
    }
});

// Manual testing via console
window.setPetState = setState;

// Default state
setState('idle');
