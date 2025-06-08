const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('culoare');
const presetBtns = document.querySelectorAll('.preset');
const grosimeSlider = document.getElementById('grosime');
const grosimeVal = document.getElementById('grosime-val');
const clearBtn = document.getElementById('clear-btn');
const saveBtn = document.getElementById('save-btn');

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
});

// Salvează desenul ca imagine
saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'desen_canvas.png';
    link.href = canvas.toDataURL();
    link.click();
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
