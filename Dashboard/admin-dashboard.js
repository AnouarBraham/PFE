document.addEventListener('DOMContentLoaded', function () {
    const manageUsersBtn = document.getElementById('manageUsersBtn');
    const pendingUsersBtn = document.getElementById('Pending');
    const userManagementSection = document.getElementById('userManagementSection');
    const userListTableBody = document.querySelector('#userListTable tbody');

    // Event listener for clicking on "Manage Users" button
    manageUsersBtn.addEventListener('click', function (event) {
        event.preventDefault();
        if (userManagementSection.style.display === 'none' || userManagementSection.style.display === '') {
            userManagementSection.style.display = 'block'; // Show user management section
            fetchUsers(); // Fetch users when "Manage Users" button is clicked
        } else {
            userManagementSection.style.display = 'none'; // Hide user management section
        }
    });

    pendingUsersBtn.addEventListener('click', function (event) {
        event.preventDefault();
        if (userManagementSection.style.display === 'none' || userManagementSection.style.display === '') {
            userManagementSection.style.display = 'block'; // Show user management section
            fetchPendingUsers(); // Fetch users when "Manage Users" button is clicked
        } else {
            userManagementSection.style.display = 'none'; // Hide user management section
        }
    });

    // Event delegation for delete and update button click
    userListTableBody.addEventListener('click', function (event) {
        const row = event.target.closest('tr');
        const userId = row.dataset.userId;

        if (event.target.classList.contains('delete-btn')) {
            // Confirm user deletion
            if (confirm('Are you sure you want to delete this user?')) {
                deleteUser(userId); // Call the deleteUser function
            }

        } else if (event.target.classList.contains('accept-btn')) {
            // Confirm user acceptance
            if (confirm('Accept this user?')) {
                approveUser(userId); // Call the approveUser function
            }

        } else if (event.target.classList.contains('deletePending-btn')) {
            // Confirm pending user deletion
            if (confirm('Delete this user?')) {
                deletePendingUser(userId); // Call the deletePendingUser function
            }

        } else if (event.target.classList.contains('update-btn')) {
            // Replace the department cell with an input field
            const departmentCell = row.cells[3];
            if (departmentCell.children.length === 0) {
                const input = document.createElement('input');
                input.value = departmentCell.textContent.trim();
                input.classList.add('edit-field');
                departmentCell.textContent = '';
                departmentCell.appendChild(input);
            }

            // Show the "Save" button
            const saveBtn = row.querySelector('.save-btn');
            saveBtn.style.display = 'inline-block';
        }
    });

    // Event listener for save button click
    userListTableBody.addEventListener('click', function (event) {
        if (event.target.classList.contains('save-btn')) {
            const row = event.target.closest('tr');
            const userId = row.dataset.userId;
            const updatedUserData = {
                department: row.cells[3].querySelector('input').value
            };

            updateUser(userId, updatedUserData);
        }
    });

    // Function to fetch users from the backend
    function fetchUsers() {
        fetch('http://localhost:3000/user/getusers')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                return response.json();
            })
            .then(users => {
                // Clear existing user list table
                userListTableBody.innerHTML = '';

                // Populate user list table with user data
                users.forEach(user => {
                    const userRow = document.createElement('tr');
                    userRow.dataset.userId = user._id; // Set the user ID as a data attribute
                    userRow.innerHTML = `
                        <td>${user.first_name}</td>
                        <td>${user.last_name}</td>
                        <td>${user.email}</td>
                        <td>${user.department}</td>
                        <td>
                            <button class="update-btn">Update</button>
                            <button class="delete-btn">Delete</button>
                            <button class="save-btn" style="display:none;">Save</button>
                        </td>
                    `;
                    userListTableBody.appendChild(userRow);
                });
            })
            .catch(error => {
                console.error('Error fetching users:', error);
                // Handle error
            });
    }

    function fetchPendingUsers() {
        fetch('http://localhost:3000/user/getusersPending')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch pending users');
                }
                return response.json();
            })
            .then(users => {
                // Clear existing user list table
                userListTableBody.innerHTML = '';

                // Populate user list table with pending user data
                users.forEach(user => {
                    const userRow = document.createElement('tr');
                    userRow.dataset.userId = user._id; // Set the user ID as a data attribute
                    userRow.innerHTML = `
                        <td>${user.first_name}</td>
                        <td>${user.last_name}</td>
                        <td>${user.email}</td>
                        <td>${user.department}</td>
                        <td>
                            <button class="accept-btn">Accept</button>
                            <button class="deletePending-btn">Delete</button>
                        </td>
                    `;
                    userListTableBody.appendChild(userRow);
                });
            })
            .catch(error => {
                console.error('Error fetching pending users:', error);
                // Handle error
            });
    }

    // Function to delete a user
    function deleteUser(userId) {
        fetch(`http://localhost:3000/user/delete/${userId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete user');
                }
                return response.json();
            })
            .then(() => {
                fetchUsers(); // Fetch updated list of users after deletion
            })
            .catch(error => {
                console.error('Error deleting user:', error);
                // Handle error
            });
    }

    function approveUser(userId) {
        fetch(`http://localhost:3000/user/approve/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to approve user');
                }
                return response.json();
            })
            .then(data => {
                console.log('User approved successfully:', data);
                // Optionally, refresh the pending users list
                fetchPendingUsers();
            })
            .catch(error => {
                console.error('Error approving user:', error);
                // Handle error
            });
    }

    function deletePendingUser(userId) {
        fetch(`http://localhost:3000/user/pending/${userId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete pending user');
                }
                return response.json();
            })
            .then(() => {
                fetchUsers(); // Fetch updated list of users after deletion
            })
            .catch(error => {
                console.error('Error deleting pending user:', error);
                // Handle error
            });
    }

    // Function to update a user
    function updateUser(userId, updatedUserData) {
        fetch(`http://localhost:3000/user/update/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedUserData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update user');
                }
                return response.json();
            })
            .then(() => {
                fetchUsers(); // Fetch updated list of users after updating
            })
            .catch(error => {
                console.error('Error updating user:', error);
                // Handle error
            });
    }
});

  
  
  
  
  
  document.addEventListener('DOMContentLoaded', function () {
    const sendEmailBtn = document.querySelector('.send-email-btn');
    const recipientEmailInput = document.getElementById('recipientEmail');
    const messageInput = document.getElementById('message');
    const notifyUsersBtn = document.getElementById('notifyUsersBtn');
    const userNotifyEmail = document.getElementById('userNotifyEmail');
  
    // Variable to track the visibility state of userNotifyEmail
    let userNotifyEmailVisible = false;
  
    // Event listener for clicking on "Notify Users" button
    notifyUsersBtn.addEventListener('click', function (event) {
        event.preventDefault();
        if (userNotifyEmailVisible) {
            userNotifyEmail.style.display = 'none'; // Hide user notify email section
            userNotifyEmailVisible = false;
        } else {
            userNotifyEmail.style.display = 'block'; // Show user notify email section
            userNotifyEmailVisible = true;
            fetchUserEmails(); // Fetch users' emails to populate the dropdown
        }
    });
  
    // Fetch users' emails to populate the dropdown
    function fetchUserEmails() {
        // Clear the recipientEmail select element before populating
        recipientEmailInput.innerHTML = '';
  
        fetch('http://localhost:3000/user/getusers')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                return response.json();
            })
            .then(users => {
                users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.email;
                    option.textContent = user.email;
                    recipientEmailInput.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error fetching users:', error);
                // Handle error
            });
    }
  
    // Event listener for clicking on the "Send Email" button
    sendEmailBtn.addEventListener('click', async function (event) {
        event.preventDefault();
  
        try {
            // Retrieve the logged-in user's email
            const loggedInUserEmail = await getLoggedInUserEmail();
  
            // Get the selected recipient's email and message
            const recipientEmail = recipientEmailInput.value;
            const message = messageInput.value;
  
            // Make a POST request to send the email
            const response = await fetch('http://localhost:3000/user/send-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    senderEmail: loggedInUserEmail,
                    recipientEmail,
                    message
                })
            });
  
            if (!response.ok) {
                throw new Error('Failed to send email');
            }
  
            const responseData = await response.json();
            alert(responseData.message); // Show success message
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email'); // Show error message
        }
    });
  
    async function getLoggedInUserEmail() {
        try {
            // Make a GET request to fetch the logged-in user's information
            const response = await fetch('http://localhost:3000/user/userInfo', {
                method: 'GET',
                credentials: 'include', // Send cookies with the request
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
  });
  
  
  
  document.getElementById('logout').addEventListener('click', async function(event) {
      event.preventDefault();
  
      try {
          const response = await fetch('http://localhost:3000/user/logout', {
              method: 'GET',
              credentials: "include"
          });
          if (response.ok) {
              window.location.href = 'login.html';
          } else {
              const errorMessage = await response.text();
              alert("Failed to log out: " + errorMessage);
          }
      } catch (error) {
          console.error("Error logging out:", error);
          alert("An error occurred while logging out. Please try again later.");
      }
  });
  