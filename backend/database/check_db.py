from backend.database.db import get_connection

conn = get_connection()
cursor = conn.cursor()

cursor.execute("SELECT * FROM predictions")
rows = cursor.fetchall()

for row in rows:
    print(dict(row))

conn.close()