// --- Drawing App Core (unchanged) ---

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('culoare');
const presetBtns = document.querySelectorAll('.preset');
const grosimeSlider = document.getElementById('grosime');
const grosimeVal = document.getElementById('grosime-val');
const clearBtn = document.getElementById('clear-btn');
const saveBtn = document.getElementById('save-btn');
const uploadImgInput = document.getElementById('upload-img');

const completionMessages = [
    "✨ Drawing complete! What would you like me to draw next?",
    "🎨 Finished! How do you like my artwork?",
    "🖌️ All done! Ready for another creative challenge?",
    "🎭 Masterpiece complete! What's your next request?",
    "🌟 Drawing finished! I'm ready to create more art!"
];

let undoStack = [];
let redoStack = [];
const maxHistory = 20;
let drawing = false;
let currentColor = colorPicker.value;
let currentLineWidth = grosimeSlider.value;

// Color picker
colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
});

// Preset colors
presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentColor = btn.dataset.color;
        colorPicker.value = currentColor;
    });
});

// Line width
grosimeSlider.addEventListener('input', (e) => {
    currentLineWidth = e.target.value;
    grosimeVal.textContent = currentLineWidth;
});

// Drawing events
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    saveState(undoStack);
    ctx.beginPath();
    ctx.moveTo(getX(e), getY(e));
});
canvas.addEventListener('mouseup', () => {
    drawing = false;
    ctx.beginPath();
});
canvas.addEventListener('mouseleave', () => {
    drawing = false;
    ctx.beginPath();
});
canvas.addEventListener('mousemove', draw);

function saveState(stack, keepRedo = false) {
    if (!keepRedo) {
        redoStack = [];
    }
    stack.push(canvas.toDataURL());
    if (stack.length > maxHistory) {
        stack.shift();
    }
}

function draw(e) {
    if (!drawing) return;
    ctx.lineWidth = currentLineWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;

    ctx.lineTo(getX(e), getY(e));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(getX(e), getY(e));
}

// Touch events
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    drawing = true;
    const touch = e.touches[0];
    ctx.beginPath();
    ctx.moveTo(getTouchX(touch), getTouchY(touch));
});
canvas.addEventListener('touchend', () => {
    drawing = false;
    ctx.beginPath();
});
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!drawing) return;
    const touch = e.touches[0];
    ctx.lineWidth = currentLineWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;

    ctx.lineTo(getTouchX(touch), getTouchY(touch));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(getTouchX(touch), getTouchY(touch));
});

// Clear canvas
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState(undoStack);
});

// Save as image
saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'desen_canvas.png';
    link.href = canvas.toDataURL();
    link.click();
});

// Upload image
uploadImgInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new window.Image();
        img.onload = function() {
            let drawWidth = canvas.width;
            let drawHeight = canvas.height;
            let ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
            drawWidth = img.width * ratio;
            drawHeight = img.height * ratio;
            const offsetX = (canvas.width - drawWidth) / 2;
            const offsetY = (canvas.height - drawHeight) / 2;
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            saveState(undoStack);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
});

// Coordinate helpers
function getX(e) {
    const rect = canvas.getBoundingClientRect();
    return e.clientX - rect.left;
}
function getY(e) {
    const rect = canvas.getBoundingClientRect();
    return e.clientY - rect.top;
}
function getTouchX(touch) {
    const rect = canvas.getBoundingClientRect();
    return touch.clientX - rect.left;
}
function getTouchY(touch) {
    const rect = canvas.getBoundingClientRect();
    return touch.clientY - rect.top;
}

grosimeVal.textContent = grosimeSlider.value;

function restoreState(stackFrom, stackTo) {
    if (stackFrom.length === 0) return;
    stackTo.push(canvas.toDataURL());
    const imgData = stackFrom.pop();
    const img = new Image();
    img.src = imgData;
    img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
}

document.getElementById('undo-btn').addEventListener('click', function() {
    restoreState(undoStack, redoStack);
});

document.getElementById('redo-btn').addEventListener('click', function() {
    restoreState(redoStack, undoStack);
});

// Save initial empty state
saveState(undoStack);

// === AI Drawing Integration (Animated Freehand) ===
const chatLog = document.getElementById('chat-log');
appendChatMessage('AI', 'Welcome to DrawingAI! Ask me to draw anything and watch the magic happen.');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat');

