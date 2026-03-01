from backend.database.db import get_connection


def log_prediction(model_name, input_data, prediction, confidence):
    """Inserts a prediction record into the predictions table."""
    conn = get_connection()
    try:
        conn.execute(
            """
            INSERT INTO predictions (model_name, input_data, prediction, confidence)
            VALUES (?, ?, ?, ?)
            """,
            (model_name, str(input_data), prediction, confidence),
        )
        conn.commit()
    finally:
        conn.close()
