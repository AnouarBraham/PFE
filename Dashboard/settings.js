async function getLoggedInUserEmail() {
    try {
        const response = await fetch('http://localhost:3000/user/userInfo', {
            method: 'GET',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user information');
        }

        const userInfo = await response.json();
        const loggedInUserEmail = userInfo.email;
        return loggedInUserEmail;
    } catch (error) {
        console.error('Error retrieving logged-in user email:', error);
        throw new Error('Failed to retrieve logged-in user email');
    }
}



async function fetchNotifications() {
    try {
        const loggedInUserEmail = await getLoggedInUserEmail();
        const response = await fetch(`http://localhost:3000/user/notifications?email=${loggedInUserEmail}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch notifications');
        }

        const notifications = await response.json();
        console.log(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}

async function updateNotificationSettings(email, isEnabled) {
    try {
        const response = await fetch('http://localhost:3000/user/update-notification-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                isEnabled: isEnabled
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update notification settings');
        }

        const responseData = await response.json();
        console.log(responseData); // Log the response data (optional)
    } catch (error) {
        console.error('Error updating notification settings:', error);
    }
}






document.addEventListener('DOMContentLoaded', async function() {
    // Fetch notifications when the page loads
    await fetchNotifications();

    // Add event listener to the notification toggle checkbox
    const notificationToggle = document.getElementById('notification-toggle');
    notificationToggle.addEventListener('change', async function() {
        console.log('Notification toggle changed:', this.checked);
        const isEnabled = this.checked; // Get the new notification setting
        const loggedInUserEmail = await getLoggedInUserEmail();
        console.log('Logged-in user email:', loggedInUserEmail);
        console.log('Notification setting updated:', isEnabled);
    });

    // Load initial notification setting
    const loggedInUserEmail = await getLoggedInUserEmail();
    const savedNotificationSetting = localStorage.getItem(`notificationSetting_${loggedInUserEmail}`);
    
    // If the notification setting is not found in local storage, set the checkbox to be checked by default
    if (savedNotificationSetting === null) {
        notificationToggle.checked = true;
        localStorage.setItem(`notificationSetting_${loggedInUserEmail}`, true);
    } else {
        // Otherwise, set the checkbox according to the saved setting
        notificationToggle.checked = savedNotificationSetting === 'true';
    }

    // Save notification setting when the form is submitted
    const settingsForm = document.getElementById('settings-form');
    settingsForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent the default form submission
        const isEnabled = notificationToggle.checked; // Get the current notification setting
        const loggedInUserEmail = await getLoggedInUserEmail();
        await updateNotificationSettings(loggedInUserEmail, isEnabled); // Update notification settings
        localStorage.setItem(`notificationSetting_${loggedInUserEmail}`, isEnabled); // Save the setting in local storage
        console.log('Notification setting saved:', isEnabled);

        // Instead of redirecting immediately, show a success message
        // You can show an alert or a message on the page instead of redirecting
        alert('Settings saved successfully');
    });
});

// Function to handle form submission and save settings
function saveSettings(event) {
    event.preventDefault();
    
    // Get selected timezone from the form
    const selectedTimezone = document.getElementById('timezone').value;
    
    // Store the selected timezone in localStorage
    localStorage.setItem('selectedTimezone', selectedTimezone);

}

// Event listener for form submission
document.getElementById('settings-form').addEventListener('submit', saveSettings);

