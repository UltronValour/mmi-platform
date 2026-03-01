import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "predictions.db")


def get_connection():
    """Returns a connection to the predictions.db database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes the database and creates the predictions table if it does not exist."""
    conn = get_connection()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS predictions (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                model_name  TEXT,
                input_data  TEXT,
                prediction  TEXT,
                confidence  REAL,
                timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()
    finally:
        conn.close()
