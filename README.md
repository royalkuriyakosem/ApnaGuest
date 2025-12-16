# PG Management System

## Prerequisites
- Node.js & npm
- Python 3.8+
- Supabase Account

## Setup Instructions

### 1. Database Setup (Supabase)
1. Go to your Supabase Dashboard.
2. Open the **SQL Editor**.
3. Copy the contents of `backend/supabase_schema.sql`.
4. Paste and run the script to create the tables.

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
   - Add your `SUPABASE_URL` and `SUPABASE_KEY` (Anon key).

5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

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
