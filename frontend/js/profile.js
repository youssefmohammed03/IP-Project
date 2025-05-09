// Fetch user profile data
fetch('/api/auth/me', {
    method: 'GET'
})
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        return response.json();
    })
    .then(data => {
        // Update the HTML with the fetched data
        document.getElementById('user-full-name').textContent = data.name;
        document.getElementById('user-name').value = data.name;
        document.getElementById('user-email').value = data.email;
        
    })
    .catch(error => {
        console.error('Error:', error);
        window.open('./login', '_self');
    });

function logout() {
    localStorage.removeItem('token');
    setCookie('token', '', 0);
    window.open('./', '_self');
}

function setCookie(name, value, days = 7) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}