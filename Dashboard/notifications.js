document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Fetch logged-in user's email
        const loggedInUserEmail = await getLoggedInUserEmail();

        // Fetch notifications for the logged-in user
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
        const notificationsList = document.getElementById("notifications-list");

        // Function to remove notification from UI
        const removeNotificationFromUI = (listItem) => {
            notificationsList.removeChild(listItem);
        };

        // Populate notifications list
        notifications.forEach((notification) => {
            const listItem = document.createElement("li");

            // Create elements for message and createdAt
            const messageText = document.createElement("span");
            messageText.textContent = notification.message;

            const createdAtText = document.createElement("span");
            const createdAt = new Date(notification.createdAt).toLocaleString();
            createdAtText.textContent = createdAt;

            // Add message and createdAt to the list item
            listItem.appendChild(messageText);
            listItem.appendChild(document.createElement("br"));
            listItem.appendChild(createdAtText);
            
            listItem.classList.add("notification", notification.type);

            // Create a button to remove the notification
            const removeButton = document.createElement("button");
            removeButton.textContent = "X";
            removeButton.classList.add("remove-button");

            removeButton.addEventListener("click", async () => {
                try {
                    // Call API to remove the notification using the email, message, and creation timestamp
                    const removeResponse = await fetch(`http://localhost:3000/user/remove-notification/${loggedInUserEmail}/${encodeURIComponent(notification.message)}/${encodeURIComponent(notification.createdAt)}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!removeResponse.ok) {
                        throw new Error('Failed to remove notification');
                    }

                    // Remove the notification from the UI
                    removeNotificationFromUI(listItem);
                } catch (error) {
                    console.error('Error removing notification:', error);
                    // Handle error
                }
            });

            listItem.appendChild(removeButton);
            notificationsList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        // Handle error
    }
});

async function getLoggedInUserEmail() {
    try {
        // Make a GET request to fetch the logged-in user's information
        const response = await fetch('http://localhost:3000/user/userInfo', {
            method: 'GET',
            credentials: "include", // Send cookies with the request
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user information');
        }

        const userInfo = await response.json();

        // Extract the email from the user information
        const loggedInUserEmail = userInfo.email;

        return loggedInUserEmail;
    } catch (error) {
        console.error('Error retrieving logged-in user email:', error);
        throw new Error('Failed to retrieve logged-in user email');
    }
}