const BACKEND_URL = '/api/generate';

async function generateDrawing(prompt) {
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return { message: data.message, commands: data.commands };
    } catch (error) {
        console.error('AI error:', error);
        throw error;
    }
}

// Animate a list of drawing commands step by step
function animateDrawingCommands(commands, defaultColor = "#000000", lineWidth = 5, delay = 5, onComplete = null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = defaultColor;
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = 1.0;
    let i = 0;

    function next() {
        if (i >= commands.length) {
            // Animation is complete - call the callback
            if (onComplete && typeof onComplete === 'function') {
                onComplete();
            }
            return;
        }
        const cmd = commands[i].trim();

        if (cmd.startsWith('setStrokeStyle')) {
            const color = cmd.match(/"(#\w{6})"/) || cmd.match(/(#\w{6})/);
            if (color) ctx.strokeStyle = color[1];
        } else if (cmd.startsWith('setFillStyle')) {
            const color = cmd.match(/"(#\w{6})"/) || cmd.match(/(#\w{6})/);
            if (color) ctx.fillStyle = color[1];
        } else if (cmd.startsWith('setLineWidth')) {
            const width = cmd.match(/\d+/);
            if (width) ctx.lineWidth = parseInt(width[0]);
        } else if (cmd.startsWith('setGlobalAlpha')) {
            const alpha = cmd.match(/([01](\.\d+)?)/);
            if (alpha) ctx.globalAlpha = parseFloat(alpha[1]);
        } else if (cmd.startsWith('beginPath')) {
            ctx.beginPath();
        } else if (cmd.startsWith('moveTo')) {
            const [x, y] = cmd.match(/-?\d+(\.\d+)?/g).map(Number);
            ctx.moveTo(x, y);
        } else if (cmd.startsWith('lineTo')) {
            const [x, y] = cmd.match(/-?\d+(\.\d+)?/g).map(Number);
            ctx.lineTo(x, y);
        } else if (cmd.startsWith('bezierCurveTo')) {
            const nums = cmd.match(/-?\d+(\.\d+)?/g).map(Number);
            if (nums.length === 6) ctx.bezierCurveTo(...nums);
        } else if (cmd.startsWith('arc')) {
            const nums = cmd.match(/-?\d+(\.\d+)?/g).map(Number);
            if (nums.length === 5) ctx.arc(nums[0], nums[1], nums[2], nums[3], nums[4]);
            else if (nums.length === 6) ctx.arc(nums[0], nums[1], nums[2], nums[3], nums[4], !!nums[5]);
        } else if (cmd.startsWith('closePath')) {
            ctx.closePath();
        } else if (cmd.startsWith('fill')) {
            ctx.fill();
        } else if (cmd.startsWith('stroke')) {
            ctx.stroke();
        } else if (cmd.startsWith('ellipse')) {
            const nums = cmd.match(/-?\d+(\.\d+)?/g).map(Number);
            if (nums.length === 7) ctx.ellipse(...nums);
        } else if (cmd.startsWith('quadraticCurveTo')) {
            const nums = cmd.match(/-?\d+(\.\d+)?/g).map(Number);
            if (nums.length === 4) ctx.quadraticCurveTo(...nums);
        }

        i++;
        setTimeout(next, delay);
    }
    next();
}

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendChatBtn.click();
    }
});

sendChatBtn.addEventListener('click', async () => {
    const prompt = chatInput.value.trim();
    if (!prompt) return;

    appendChatMessage('You', prompt);
    chatInput.value = '';
    const loadingMsg = appendChatMessage('AI', '<i>Drawing...</i>');

    try {
        const result = await generateDrawing(prompt);
        loadingMsg.innerHTML = `<b>AI:</b> ${result.message}`;
        if (result.commands) {
            // Add completion callback
            animateDrawingCommands(result.commands, currentColor, currentLineWidth, 150, () => {
                const randomMessage = completionMessages[Math.floor(Math.random() * completionMessages.length)];
                appendChatMessage('AI', randomMessage);
            });
        }
    } catch (error) {
        loadingMsg.innerHTML = `<b>AI:</b> <span style="color: red">${error.message}</span>`;
    }
});



function appendChatMessage(sender, message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message';
    msgDiv.innerHTML = `<b>${sender}:</b> ${message}`;
    chatLog.appendChild(msgDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
    return msgDiv;
}