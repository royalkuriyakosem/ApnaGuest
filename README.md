# PG Management System

## Prerequisites
- Node.js & npm
- Python 3.8+
- Supabase Account

## Setup Instructions

### 1. Database Setup (Supabase)
1. Go to your Supabase Dashboard.
2. Obtain your **Project URL** and **Anon Key**.
3. Obtain your **Transaction Pooler Connection String** (Settings -> Database -> Connection String -> Pooler).
   - Ensure you use IPv4 compatible connection settings if not on an IPv6 network.
   - The backend is configured to use SQLAlchemy which will automatically create the necessary tables on startup for this schema.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment Variables:
   - Open `.env` file.
   - Add your `SUPABASE_URL`, `SUPABASE_KEY` (Anon key), and `DATABASE_URL` (Connection String).

5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`.
   *Note: On first run, the backend will automatically create all required database tables.*

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

## Features

ApnaGuest is a comprehensive Tenant Management System designed to streamline operations for Paying Guest (PG) accommodations. It features a strict role-based architecture ensuring secure and specific access for Admins, Tenants, and Service Agents.

### 1. Authentication & Security
- **Role-Based Access Control (RBAC)**: Secure login and registration with distinct roles:
    - **Admin**: Full system control.
    - **Tenant**: Access to personal dashboard, payments, and complaints.
    - **Service Agent**: Access to assigned tasks and complaints.
- **JWT Authentication**: Stateless, secure session management using JSON Web Tokens.
- **Password Hashing**: Industry-standard bcrypt hashing for user credentials.

### 2. Admin Dashboard
The central hub for PG management, providing granular control over all operations.
- **Tenant Management**:
    - **Pending Approvals**: Review and approve new tenant registrations.
    - **Room Allocation**: Assign rooms to tenants upon approval.
    - **Tenant List**: View all active tenants and their details.
- **Room Management**:
    - **Room Overview**: View list of all rooms with status (Vacant, Occupied, Maintenance).
    - **Add/Edit Rooms**: Create new rooms or update details like rent and capacity.
- **Complaint Management**:
    - **Global View**: Track all complaints reported by tenants.
    - **Status Tracking**: Monitor complaints from 'Open' to 'Resolved'.
    - **Agent Assignment**: Assign service agents (Plumbers, Electricians) to specific complaints.
- **Payment & Financials**:
    - **Payment Verification**: Review tenant payment submissions.
    - **Approve/Reject**: Manually verify transactions and mark payments as 'Paid' or 'Overdue'.
    - **Financial Overview**: Track total revenue and pending dues.

### 3. Tenant Dashboard
A personalized portal for residents to manage their stay.
- **My Room**: View details of the allocated room.
- **Complaint Reporting**:
    - **Raise Issue**: Submit new complaints with descriptions and service types (e.g., Plumbing, Electrical).
    - **Track Status**: Real-time updates on complaint progress (Assigned, In Progress, Resolved).
- **Payments**:
    - **History**: View past payment records.
    - **Submit Payment**: Record new rent payments (upload transaction ID/details for admin verification).

### 4. Service Agent Dashboard
Dedicated interface for maintenance staff.
- **Task List**: View assigned complaints and maintenance requests.
- **Status Updates**: Mark tasks as completed or in progress.

### 5. Backend Architecture
- **Supabase Integration**: Robust Postgres database with Transaction Pooler for IPv4 compatibility.
- **FastAPI Framework**: High-performance, async Python backend.
- **SQLAlchemy ORM**: Strong typing and relationship management for database entities (Users, Rooms, Payments, Complaints).
- **UUIDs**: Modern, scalable primary key usage across the entire database schema.
