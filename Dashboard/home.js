let menuItems;
let bottomMenuItems;

function removeActiveClass() {
    menuItems.forEach(menuItem => {
        menuItem.classList.remove('active');
    });
    bottomMenuItems.forEach(menuItem => {
        menuItem.classList.remove('active');
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    // Define menuItems and bottomMenuItems variables in the global scope
    menuItems = document.querySelectorAll('.sidebar--items a'); // Select main sidebar items
    bottomMenuItems = document.querySelectorAll('.sidebar--bottom--items a'); // Select bottom sidebar items

    // Add hover effect to main sidebar items
    menuItems.forEach(item => {
        item.addEventListener('mouseover', function(event) {
            removeActiveClass(); // Remove active class from all menu items
            item.classList.add('active'); // Add active class to the hovered item
        });
    });

    // Add hover effect to bottom sidebar items
    bottomMenuItems.forEach(item => {
        item.addEventListener('mouseover', function(event) {
            removeActiveClass(); // Remove active class from all menu items
            item.classList.add('active'); // Add active class to the hovered item
        });
    });







    // Add logic to redirect users based on their department
    document.querySelector('a[href="dashboardStore.html"]').addEventListener('click', async function(event) {
        event.preventDefault(); // Prevent default link behavior

        try {
            const response = await fetch('http://localhost:3000/user/getUser', {
                method: 'GET',
                credentials: "include"
            });

            if (response.ok) {
                const userData = await response.json();
                const userDepartment = userData.department;

                if (userDepartment === 'Sales') {
                    window.location.href = 'dashboardventestore.html';
                } else if (userDepartment === 'RH') {
                    window.location.href = 'dashboardrhstore.html';
                }
            }
        } catch (error) {
            console.error('Error handling user data:', error);
        }
    });



    document.querySelector('a[href="dashboardProducts.html"]').addEventListener('click', async function(event) {
        event.preventDefault(); // Prevent default link behavior

        try {
            const response = await fetch('http://localhost:3000/user/getUser', {
                method: 'GET',
                credentials: "include"
            });

            if (response.ok) {
                const userData = await response.json();
                const userDepartment = userData.department;

                if (userDepartment === 'Sales') {
                    window.location.href = 'dashboardventeProducts.html';
                } else if (userDepartment === 'RH') {
                    window.location.href = 'dashboardrhProducts.html';
                }
            }
        } catch (error) {
            console.error('Error handling user data:', error);
        }
    });

    // Add logic to redirect users based on their department for Localisation dashboard
    document.querySelector('a[href="dashboardSales.html"]').addEventListener('click', async function(event) {
        event.preventDefault(); // Prevent default link behavior

        try {
            const response = await fetch('http://localhost:3000/user/getUser', {
                method: 'GET',
                credentials: "include"
            });

            if (response.ok) {
                const userData = await response.json();
                const userDepartment = userData.department;

                if (userDepartment === 'Sales') {
                    window.location.href = 'dashboardventeSales.html';
                } else if (userDepartment === 'RH') {
                    window.location.href = 'dashboardrhSales.html';
                }
            }
        } catch (error) {
            console.error('Error handling user data:', error);
        }
    });




    try {
        const response = await fetch('http://localhost:3000/user/getUser', {
            method: 'GET',
            credentials: "include"
        });

        if (response.ok) {
            const userData = await response.json();
            const role = userData.role;

            // Update the text and icon displayed for the settings link based on the user's role
            const settingsLink = document.getElementById('settingsLink');
            if (role === 'admin') {
                settingsLink.innerHTML = '<i class="ri-settings-3-line"></i>&nbsp;&nbsp;&nbsp;&nbsp; Admin Interface'; // Display icon and text for admin role
            } else {
                settingsLink.innerHTML = '<i class="ri-settings-3-line"></i>&nbsp;&nbsp;&nbsp;&nbsp; Settings'; // Display icon and text for other roles
            }

            // Add event listener for clicking on the settings link in the sidebar menu
            settingsLink.addEventListener('click', function(event) {
                event.preventDefault(); // Prevent default link behavior

                // Role-based redirection
                if (role === 'admin') {
                    window.location.href = 'admin-dashboard.html'; // Redirect to admin dashboard
                } else {
                    window.location.href = 'settings.html'; // Redirect to settings page
                }
            });
        } else {
            throw new Error('Failed to fetch user data');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error
    }







    const dashboardItem = document.querySelector('#dashboardItem');
    dashboardItem.addEventListener('mouseover', function(event) {
        removeActiveClass(); // Remove active class from all menu items
        dashboardItem.classList.add('active');
    });

    // Add hover effect to dashboard dropdown menu items
    const dashboardDropdownContent = document.querySelectorAll('.dropdown-content a');
    dashboardDropdownContent.forEach(item => {
        item.addEventListener('mouseover', function(event) {
            removeActiveClass(); // Remove active class from all menu items
            item.classList.add('active');
        });
    });

    
        

    





const contentContainer = document.querySelector('.main--container'); // Container where content is displayed


















    document.getElementById('logoutBtn').addEventListener('click', async function(event) {
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

    // Profile image functionality
        const userId = await getUserId();
        const savedProfileImage = localStorage.getItem(`profileImage_${userId}`);
        const profileImage = document.getElementById("profile").querySelector("img");
        if (savedProfileImage) {
            profileImage.src = savedProfileImage;
        }
    const fileInput = document.getElementById("profile-image-upload");
    fileInput.addEventListener("change", function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const profileImageSrc = e.target.result;
                profileImage.src = profileImageSrc;
                saveProfileImageToLocalStorage(profileImageSrc);
            };
            reader.readAsDataURL(file);
        }
    });

    function saveProfileImageToLocalStorage(profileImageSrc) {
        localStorage.setItem(`profileImage_${userId}`, profileImageSrc);
    }

    async function getUserId() {
        try {
            const response = await fetch('http://localhost:3000/user/userId', {
                method: 'GET',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const userId = await response.text();
                return userId;
            } else {
                throw new Error('Failed to get user ID');
            }
        } catch (error) {
            console.error('Error getting user ID:', error);
            throw error;
        }
    }


    const response = await fetch('http://localhost:3000/user/getUser', {
    method: 'GET',
    credentials: "include"
});

if (response.ok) {
    const data = await response.json();
    let userData = data;
    
    if (!userData) {
        userData = {};
    }
    
    if (userData.first_name) {
        document.getElementById('userName').textContent = userData.first_name;
    }

}

    


    


    const productCountElement = document.getElementById('productCount');
    try {
        const response = await fetch('http://localhost:3000/histovente/count');
        if (response.ok) {
            const count = await response.json();
            productCountElement.textContent = count.toString();
        } else {
            throw new Error('Failed to fetch product count');
        }
    } catch (error) {
        console.error('Error fetching product count:', error);
        productCountElement.textContent = 'N/A';
    }

    const storeCountElement = document.getElementById('storeCount');
    try {
        const response = await fetch('http://localhost:3000/histovente/countMag');
        if (response.ok) {
            const count = await response.json();
            storeCountElement.textContent = count.toString();
        } else {
            throw new Error('Failed to fetch store count');
        }
    } catch (error) {
        console.error('Error fetching store count:', error);
        storeCountElement.textContent = 'N/A';
    }

    const orderCountElement = document.getElementById('ordersCount');
    try {
        const response = await fetch('http://localhost:3000/histovente/orderCount');
        if (response.ok) {
            const count = await response.json();
            orderCountElement.textContent = count.toString();
        } else {
            throw new Error('Failed to fetch orders count');
        }
    } catch (error) {
        console.error('Error fetching orders count:', error);
        orderCountElement.textContent = 'N/A';
    }

        const seasonsDropdown = document.getElementById('seasonsDropdown');
        // Fetch seasons data from NestJS backend
        try {
            const response = await fetch('http://localhost:3000/histovente/seasons');
            if (response.ok) {
                const seasons = await response.json();
                seasons.forEach(season => {
                    const option = document.createElement('option');
                    option.value = season;
                    option.textContent = season;
                    seasonsDropdown.appendChild(option);
                });
            } else {
                console.error('Failed to fetch seasons data');
            }
        } catch (error) {
            console.error('Error fetching seasons data:', error);
        }
        
        // Add an event listener to the dropdown menu
seasonsDropdown.addEventListener('change', async function() {
    const selectedSeason = this.value; // Retrieve the selected season value

    try {
        // Make a fetch request to the backend API endpoint with the selected season value
        const response = await fetch(`http://localhost:3000/histovente/totalSales?season=${selectedSeason}`);
        if (response.ok) {
            // Retrieve the total sales value from the response
            const totalSales = await response.json();

            // Update the UI to display the total sales for the selected season
            const totalSalesElement = document.getElementById('totalSales');
            totalSalesElement.textContent = totalSales.toFixed(2);
        } else {
            throw new Error('Failed to fetch total sales for the selected season');
        }
    } catch (error) {
        console.error('Error fetching total sales:', error);
        // Handle the error (e.g., display an error message to the user)
    }
});
    




try {
    // Fetch total sales data per month
    const response = await fetch('http://localhost:3000/histovente/total-sales-by-month');
    if (response.ok) {
        const salesData = await response.json();

        // Extract labels (months) and total sales
        const months = salesData.map(entry => `${entry.month}/${entry.year}`);
        const totalSales = salesData.map(entry => entry.totalSales);

        // Create a line chart
        const salesChartCanvas = document.getElementById('salesChart');
        new Chart(salesChartCanvas, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Total Sales',
                        data: totalSales,
                        fill: false,
                        borderColor: 'rgb(255, 99, 132)', // Set the border color to red
                        tension: 0.1
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Sales'
                        }
                    }
                }
            }
        });
    } else {
        throw new Error('Failed to fetch sales data');
    }
} catch (error) {
    console.error('Error fetching sales data:', error);
    // Handle the error (e.g., display an error message to the user)
}











    try {
        const response = await fetch('http://localhost:3000/histovente/topProducts');
        if (response.ok) {
            const topProductsData = await response.json();
            const topProductsContainer = document.querySelector('.top-products--container');

            topProductsData.forEach((product, index) => {
                const productTile = document.createElement('div');
                productTile.classList.add('product-tile');
                productTile.innerHTML = `
            <div class="product-details">
                <div class="product-number">${index + 1}#</div>
                <div class="product-name">${product.name}</div>
                <div class="product-quantity"><span class="titletopProduct">Quantity:</span> ${product.quantity}</div>
                <div class="product-total"><span class="titletopProduct">Total Sales:</span> ${product.sales.toFixed(2)}</div>
                <i class="ri-shirt-line clothes-icon"></i>
            </div>
                `;
                topProductsContainer.appendChild(productTile);
            });
        } else {
            throw new Error('Failed to fetch top products data');
        }
    } catch (error) {
        console.error('Error fetching top products data:', error);
        // Handle the error (e.g., display an error message to the user)
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





// JavaScript
document.addEventListener('DOMContentLoaded', async function() {
    const notificationIcon = document.querySelector('.ri-notification-2-line');
    const notificationMenu = document.getElementById('notificationMenu');
    const notificationList = document.getElementById('notificationList');

    // Function to update the notification bell icon
    function updateNotificationIcon(notifications) {
        if (notifications.length > 0) {
            notificationIcon.classList.add('red-icon');
        } else {
            notificationIcon.classList.remove('red-icon');
        }
    }

    try {
        // Fetch notifications from the server
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

        const storedNotifications = notifications;

        // Update the notification bell icon
        updateNotificationIcon(notifications);

        // Clear previous notifications
        notificationList.innerHTML = '';

        notifications.forEach(notification => {
            const listItem = document.createElement('li');
            const message = document.createElement('span');
            message.textContent = notification.message;
            listItem.appendChild(message);
            listItem.classList.add('small'); // Add the small class to the notification list items
            listItem.style.marginRight = '30px'; // Apply margin-right to the list item

            // Create a button to remove the notification
            const removeButton = document.createElement("button");
            removeButton.textContent = "X";
            removeButton.classList.add("remove-button");

            removeButton.addEventListener("click", async (event) => {
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
                    notificationList.removeChild(listItem);

                    // Update the notification bell icon
                    updateNotificationIcon(storedNotifications);
                } catch (error) {
                    console.error('Error removing notification:', error);
                }
            });

            listItem.appendChild(removeButton);
            notificationList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }

    // Click event listener for the notification bell icon
    notificationIcon.addEventListener('click', function() {
        if (notificationMenu.style.display === 'block') {
            notificationMenu.style.display = 'none';
        } else {
            notificationMenu.style.display = 'block';
        }
    });



    // Close the notification menu when clicking outside of it
    document.addEventListener('click', function(event) {
        if (!notificationMenu.contains(event.target) && event.target !== notificationIcon) {
            notificationMenu.style.display = 'none';
        }
    });

    
    


const feedbackIcon = document.getElementById('feedbackIcon');
const popup = document.getElementById('popup');
feedbackIcon.addEventListener('click', function() {
  popup.classList.toggle('active');
  const popupRect = popup.getBoundingClientRect();
  const topPosition = feedbackIcon.offsetTop + feedbackIcon.offsetHeight;
  popup.style.top = `${topPosition}px`;
  popup.style.right = `${window.innerWidth - feedbackIcon.offsetLeft}px`;
  if (popup.classList.contains('active')) {
    document.getElementById('messageInput').focus();
  }
});









const sendMessageButton = document.getElementById('sendMessageButton');

sendMessageButton.addEventListener('click', async function (event) {
    event.preventDefault(); // Prevent the default form submission behavior

    try {
        // Retrieve the logged-in user's email
        const loggedInUserEmail = await getLoggedInUserEmail();

        // Get the feedback message from the input field
        const feedbackMessage = document.getElementById('messageInput').value;

        // Make a POST request to send the feedback
        const response = await fetch('http://localhost:3000/user/send-notification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                senderEmail: loggedInUserEmail,
                recipientEmail: 'admin10@gmail.com', // Specify the recipient email
                message: feedbackMessage
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send feedback');
        }

        const responseData = await response.json();
        alert(responseData.message); // Show success message
    } catch (error) {
        console.error('Error sending feedback:', error);
        alert('Failed to send feedback'); // Show error message
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










    document.addEventListener('DOMContentLoaded', function () {
        window.addEventListener('click', function(event) {
            var dropdowns = document.getElementsByClassName('dropdown-content');
            for (var i = 0; i < dropdowns.length; i++) {
                var dropdown = dropdowns[i];
                if (!dropdown.contains(event.target)) {
                    dropdown.style.display = 'none';
                }
            }
        });
    
        const dashboardLink = document.querySelector('.sidebar--item:nth-child(2)'); // Selecting the "Dashboards" sidebar item
        const dashboardDropdown = document.getElementById('dashboardDropdown');
        const dropdownContent = dashboardDropdown.querySelector('.dropdown-content');
    
        // Event listener for clicking the "Dashboards" sidebar item
        dashboardLink.addEventListener('click', function (event) {
            event.stopPropagation(); // Prevent the body click event from firing
            
            dropdownContent.style.display = 'block';
        });

    });

    

});




