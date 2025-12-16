import sqlite3

DB_PATH = "sql_app.db"

def inspect_table():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(payments)")
    columns = cursor.fetchall()
    print("Columns in payments table:")
    for col in columns:
        print(col)
    conn.close()

def add_column():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE payments ADD COLUMN transaction_id VARCHAR")
        conn.commit()
        print("Added transaction_id column.")
    except Exception as e:
        print(f"Error adding column: {e}")
    conn.close()

if __name__ == "__main__":
    inspect_table()
    add_column()
    inspect_table()
