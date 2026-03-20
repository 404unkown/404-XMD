// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    initializeModal();
    initializeNavigation();
    initializePairing();
    initializeSocketIO();
    initializeParticles();
    updateCopyrightYear();
});

// ============ MODAL FUNCTIONALITY ============
function initializeModal() {
    const modal = document.getElementById('channelModal');
    const modalClose = document.getElementById('modalClose');
    const confirmFollow = document.getElementById('confirmFollow');

    // Check if user has already followed
    const hasFollowed = localStorage.getItem('hasFollowedChannels');

    if (!hasFollowed) {
        setTimeout(() => {
            modal.classList.add('active');
        }, 1000);
    }

    // Close modal
    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Confirm follow
    confirmFollow.addEventListener('click', () => {
        localStorage.setItem('hasFollowedChannels', 'true');
        modal.classList.remove('active');
        showStatus('Thank you for following! You can now use the bot.', 'success');
    });

    // Close on click outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// ============ NAVIGATION ============
function initializeNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ============ PAIRING FUNCTIONALITY ============
function initializePairing() {
    const requestBtn = document.getElementById('requestPairing');
    const phoneInput = document.getElementById('phone');
    const statusDiv = document.getElementById('status');
    const pairingCodeContainer = document.getElementById('pairingCodeContainer');
    const pairingCodeSpan = document.getElementById('pairingCode');
    const copyBtn = document.getElementById('copyCodeBtn');

    // Copy functionality
    copyBtn.addEventListener('click', copyPairingCode);

    requestBtn.addEventListener('click', async () => {
        const phone = phoneInput.value.trim();

        if (!phone) {
            showStatus('Please enter your phone number', 'error');
            return;
        }

        if (!/^\d+$/.test(phone)) {
            showStatus('Please enter only numbers (country code + number)', 'error');
            return;
        }

        // Show loading state
        requestBtn.disabled = true;
        requestBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Requesting...';
        showStatus('Requesting pairing code...', 'success');

        try {
            const response = await fetch('/api/pair', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ number: phone })
            });

            const data = await response.json();

            if (data.success) {
                // Hide status message
                statusDiv.style.display = 'none';

                // Display pairing code
                pairingCodeSpan.textContent = data.pairingCode;
                pairingCodeContainer.style.display = 'block';

                phoneInput.value = '';
            } else {
                // Check if server is at capacity
                if (response.status === 429) {
                    showStatus(`⚠️ ${data.message}`, 'warning');
                } else {
                    showStatus(`❌ Error: ${data.error || 'Unknown error'}`, 'error');
                }
                pairingCodeContainer.style.display = 'none';
            }
        } catch (error) {
            showStatus('❌ Failed to connect to server', 'error');
            pairingCodeContainer.style.display = 'none';
        } finally {
            requestBtn.disabled = false;
            requestBtn.innerHTML = '<i class="fas fa-key"></i> Get Code';
        }
    });

    // Allow Enter key to submit
    phoneInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            requestBtn.click();
        }
    });
}

// ============ COPY PAIRING CODE ============
function copyPairingCode() {
    const pairingCode = document.getElementById('pairingCode').textContent;
    const copyBtn = document.getElementById('copyCodeBtn');

    navigator.clipboard.writeText(pairingCode).then(() => {
        // Change button text temporarily
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.classList.add('copied');

        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showStatus('Failed to copy code', 'error');
    });
}

// ============ STATUS MESSAGES ============
function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    statusDiv.style.display = 'block';

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

// ============ ENHANCED SOCKET.IO STATS ============
function initializeSocketIO() {
    const socket = io();

    socket.on('statsUpdate', (data) => {
        console.log('Stats received:', data);
        
        // Update basic stats
        document.getElementById('activeSessions').textContent = data.activeSessions || 0;
        document.getElementById('totalUsers').textContent = data.totalUsers || 0;
        
        // Update capacity with percentage
        const capacityEl = document.getElementById('connectionPercentage');
        if (capacityEl) {
            capacityEl.textContent = data.capacity !== undefined ? `${data.capacity}%` : '0%';
        }
        
        // Update capacity bar
        const capacityBar = document.getElementById('connectionBar');
        if (capacityBar) {
            capacityBar.style.width = `${data.capacity || 0}%`;
            
            // Change color based on capacity
            if (data.capacity >= 90) {
                capacityBar.style.background = 'linear-gradient(90deg, #ef4444, #f59e0b)';
            } else if (data.capacity >= 70) {
                capacityBar.style.background = 'linear-gradient(90deg, #f59e0b, #10b981)';
            } else {
                capacityBar.style.background = 'linear-gradient(90deg, #10b981, #8b5cf6)';
            }
        }
        
        // Update uptime
        const uptimeEl = document.getElementById('serverUptime');
        if (uptimeEl) {
            uptimeEl.textContent = data.uptimeString || `${data.uptime || 0} min`;
        }
        
        // Update memory
        const memoryEl = document.getElementById('memoryUsage');
        if (memoryEl) {
            memoryEl.textContent = data.memory ? `${data.memory} MB` : '0 MB';
        }
        
        // Update CPU
        const cpuEl = document.getElementById('cpuLoad');
        if (cpuEl) {
            cpuEl.textContent = data.cpu || '0.0';
        }

        // Show warning if server is near capacity
        const warningDiv = document.getElementById('connectionWarning');
        if (data.capacity >= 100) {
            warningDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Server is FULL! Please try later.';
            warningDiv.className = 'warning-message full';
            warningDiv.style.display = 'block';
        } else if (data.capacity >= 80) {
            warningDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Server near capacity. Queue position available.';
            warningDiv.className = 'warning-message';
            warningDiv.style.display = 'block';
        } else {
            warningDiv.style.display = 'none';
        }
    });

    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
}

// ============ PARTICLES BACKGROUND ============
function initializeParticles() {
    const particlesContainer = document.getElementById('particles');

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(124, 58, 237, 0.3);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${5 + Math.random() * 10}s linear infinite;
        `;
        particlesContainer.appendChild(particle);
    }
}

// Add float animation
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        from { transform: translateY(0) rotate(0deg); }
        to { transform: translateY(-100px) rotate(360deg); }
    }
`;
document.head.appendChild(style);

// ============ COPYRIGHT YEAR ============
function updateCopyrightYear() {
    document.getElementById('year').textContent = new Date().getFullYear();
}

// ============ ADDITIONAL UTILITIES ============

// Prevent form submission on enter
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
    }
});

// Add active class to current nav link on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});