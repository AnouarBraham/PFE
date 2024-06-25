import sys
import pymongo
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta
import warnings
import time

# Suppress UserWarnings about feature names
warnings.filterwarnings("ignore", category=UserWarning)

# Get the receiver email from command line arguments
if len(sys.argv) < 2:
    print("Error: No email address provided.")
    sys.exit(1)

receiver_email = sys.argv[1]

# Connect to MongoDB
client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['DatabaseTest']
collection = db['histoventes']

# Define the bot's configuration
bot_email = 'botnotifss@outlook.fr'  # Replace with your Outlook account email
bot_password = 'BotProject456?'  # Replace with your Outlook account password

# Define the notification function
def notify_user(anomalies=None, missing_codemag=None):
    message = ""

    if anomalies:
        message += "Alert: The following documents are missing the 'IDTicket' field:\n\n"
        for anomaly in anomalies:
            message += f"Document ID: {anomaly['_id']}, Details: {anomaly}\n"
    
    if missing_codemag:
        message += "\n\nAlert: The following documents are missing the 'CodeMag' field:\n\n"
        for codemag in missing_codemag:
            message += f"Document ID: {codemag['_id']}, Details: {codemag}\n"

    if message:
        send_email(receiver_email, message)

# Define the email function
def send_email(receiver, message):
    try:
        server = smtplib.SMTP('smtp.office365.com', 587)
        server.starttls()
        server.login(bot_email, bot_password)
        msg = MIMEText(message)
        msg['Subject'] = 'Anomaly Detection Alert'
        msg['From'] = bot_email
        msg['To'] = receiver
        server.sendmail(bot_email, receiver, msg.as_string())
        server.quit()
        print("Email sent successfully.")
    except Exception as e:
        print(f"Failed to send email: {e}")

def detect_anomalies():
    while True:
        anomalies = list(collection.find({"IDTicket": {"$exists": False}}, {"_id": 1, "Famille": 1, "Quantite": 1, "Total": 1, "Reception": 1}))
        missing_codemag = list(collection.find({"CodeMag": {"$exists": False}}, {"_id": 1, "Famille": 1, "Quantite": 1, "Total": 1, "Reception": 1}))
        
        if anomalies or missing_codemag:
            notify_user(anomalies, missing_codemag)

        # Sleep for one hour
        time.sleep(3600)

# Start the anomaly detection process
detect_anomalies()
