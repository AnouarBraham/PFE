window.onload = async function() {
  try {
    const response = await fetch('http://localhost:3000/user/session-token');
    const data = await response.json();
    const sessionToken = data.sessionToken;

    // Set session token in the hidden input field
    document.getElementById('sessionToken').value = sessionToken;

    // Handle form submission
    document.getElementById('loginForm').addEventListener('submit', async function(event) {
      event.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const sessionToken = document.getElementById('sessionToken').value;

      const response = await fetch('http://localhost:3000/user/signin', {
        method: 'POST',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, sessionToken})
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.message === 'Login successful!') {
          // Save the session token as a cookie
          // Credentials are correct, store user data in session storage
          sessionStorage.setItem('user', JSON.stringify(responseData.user));

          // Fetch user role
          const roleResponse = await fetch(`http://localhost:3000/user/role?email=${email}`);
          const roleData = await roleResponse.json();
          const role = roleData.role;

          // Redirect based on user role
          if (role === 'admin') {
            window.location.href = 'admin-dashboard.html';
          } else {
            window.location.href = 'home.html';
          }
        } else {
          // Something went wrong on the server
          alert(responseData.message);
        }
      } else {
        // Handle server error
        const errorMessage = await response.text();
        if (errorMessage === 'Invalid token') {
          // Redirect to login page if token is invalid
          window.location.href = 'login.html';
        } else {
          alert('Server error. Please try again later.');
        }
      }
    });
  } catch (error) {
    console.error('Error fetching session token:', error);
    // Handle error
  }
};
