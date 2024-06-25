document.addEventListener('DOMContentLoaded', function() {
    // Dark mode functionality
    const darkThemeBtn = document.querySelector('.moon');
    let isDarkModeEnabled = false; // Initialize as false

    // Fetch user email from the server
    fetchUserEmail().then(userEmail => {
        // Store the user's email in local storage
        localStorage.setItem('userEmail', userEmail);

        // Check if dark mode is enabled for this user
        isDarkModeEnabled = localStorage.getItem(`darkMode_${userEmail}`) === 'true';

        // Apply dark mode based on the user's preference
        toggleDarkMode(isDarkModeEnabled);

        // Add event listener for toggle button
        darkThemeBtn.addEventListener('click', function() {
            isDarkModeEnabled = !isDarkModeEnabled; // Toggle the mode
            toggleDarkMode(isDarkModeEnabled);
        });
    }).catch(error => {
        console.error('Failed to fetch user email:', error);
    });

    function toggleDarkMode(enabled) {
        document.body.classList.toggle('dark-mode', enabled);

        // Update local storage with the new value
        const userEmail = localStorage.getItem('userEmail');
        localStorage.setItem(`darkMode_${userEmail}`, enabled);

        // Update the button icons based on the new state
        darkThemeBtn.classList.toggle('ri-moon-line', !enabled);
        darkThemeBtn.classList.toggle('ri-sun-line', enabled);
    }

    async function fetchUserEmail() {
        try {
            const response = await fetch('http://localhost:3000/user/getUser', {
                method: 'GET',
                credentials: 'include'
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch user information');
            }
    
            const userData = await response.json();
            const userEmail = userData.email;
    
            return userEmail;
        } catch (error) {
            throw new Error(`Failed to fetch user email: ${error.message}`);
        }
    }
});
