document.addEventListener("DOMContentLoaded", () => {
    // Fetch user information from the server
    fetchUserInfo();
  
    




// Add event listener for Change Password link
const changePasswordLink = document.getElementById('changePasswordLink');
changePasswordLink.addEventListener('click', () => {
    // Prompt user to enter new password
    const newPassword = prompt('Enter your new password:');
    if (newPassword !== null && newPassword !== '') {
        // Send request to update password
        updatePassword(newPassword);
    }
});

// Add event listener for Change First Name link
const changeFirstNameLink = document.getElementById('changefirstName');
changeFirstNameLink.addEventListener('click', () => {
    const newFirstName = prompt('Enter your new first name:');
    if (newFirstName !== null && newFirstName !== '') {
        // Send request to update first name
        updateProfileField('first_name', newFirstName);
    }
});

// Add event listener for Change Last Name link
const changeLastNameLink = document.getElementById('changelastName');
changeLastNameLink.addEventListener('click', () => {
    const newLastName = prompt('Enter your new last name:');
    if (newLastName !== null && newLastName !== '') {
        // Send request to update last name
        updateProfileField('last_name', newLastName);
    }
});

// Add event listener for Change Email link
const changeEmailLink = document.getElementById('changeEmail');
changeEmailLink.addEventListener('click', () => {
    const newEmail = prompt('Enter your new email:');
    if (newEmail !== null && newEmail !== '') {
        // Send request to update email
        updateProfileField('email', newEmail);
    }
});
});



    async function updateProfileField(field, newValue) {
        try {
            const userId = await fetchUserId();
            const response = await fetch(`http://localhost:3000/user/update/${userId}`, {
                method: 'PUT',
                credentials: "include", // Send cookies with the request
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ [field]: newValue })
            });
    
            if (response.ok) {
                // If profile field is updated successfully, fetch updated user information
                fetchUserInfo();
                alert(`${field} updated successfully`);
            } else {
                throw new Error(`Failed to update ${field}`);
            }
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
            alert(`Failed to update ${field}. Please try again later.`);
        }
    }








    // Add event listener for Change Password link
    const changePasswordLink = document.getElementById('changePasswordLink');
    changePasswordLink.addEventListener('click', () => {
        // Prompt user to enter new password
        const newPassword = prompt('Enter your new password:');
        if (newPassword !== null && newPassword !== '') {
            // Send request to update password
            updatePassword(newPassword);
        }
    });

async function fetchUserInfo() {
    try {
        // Make a GET request to fetch user information
        const userInfoResponse = await fetch('http://localhost:3000/user/userInfo', {
            method: 'GET',
            credentials: "include", // Send cookies with the request
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!userInfoResponse.ok) {
            throw new Error('Failed to fetch user information');
        }

        const userInfo = await userInfoResponse.json();

        // Update the DOM with user information
        document.getElementById('firstName').textContent = userInfo.first_name;
        document.getElementById('lastName').textContent = userInfo.last_name;
        document.getElementById('email').textContent = userInfo.email;

        document.getElementById('department').textContent = userInfo.department;
    } catch (error) {
        console.error('Error fetching user information:', error);
    }
}


async function updatePassword(newPassword) {
    try {
        // Make a POST request to update the password
        const response = await fetch('http://localhost:3000/user/changePassword', {
            method: 'POST',
            credentials: "include", // Send cookies with the request
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newPassword })
        });

        if (response.ok) {
            // If password is updated successfully, fetch updated user information
            fetchUserInfo();
            alert('Password updated successfully');
        } else {
            throw new Error('Failed to update password');
        }
    } catch (error) {
        console.error('Error updating password:', error);
        alert('Failed to update password. Please try again later.');
    }
}





async function fetchUserId() {
    try {
        // Make a GET request to fetch user ID
        const userIdResponse = await fetch('http://localhost:3000/user/userId', {
            method: 'GET',
            credentials: "include", // Send cookies with the request
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!userIdResponse.ok) {
            throw new Error('Failed to fetch user ID');
        }

        return await userIdResponse.text();
    } catch (error) {
        console.error('Error fetching user ID:', error);
        throw error;
    }
}







async function removeAccount() {
    // Show confirmation dialog with password input
    const password = prompt('Please enter your password to confirm account deletion:');
    
    if (password) {
        try {
            // Make DELETE request to delete user account with password confirmation
            const response = await fetch('http://localhost:3000/user/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies in the request
                body: JSON.stringify({ password }), // Send password in the request body
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Failed to delete account');
            }

            // Handle success, e.g., redirect to a login page
            window.location.href = 'login.html'; // Redirect to login page after successful deletion
        } catch (error) {
            console.error('Error removing account:', error);
            alert('Failed to remove account. Please check your password and try again.');
        }
    } else {
        console.log('Account removal cancelled');
    }
}


  
