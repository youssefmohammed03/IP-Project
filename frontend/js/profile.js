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