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

def create_room(token, room_number, rent):
    url = f"{BASE_URL}/rooms/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "room_number": room_number,
        "capacity": 1,
        "rent": rent,
        "status": "available"
    }
    response = requests.post(url, json=data, headers=headers)
    return response

def approve_tenant(admin_token, tenant_id, room_id):
    url = f"{BASE_URL}/admin/approve-tenant/{tenant_id}"
    headers = {"Authorization": f"Bearer {admin_token}"}
    data = {"room_id": room_id}
    response = requests.put(url, json=data, headers=headers)
    return response

def get_me(token):
    url = f"{BASE_URL}/auth/me"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    return response

def main():
    timestamp = int(time.time())
    admin_email = f"admin_{timestamp}@example.com"
    tenant_email = f"tenant_{timestamp}@example.com"
    password = "password123"
    room_number = f"R{timestamp}"

    print(f"1. Registering Admin: {admin_email}")
    res = register_user(admin_email, password, role="admin", name="Admin User")
    if res.status_code != 200:
        print(f"Failed to register admin: {res.text}")
        return

    print("2. Logging in Admin")
    admin_token = login(admin_email, password)
    if not admin_token:
        print("Failed to login admin")
        return

    print(f"3. Creating Room: {room_number}")
    res = create_room(admin_token, room_number, 5000)
    if res.status_code != 200:
        print(f"Failed to create room: {res.text}")
        return
    room_id = res.json()["id"]
    print(f"Room Created: ID {room_id}")

    print(f"4. Registering Tenant: {tenant_email}")
    res = register_user(tenant_email, password, role="tenant", name="Tenant User")
    if res.status_code != 200:
        print(f"Failed to register tenant: {res.text}")
        return
    # We need tenant ID. Usually register returns token, but we need ID.
    # We can get ID by logging in and calling /me (but tenant is not approved yet).
    # Or admin can list pending tenants.
    
    print("5. Logging in Tenant to get ID")
    tenant_token = login(tenant_email, password)
    if not tenant_token:
        print("Failed to login tenant")
        return
    
    res = get_me(tenant_token)
    if res.status_code != 200:
        print(f"Failed to get tenant details: {res.text}")
        return
    tenant_id = res.json()["id"]
    print(f"Tenant ID: {tenant_id}")

    print("6. Approving Tenant with Room Allocation")
    res = approve_tenant(admin_token, tenant_id, room_id)
    if res.status_code != 200:
        print(f"Failed to approve tenant: {res.text}")
        return
    print("Tenant Approved")

    print("7. Verifying Allocation")
    res = get_me(tenant_token)
    if res.status_code != 200:
        print(f"Failed to get tenant details: {res.text}")
        return
    
    data = res.json()
    print(f"Tenant Data: {json.dumps(data, indent=2)}")
    
    if data["is_approved"] and data["room"] and data["room"]["id"] == room_id:
        print("SUCCESS: Tenant approved and room allocated correctly.")
    else:
        print("FAILURE: Allocation verification failed.")

if __name__ == "__main__":
    main()
