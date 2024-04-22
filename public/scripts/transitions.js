
// Initialising the canvas
var canvas = document.querySelector('canvas'),
  ctx = canvas.getContext('2d');

// Setting the width and height of the canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Setting up the letters
var letters = '</>:",./CodeRealms?][}{=-0CodeRealmss";#$CodeRealms*_-0s8CodeRealms7^&*65CodeRealms%^&CodeRealms2~!1}]';
letters = letters.split('');

// Setting up the columns
var fontSize = 10,
  columns = canvas.width / fontSize;

// Setting up the drops
var drops = [];
for (var i = 0; i < columns; i++) {
    drops[i] = 1;
}

// Setting up the draw function
function draw() {
    // Fading effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < drops.length; i++) {
        var text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillStyle = 'rgba(0, 255, 0, 1)'; // Green color with full opacity
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        drops[i]++;
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.90) {
            drops[i] = 0;
        }
    }
}

// Loop the animation
setInterval(draw, 33);

// After animation, reveal main content
setTimeout(() => {
    canvas.style.display = 'none';
    mainContent.style.display = 'block';
}, 3100);

