// anomaly_detection.js

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

async function loadAnomalyDetection() {
    try {
        // Check if the script has been executed within the past hour using session storage
        const lastExecutionTime = sessionStorage.getItem('anomalyDetectionLastExecution');
        if (!lastExecutionTime || Date.now() - lastExecutionTime > 3600000) {
            const email = await getLoggedInUserEmail();
            const response = await fetch(`http://localhost:3000/histovente/execute-anomaly-detection/${email}`, {
                method: 'GET',
                credentials: 'include'
            });
            const result = await response.json();
            console.log(result.message || result.error);
            
            // Update the last execution time in session storage
            sessionStorage.setItem('anomalyDetectionLastExecution', Date.now());
        }
    } catch (error) {
        console.error('Error loading anomaly detection:', error);
    }

    // Run anomaly detection every hour
    setInterval(loadAnomalyDetection, 3600000); // 3600000 milliseconds = 1 hour
}

// Load anomaly detection on page load
window.addEventListener('load', () => {
    loadAnomalyDetection();
});
