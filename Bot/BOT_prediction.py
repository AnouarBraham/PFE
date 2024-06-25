import sys
import pymongo
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta
import warnings
import numpy as np

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
def notify_user(products):
    message = """
    <html>
    <body>
        <h2 style="color: red;">Predicted Information:</h2>
        <p>The following product families have predicted negative sales:</p>
    """
    for product in products:
        predicted_sales = "{:.2f}".format(product['negative_sales'])
        message += f"""
            <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
                <p><strong>Product Family:</strong> <span style="font-weight: bold; color: blue;">{product['family']}</span></p>
                <p><strong>Predicted Sales:</strong> {predicted_sales}</p>
                <p><strong>Predicted Month/Year:</strong> {product['month_year']}</p>
                <p><strong>Total Quantity Needed for Next Year:</strong> {product['quantity_needed_next_year']}</p>
            </div>
        """
    
    message += """
    </body>
    </html>
    """
    send_email(receiver_email, message)

# Define the training function
def train_model(df):
    X = df[['Famille', 'Quantite', 'PrixVente', 'Remise']]  # Features
    y = df['Total']  # Target

    # Preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', MinMaxScaler(), ['Quantite', 'PrixVente', 'Remise']),
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['Famille'])
        ])

    model = Pipeline(steps=[('preprocessor', preprocessor),
                            ('regressor', RandomForestRegressor(random_state=42))])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model.fit(X_train, y_train)

    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)

    print("Training R^2 score:", train_score)
    print("Test R^2 score:", test_score)

    return model

# Define the prediction function
def predict_negative_sales(model, recent_data):
    future_quantity = abs(recent_data['Quantite'].mean())
    future_date = recent_data['Reception'].max() + timedelta(days=30)  # Predict 30 days into the future
    future_month_year = future_date.strftime('%B %Y')
    X_future = recent_data.copy()
    X_future['Quantite'] = future_quantity
    prediction = model.predict(X_future)
    return prediction[0], future_month_year

def predict_quantity_needed_next_year(df):
    quantities = df['Quantite']
    total_quantity = quantities.sum()
    avg_monthly_quantity = total_quantity / df['Reception'].dt.to_period('M').nunique()
    return abs(avg_monthly_quantity * 12)  # Assuming 12 months in a year

# Define the email function
def send_email(receiver, message):
    try:
        server = smtplib.SMTP('smtp.office365.com', 587)
        server.starttls()
        server.login(bot_email, bot_password)
        msg = MIMEText(message, 'html')  # Specify the content type as HTML
        msg['Subject'] = 'Predicted Information Alert'
        msg['From'] = bot_email
        msg['To'] = receiver
        server.sendmail(bot_email, receiver, msg.as_string())
        server.quit()
        print("Email sent successfully.")
    except Exception as e:
        print(f"Failed to send email: {e}")

def main():
    pipeline = [
        {"$match": {"Quantite": {"$lt": 0}}},
        {"$project": {"Famille": 1, "Quantite": 1, "PrixVente": 1, "Remise": 1, "Total": 1, "Reception": 1}},
        {"$group": {
            "_id": "$Famille",
            "Reception": {"$max": "$Reception"},
            "Quantite": {"$sum": "$Quantite"},
            "PrixVente": {"$avg": "$PrixVente"},
            "Remise": {"$avg": "$Remise"},
            "Total": {"$sum": "$Total"}
        }},
        {"$sort": {"Quantite": 1}},
        {"$limit": 10}
    ]
    data = list(collection.aggregate(pipeline))

    if data:
        df = pd.DataFrame(data)
        df['Famille'] = df['_id']
        df.drop(columns=['_id'], inplace=True)

        model = train_model(df)

        products = []
        for index, row in df.iterrows():
            family_data = df[df['Famille'] == row['Famille']]
            future_quantity = abs(family_data['Quantite'].mean())
            future_date = family_data['Reception'].max() + timedelta(days=30)
            future_month_year = future_date.strftime('%B %Y')
            X_future = family_data.copy()
            X_future['Quantite'] = future_quantity
            prediction = model.predict(X_future)[0]
            quantity_needed_next_year = predict_quantity_needed_next_year(family_data)
            products.append({
                "family": row['Famille'],
                "negative_sales": prediction,
                "month_year": future_month_year,
                "quantity_needed_next_year": quantity_needed_next_year
            })

        unique_products = {}
        for product in products:
            family = product['family']
            if family not in unique_products or product['negative_sales'] > unique_products[family]['negative_sales']:
                unique_products[family] = product

        products = list(unique_products.values())
        products.sort(key=lambda x: x['negative_sales'], reverse=True)
        top_products = [product for product in products if product['negative_sales'] < 0]
        top_products = top_products[:10]

        if top_products:
            notify_user(top_products)

if __name__ == "__main__":
    main()
