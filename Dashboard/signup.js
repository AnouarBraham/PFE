document.addEventListener('DOMContentLoaded', function() {
    let passwordMessageTimer; // Variable to store timer for message display

    document.getElementById('signupForm').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission behavior

        const first_name = document.getElementById('first_name').value;
        const last_name = document.getElementById('last_name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirm_password = document.getElementById('confirm_password').value;
        const department = document.getElementById('department').value;

        // Validate password
        const passwordMessage = document.getElementById('passwordMessage');
        if (!validatePassword(password)) {
            passwordMessage.textContent = "Password must contain at least 5 characters, one special character, one uppercase letter, and one number.";
            passwordMessage.style.display = 'block'; // Show the message

            // Clear previous timer if exists
            if (passwordMessageTimer) {
                clearTimeout(passwordMessageTimer);
            }

            // Set timer to hide the message after 1 second
            passwordMessageTimer = setTimeout(() => {
                passwordMessage.style.display = 'none';
            }, 10000);

            return; // Stop form submission
        } else {
            passwordMessage.textContent = ""; // Clear previous error message
            passwordMessage.style.display = 'none'; // Hide the message
        }

        // Validate password confirmation
        if (password !== confirm_password) {
            alert("Passwords do not match");
            return; // Stop form submission
        }

        // Submit form data
        try {
            const response = await fetch('http://localhost:3000/user/signup', {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ first_name, last_name, email, password, confirm_password, department })
            });

            if (response.ok) {
                const data = await response.json(); // Parse response JSON
                alert("User has been successfully registered.");
                // Optionally, redirect or display confirmation message
            } else {
                const errorMessage = await response.text();
                alert("Failed to register user: " + errorMessage);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("An error occurred. Please try again later.");
        }
    });
});

function validatePassword(password) {
    // Regular expression to check password requirements
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[A-Z]).{5,}$/;
    return regex.test(password);
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm_password');
    const toggleIcon = document.getElementById('toggleIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        confirmInput.type = 'text'; // Show both password and confirm password fields
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        confirmInput.type = 'password'; // Hide both password and confirm password fields
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}
