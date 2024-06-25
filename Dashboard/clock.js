// Function to update the clock based on the selected timezone
function updateClockByTimezone() {
    const timezoneSelect = document.getElementById('timezone');
    const selectedTimezone = timezoneSelect.value;

    // Store the selected timezone in localStorage
    localStorage.setItem('selectedTimezone', selectedTimezone);

    const timezoneOffset = parseInt(selectedTimezone.replace('gmt-', ''));
    const now = new Date();
    const localTime = now.getTime();
    const localOffset = now.getTimezoneOffset() * 60000;
    const utcTime = localTime + localOffset;
    const newTime = utcTime + (3600000 * timezoneOffset); // Convert to new timezone
    const newDate = new Date(newTime);

    const hour = newDate.getHours();
    const minute = newDate.getMinutes();
    const second = newDate.getSeconds();

    const secondAngle = (second / 60) * 360;
    const minuteAngle = ((minute + second / 60) / 60) * 360;
    const hourAngle = ((hour + minute / 60) / 12) * 360;

    document.querySelector('.hand.second').style.transform = `rotate(${secondAngle}deg)`;
    document.querySelector('.hand.minute').style.transform = `rotate(${minuteAngle}deg)`;
    document.querySelector('.hand.hour').style.transform = `rotate(${hourAngle}deg)`;
}

// Function to set the selected timezone from localStorage
function setSelectedTimezone() {
    const selectedTimezone = localStorage.getItem('selectedTimezone');
    if (selectedTimezone) {
        document.getElementById('timezone').value = selectedTimezone;
    }
}

// Event listener for timezone select change
document.getElementById('timezone').addEventListener('change', updateClockByTimezone);

// Set the selected timezone from localStorage
setSelectedTimezone();

// Update clock initially
updateClockByTimezone();

// Update clock every second
setInterval(updateClockByTimezone, 1000);
