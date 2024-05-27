// script.js
document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const colorPicker = document.getElementById('color');
    const eraser = document.getElementById('eraser');
    const undoButton = document.getElementById('undo');
    const redoButton = document.getElementById('redo');
    const saveButton = document.getElementById('save');
    const clearButton = document.getElementById('clear');
    const range = document.getElementById('range');
    let currentColor = '#000000'; // Default color
    let isDrawing = false;
    let history = [];
    let redoStack = [];

    function updateButtonStates() {
        undoButton.disabled = history.length === 0;
        redoButton.disabled = redoStack.length === 0;
    }

    // Initial button state update
    updateButtonStates();

    // Utility functions to handle different event types
    function startDrawing(e) {
        isDrawing = true;
        context.beginPath();
        // Handle touch events
        if (e.touches) e = e.touches[0];
        context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    }

    function draw(e) {
        if (!isDrawing) return;
        if (e.touches) e = e.touches[0]; // Handle touch events
        context.strokeStyle = currentColor;
        context.lineWidth = range.value;
        context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        context.stroke();
    }

    function stopDrawing() {
        if (isDrawing) {
            history.push(context.getImageData(0, 0, canvas.width, canvas.height));
            redoStack = []; // Clear redo stack after new drawing
            updateButtonStates();
        }
        isDrawing = false;
    }

    // Drawing events for mouse
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Drawing events for touch
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    // Color selection logic
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(op => op.classList.remove('active'));
            this.classList.add('active');
            currentColor = this.getAttribute('data-color');
        });
    });

    colorPicker.addEventListener('change', function() {
        currentColor = this.value;
        const activeOption = document.querySelector('.color-option.active');
        if (activeOption) {
            activeOption.style.backgroundColor = currentColor;
            activeOption.setAttribute('data-color', currentColor);
        }
    });

    // Clear and save logic
    clearButton.addEventListener('click', function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        history.push(context.getImageData(0, 0, canvas.width, canvas.height));
        updateButtonStates();
    });

    saveButton.addEventListener('click', function() {
        context.save();
        context.globalCompositeOperation = 'destination-over';
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();

        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'picture.png';
        a.click();
    });

    // Eraser logic
    eraser.addEventListener('click', function() {
        currentColor = '#FFFFFF'; // Assuming canvas background is white
    });

    // Undo and redo logic
    undoButton.addEventListener('click', function() {
        if (history.length > 0) {
            redoStack.push(history.pop());
            if (history.length > 0) {
                context.putImageData(history[history.length - 1], 0, 0);
            } else {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }
            updateButtonStates();
        }
    });

    redoButton.addEventListener('click', function() {
        if (redoStack.length > 0) {
            const imageData = redoStack.pop();
            history.push(imageData);
            context.putImageData(imageData, 0, 0);
            updateButtonStates();
        }
    });
});
