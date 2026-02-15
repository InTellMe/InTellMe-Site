// Kinematic Network Background
(function() {
    const canvas = document.getElementById('kinetic-background');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    // CONFIGURATION: The "Physics" of the System
    const PARTICLE_COUNT = 120; // Increased from 80 for more nodes
    const CONNECTION_RADIUS = 150; // "Semantic Relevance Threshold"
    const MOUSE_RADIUS = 200; // "Flux Influence"
    const BASE_VELOCITY = 0.5; // "System Temperature"

    // Resize handling
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Mouse tracking (The "Observer")
    let mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle Class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * BASE_VELOCITY;
            this.vy = (Math.random() - 0.5) * BASE_VELOCITY;
            this.size = Math.random() * 2 + 1;
            this.energy = Math.random(); // Alpha value
        }

        update() {
            // Standard Kinetics (Movement)
            this.x += this.vx;
            this.y += this.vy;

            // Boundary Conditions (Bounce off walls)
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            // Mouse Interaction (Stiffness/Repulsion)
            if (mouse.x !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < MOUSE_RADIUS) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
                    const directionX = forceDirectionX * force * this.size;
                    const directionY = forceDirectionY * force * this.size;

                    this.x -= directionX; // Move away from mouse
                    this.y -= directionY;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(6, 182, 212, ${this.energy * 1.0})`; // Increased opacity for better visibility
            ctx.fill();
        }
    }

    // Initialize System
    const init = () => {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    };

    // The Animation Loop (The Solver)
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and Draw Particles
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // Draw Connections (The Network)
        connectParticles();
        
        animationFrameId = requestAnimationFrame(animate);
    };

    // Draw lines between close particles
    const connectParticles = () => {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < CONNECTION_RADIUS) {
                    let opacity = 1 - (distance / CONNECTION_RADIUS);
                    ctx.strokeStyle = `rgba(6, 182, 212, ${opacity * 0.5})`; // Increased opacity for better visibility
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    };

    init();
    animate();
})();

// Mobile menu functionality
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const menuIcon = mobileMenuBtn?.querySelector('.menu-icon');
const closeIcon = mobileMenuBtn?.querySelector('.close-icon');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('active');
        mobileMenu.classList.toggle('hidden', !isOpen);
        menuIcon?.classList.toggle('hidden', isOpen);
        closeIcon?.classList.toggle('hidden', !isOpen);
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileMenu.classList.add('hidden');
            menuIcon?.classList.remove('hidden');
            closeIcon?.classList.add('hidden');
        });
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// Add intersection observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for fade-in effect
document.querySelectorAll('.projects').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});
