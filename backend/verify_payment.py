import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def register_user(email, password, role="tenant", name="Test User"):
    url = f"{BASE_URL}/auth/register"
    data = {
        "email": email,
        "password": password,
        "full_name": name,
        "role": role
    }
    response = requests.post(url, json=data)
    return response

def login(email, password):
    url = f"{BASE_URL}/auth/login"
    data = {
        "username": email,
        "password": password
    }
    response = requests.post(url, data=data)
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def submit_payment(token, amount, month_for, transaction_id):
    url = f"{BASE_URL}/payments/submit"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "amount": amount,
        "month_for": month_for,
        "transaction_id": transaction_id
    }
    print(f"Submitting payment: {data}")
    response = requests.post(url, json=data, headers=headers)
    return response

def get_my_payments(token):
    url = f"{BASE_URL}/payments/my-history"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    return response

def main():
    timestamp = int(time.time())
    tenant_email = f"tenant_pay_{timestamp}@example.com"
    password = "password123"

    print(f"1. Registering Tenant: {tenant_email}")
    res = register_user(tenant_email, password, role="tenant", name="Tenant Payer")
    if res.status_code != 200:
        print(f"Failed to register tenant: {res.text}")
        return

    print("2. Logging in Tenant")
    tenant_token = login(tenant_email, password)
    if not tenant_token:
        print("Failed to login tenant")
        return

    print("3. Submitting Payment")
    res = submit_payment(tenant_token, 5000.0, "October 2023", "UPI123456")
    print(f"Submit Response: {res.status_code} - {res.text}")
    
    if res.status_code != 200:
        print("Failed to submit payment")
        return

    print("4. Verifying Payment History")
    res = get_my_payments(tenant_token)
    if res.status_code != 200:
        print(f"Failed to get history: {res.text}")
        return
    
    history = res.json()
    print(f"Payment History: {json.dumps(history, indent=2)}")
    
    if len(history) > 0 and history[0]["transaction_id"] == "UPI123456" and history[0]["status"] == "pending":
        print("SUCCESS: Payment submitted and visible in history.")
    else:
        print("FAILURE: Payment not found or incorrect status.")

if __name__ == "__main__":
    main()
