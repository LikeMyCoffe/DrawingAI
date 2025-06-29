const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('culoare');
const presetBtns = document.querySelectorAll('.preset');
const grosimeSlider = document.getElementById('grosime');
const grosimeVal = document.getElementById('grosime-val');
const clearBtn = document.getElementById('clear-btn');
const saveBtn = document.getElementById('save-btn');
const uploadImgInput = document.getElementById('upload-img');

let undoStack = [];
let redoStack = [];
const maxHistory = 20; // Poți schimba limita de pași rețurnati
let drawing = false;
let currentColor = colorPicker.value;
let currentLineWidth = grosimeSlider.value;

// Actualizează culoarea la schimbare
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

// Actualizează grosimea liniei
grosimeSlider.addEventListener('input', (e) => {
    currentLineWidth = e.target.value;
    grosimeVal.textContent = currentLineWidth;
});

// Evenimente desenare
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

// Salvare progress Undo/Redo
function saveState(stack, keepRedo = false) {
    if (!keepRedo) {
        redoStack = [];
    }
    stack.push(canvas.toDataURL());
    if (stack.length > maxHistory) {
        stack.shift();
    }
}


// Funcție desenare
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

// Pentru touch (mobil)
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

// Șterge canvas
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState(undoStack);
});

// Salvează desenul ca imagine
saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'desen_canvas.png';
    link.href = canvas.toDataURL();
    link.click();
});

// Încărcare imagine pe canvas
uploadImgInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new window.Image();
        img.onload = function() {
            // Redimensionează imaginea să se potrivească pe canvas
            let drawWidth = canvas.width;
            let drawHeight = canvas.height;
            let ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
            drawWidth = img.width * ratio;
            drawHeight = img.height * ratio;
            // Poziționează imaginea central pe canvas
            const offsetX = (canvas.width - drawWidth) / 2;
            const offsetY = (canvas.height - drawHeight) / 2;
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            saveState(undoStack);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    // Reset input pentru a putea încărca aceeași imagine de mai multe ori
    e.target.value = '';
});

// Funcții ajutătoare pentru coordonate
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

// Inițializare valoare grosime
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

// Salvează starea goală la început
saveState(undoStack);
// === AI Drawing Integration ===
const geminiApiKey = 'AIzaSyCczkMxTf63wD5pKQfylNC390PTeO0TRHk';
const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat');

async function generateDrawing(prompt) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + geminiApiKey;
    
    const systemPrompt = `Draw the user's request using these shapes on an 800x500 canvas:
- Rectangle: {"action":"draw_rectangle", "x":number, "y":number, "width":number, "height":number, "color":"#hex", "fill":boolean}
- Circle: {"action":"draw_circle", "x":number, "y":number, "radius":number, "color":"#hex", "fill":boolean}
- Line: {"action":"draw_line", "x1":number, "y1":number, "x2":number, "y2":number, "color":"#hex"}

Respond with:
1. One line saying what you'll draw
2. A JSON array with the shapes

Example:
I'll draw a house!
[{"action":"draw_rectangle","x":350,"y":250,"width":100,"height":100,"color":"#000000","fill":true}]`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${systemPrompt}\n\nRequest: ${prompt}` }]
                }]
            })
        });

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('No response received');
        }

        const [message, ...rest] = text.split('\n').filter(Boolean);
        const jsonText = rest.join('\n');

        try {
            const instructions = JSON.parse(jsonText);
            return { message, instructions };
        } catch (e) {
            console.error('Failed to parse instructions:', e);
            throw new Error('Invalid drawing format received');
        }
    } catch (error) {
        console.error('AI error:', error);
        throw error;
    }
}

function drawShapes(instructions) {
    if (!Array.isArray(instructions)) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    instructions.forEach(shape => {
        ctx.beginPath();
        ctx.strokeStyle = shape.color || '#000000';
        ctx.fillStyle = shape.color || '#000000';
        
        switch (shape.action) {
            case 'draw_rectangle':
                ctx.rect(shape.x, shape.y, shape.width, shape.height);
                break;
            case 'draw_circle':
                ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
                break;
            case 'draw_line':
                ctx.moveTo(shape.x1, shape.y1);
                ctx.lineTo(shape.x2, shape.y2);
                break;
        }
        
        if (shape.fill) {
            ctx.fill();
        }
        ctx.stroke();
    });
    
    saveState(undoStack);
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
        if (result.instructions) {
            drawShapes(result.instructions);
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

