from backend.database.db import get_connection


def get_history():
    """Fetches all prediction records ordered by most recent first."""
    conn = get_connection()
    try:
        cursor = conn.execute(
            "SELECT * FROM predictions ORDER BY timestamp DESC"
        )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

def clear_history():
    """Deletes all prediction records from the database."""
    conn = get_connection()
    try:
        conn.execute("DELETE FROM predictions")
        conn.commit()
    finally:
        conn.close()
