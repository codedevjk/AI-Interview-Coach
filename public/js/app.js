// Global state
let currentUser = null;
let authToken = null;

// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// Utility functions
const showElement = (id) => document.getElementById(id).classList.remove('hidden');
const hideElement = (id) => document.getElementById(id).classList.add('hidden');

// API Helper functions
const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        ...options
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Authentication functions
const login = async (email, password) => {
    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: { email, password }
        });

        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        return data;
    } catch (error) {
        throw error;
    }
};

const register = async (email, password, fullName) => {
    try {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: { email, password, fullName }
        });

        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        return data;
    } catch (error) {
        throw error;
    }
};

const logout = () => {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showAuthScreen();
};

// UI Functions
const showAuthScreen = () => {
    hideElement('loading-screen');
    hideElement('main-app');
    showElement('auth-screen');
};

const showMainApp = () => {
    hideElement('loading-screen');
    hideElement('auth-screen');
    showElement('main-app');
    loadDashboardData();
};

const showError = (message) => {
    // Simple error display - you can enhance this
    alert(message);
};

const showSuccess = (message) => {
    // Simple success display - you can enhance this
    console.log('Success:', message);
};

// Dashboard functions
const loadDashboardData = async () => {
    try {
        // Update user info in sidebar
        if (currentUser) {
            document.getElementById('user-name').textContent = currentUser.fullName || 'Interview Candidate';
            document.getElementById('user-avatar').textContent = (currentUser.fullName || 'U').charAt(0).toUpperCase();
        }

        // Load analytics
        const analyticsData = await apiCall('/attempts/analytics');
        updateDashboardStats(analyticsData);

        // Load recent attempts
        const attemptsData = await apiCall('/attempts/recent');
        updateRecentSessions(attemptsData);

    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
};

const updateDashboardStats = (analytics) => {
    document.getElementById('total-sessions').textContent = analytics.totalSessions || 0;
    document.getElementById('average-score').textContent = `${analytics.averageScore || 0}%`;
    
    // Use the data from mock backend
    document.getElementById('improvement').textContent = `+${analytics.improvement || 0}%`;
    document.getElementById('practice-streak').textContent = `${analytics.practiceStreak || 0} days`;
};

const updateRecentSessions = (attempts) => {
    const container = document.getElementById('recent-sessions');
    
    if (!attempts || attempts.length === 0) {
        container.innerHTML = `
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
                <i data-lucide="inbox" class="w-12 h-12 text-gray-500 mx-auto mb-4"></i>
                <p class="text-gray-400">No practice sessions yet. Start your first session!</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    container.innerHTML = attempts.map(attempt => {
        const date = new Date(attempt.date).toLocaleDateString();
        
        return `
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700 flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="p-3 bg-green-500 bg-opacity-20 rounded-lg">
                        <i data-lucide="mic" class="w-6 h-6 text-green-500"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-white">${attempt.question}</h3>
                        <div class="flex items-center space-x-4 text-sm text-gray-400">
                            <span class="flex items-center">
                                <i data-lucide="calendar" class="w-4 h-4 mr-1"></i>
                                ${date}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="text-right">
                        <div class="text-2xl font-bold text-white">${attempt.score}%</div>
                        <div class="text-sm text-green-500">Completed</div>
                    </div>
                    <button class="text-gray-400 hover:text-white" title="${attempt.feedback}">
                        <i data-lucide="eye" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    lucide.createIcons();
};

// Add this function to call the AI feedback endpoint
async function getAIFeedback(audioFilePath, answer) {
    const res = await apiCall('/ai/feedback', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${authToken}` 
        },
        body: JSON.stringify({ audioFilePath, answer })
    });
    if (res.error) {
        showError(res.error);
        return;
    }
    // Display feedback in UI (implement showSuccess or your own UI logic)
    showSuccess("Transcription: " + res.transcript + "\nFeedback: " + res.feedback);
}

// Example usage (hook this to a button or form submission)
document.getElementById('get-feedback-btn')?.addEventListener('click', async () => {
    const audioFilePath = document.getElementById('audio-input').value; // or however you get the file path
    const answer = document.getElementById('answer-input').value;
    await getAIFeedback(audioFilePath, answer);
});

// Initialize app
const initializeApp = () => {
    // Check for existing auth
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        showMainApp();
    } else {
        showAuthScreen();
    }

    // Initialize Lucide icons
    lucide.createIcons();
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Auth form toggles
    document.getElementById('show-register').addEventListener('click', () => {
        hideElement('login-form');
        showElement('register-form');
    });

    document.getElementById('show-login').addEventListener('click', () => {
        hideElement('register-form');
        showElement('login-form');
    });

    // Login form
    document.getElementById('login-btn').addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        try {
            await login(email, password);
            showMainApp();
        } catch (error) {
            showError(error.message);
        }
    });

    // Register form
    document.getElementById('register-btn').addEventListener('click', async () => {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        if (!email || !password) {
            showError('Please fill in all required fields');
            return;
        }

        try {
            await register(email, password, name);
            showMainApp();
        } catch (error) {
            showError(error.message);
        }
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Enter key support for forms
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');
            
            if (!loginForm.classList.contains('hidden')) {
                document.getElementById('login-btn').click();
            } else if (!registerForm.classList.contains('hidden')) {
                document.getElementById('register-btn').click();
            }
        }
    });

    // Initialize the app
    setTimeout(initializeApp, 1000); // Show loading screen briefly
    
    // Add dashboard button event listeners after app initialization
    setTimeout(() => {
        // Practice session button in welcome banner
        const practiceBtns = document.querySelectorAll('button');
        practiceBtns.forEach(btn => {
            if (btn.textContent.includes('Start Practice Session')) {
                btn.addEventListener('click', () => {
                    showSuccess('Practice session started! (Mock functionality)');
                });
            }
        });
        
        // Quick action buttons
        const quickActionButtons = document.querySelectorAll('.card-hover button');
        quickActionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.textContent.trim();
                showSuccess(`${action} clicked! (Mock functionality)`);
            });
        });
        
        // View all sessions button
        const viewAllBtn = document.querySelector('button');
        if (viewAllBtn && viewAllBtn.textContent.includes('View All')) {
            viewAllBtn.addEventListener('click', () => {
                showSuccess('Viewing all sessions! (Mock functionality)');
            });
        }
    }, 2000);
});