// ============================================
// Photocopy Shop - Main Application
// ============================================

const API_BASE = 'http://localhost:8069';
const APP = {
    token: localStorage.getItem('photocopy_token'),
    user: JSON.parse(localStorage.getItem('photocopy_user') || 'null'),
};

// ============================================
// API Helper Functions
// ============================================

async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'API Error');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================
// Authentication
// ============================================

function isAuthenticated() {
    return APP.token !== null;
}

function logout() {
    localStorage.removeItem('photocopy_token');
    localStorage.removeItem('photocopy_user');
    window.location.href = 'index.html';
}

function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// ============================================
// Utility Functions
// ============================================

function formatCurrency(amount) {
    return `Rs. ${parseFloat(amount).toFixed(2)}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-PK', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// Initialize App
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const pin = document.getElementById('pin').value;
            const errorDiv = document.getElementById('loginError');

            try {
                const result = await apiCall('/api/photocopy/auth/login', 'POST', { pin });

                if (result.success) {
                    localStorage.setItem('photocopy_token', result.token);
                    localStorage.setItem('photocopy_user', JSON.stringify(result.user));
                    window.location.href = 'dashboard.html';
                } else {
                    errorDiv.textContent = result.error;
                    errorDiv.style.display = 'block';
                }
            } catch (error) {
                errorDiv.textContent = 'Login failed. Please try again.';
                errorDiv.style.display = 'block';
            }
        });
    }

    // Logout Button Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Redirect to login if not authenticated
    if (window.location.pathname !== '/index.html' && !isAuthenticated()) {
        // For demo purposes, allow access without auth
        // In production, uncomment this:
        // window.location.href = 'index.html';
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
