export function initParticles() {
    particlesJS('particles-js', {
        particles: {
            number: { value: 70 },
            color: { value: '#00eaff' },
            shape: { type: 'circle' },
            opacity: { value: 0.6 },
            size: { value: 3 },
            move: {
                enable: true,
                speed: 2
            }
        },
        interactivity: {
            events: {
                onhover: {
                    enable: true,
                    mode: 'repulse'
                }
            }
        }
    });
}
