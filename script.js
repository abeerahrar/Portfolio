const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');
const themeToggle = document.getElementById('theme-toggle');

let stars = [], shootingStars = [], clouds = [];
let mouse = { x: -1000, y: -1000 };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
}

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

class Cloud {
    constructor() { this.reset(); this.x = Math.random() * canvas.width; }
    reset() {
        this.x = -400;
        this.y = Math.random() * (canvas.height * 0.5);
        this.speed = Math.random() * 0.3 + 0.1;
        this.r = Math.random() * 50 + 40;
    }
    draw() {
        const color = getComputedStyle(document.body).getPropertyValue('--cloud-color').trim();
        if (color === 'transparent' || !color) return;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.arc(this.x + this.r * 0.6, this.y - this.r * 0.4, this.r * 0.8, 0, Math.PI * 2);
        ctx.arc(this.x + this.r * 1.2, this.y, this.r * 0.9, 0, Math.PI * 2);
        ctx.fill();
    }
    update() {
        this.x += this.speed;
        if (this.x > canvas.width + 400) this.reset();
    }
}

class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.2 + 0.5;
        this.baseX = this.x; this.baseY = this.y;
        this.blink = Math.random() * 0.015;
        this.opacity = Math.random();
    }
    draw() {
        const color = getComputedStyle(document.body).getPropertyValue('--star-color').trim();
        if (color === 'transparent' || !color) return;
        this.opacity += this.blink;
        if (this.opacity > 1 || this.opacity < 0.2) this.blink *= -1;
        ctx.save(); ctx.globalAlpha = this.opacity; ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    update() {
        let dx = mouse.x - this.x, dy = mouse.y - this.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) { this.x -= dx / 25; this.y -= dy / 25; }
        else { this.x += (this.baseX - this.x) * 0.05; this.y += (this.baseY - this.y) * 0.05; }
    }
}

class ShootingStar {
    constructor() { this.reset(); }
    reset() {
        // Start from random positions (mostly top/left)
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * (canvas.height / 2);
        this.vx = Math.random() * 8 + 8; // Speed X
        this.vy = Math.random() * 4 + 4; // Speed Y
        this.len = Math.random() * 100 + 50;
        this.active = false;
        // Wait 1-4 seconds before appearing again
        setTimeout(() => { this.active = true; }, Math.random() * 3000 + 1000);
    }
    draw() {
        const color = getComputedStyle(document.body).getPropertyValue('--star-color').trim();
        if (color === 'transparent' || !color || !this.active) return;
        
        ctx.save();
        // Create a tail effect
        let grad = ctx.createLinearGradient(this.x, this.y, this.x - this.vx * 5, this.y - this.vy * 5);
        grad.addColorStop(0, color); 
        grad.addColorStop(1, 'transparent');
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
        ctx.stroke();
        ctx.restore();
    }
    update() {
        if (!this.active) return;
        this.x += this.vx; 
        this.y += this.vy;
        // Reset if it goes off screen
        if (this.x > canvas.width + 300 || this.y > canvas.height + 300) this.reset();
    }
}

function init() {
    // REDUCED STAR COUNT TO 250 (The sweet spot)
    stars = Array.from({length: 250}, () => new Star());
    
    // Keeping 4 shooting stars for activity, but we can lower this to 3 if it's too much
    shootingStars = Array.from({length: 4}, () => new ShootingStar());
    
    clouds = Array.from({length: 8}, () => new Cloud());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const mode = document.documentElement.getAttribute('data-theme');
    if (mode === 'light') {
        clouds.forEach(c => { c.update(); c.draw(); });
    } else {
        stars.forEach(s => { s.update(); s.draw(); });
        shootingStars.forEach(s => { s.update(); s.draw(); });
    }
    requestAnimationFrame(animate);
}

themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
});

window.addEventListener('resize', resize);
resize(); animate();

const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        navLinks.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
    });
});

const sections = document.querySelectorAll('section, main, #about, #contact');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let currentSectionId = '';


    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
        currentSectionId = 'contact';
    } else {
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 150)) {
                currentSectionId = section.getAttribute('id');
            }
        });
    }

    navItems.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
        }
    });
});