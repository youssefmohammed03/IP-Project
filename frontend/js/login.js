function togglePasswordVisibility(element) {
    password = document.getElementById(element.getAttribute("data-target-id"));
    if (password.type === "password") {
        password.type = "text";
        element.classList.remove("bi-eye-slash");
        element.classList.add("bi-eye");
    } else {
        password.type = "password";
        element.classList.remove("bi-eye");
        element.classList.add("bi-eye-slash");
    }
}

const API_BASE_URL = '/api';

function setCookie(name, value, days = 7) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}

function showError(formId, message) {
    let errorElement = document.getElementById(`${formId}-error`);

    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = `${formId}-error`;
        errorElement.className = 'alert alert-danger mt-3';

        const form = document.getElementById(formId);
        form.insertBefore(errorElement, form.querySelector('button[type="submit"]'));
    }

    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function clearError(formId) {
    const errorElement = document.getElementById(`${formId}-error`);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.errors?.join(', ') || 'Login failed');
        }

        setCookie('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';

        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function register(name, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.errors?.join(', ') || 'Registration failed');
        }

        setCookie('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';

        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-tab-pane');
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        clearError('login-tab-pane');

        const email = document.getElementById('InputEmail1').value;
        const password = document.getElementById('InputPassword1').value;

        if (!email || !password) {
            showError('login-tab-pane', 'Please enter both email and password');
            return;
        }

        const result = await login(email, password);
        
        if (!result.success) {
            showError('login-tab-pane', result.message);
        }
    });
    
    const registerForm = document.getElementById('register-tab-pane');
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        clearError('register-tab-pane');
        
        const name = document.getElementById('InputName').value;
        const email = document.getElementById('InputEmail2').value;
        const password = document.getElementById('InputPassword2').value;
        
        if (!name || !email || !password) {
            showError('register-tab-pane', 'Please fill in all fields');
            return;
        }
        
        if (password.length < 6) {
            showError('register-tab-pane', 'Password must be at least 6 characters long');
            return;
        }
        
        const result = await register(name, email, password);
        
        if (!result.success) {
            showError('register-tab-pane', result.message);
        }
    });
    
    const token = getCookie('token');
    if (token) {
        window.location.href = '/';
    }
});