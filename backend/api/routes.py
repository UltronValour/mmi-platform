from flask import request, jsonify
from backend.services.model_router import route_model
from backend.services.history_service import get_history, clear_history


def route_prediction(model_name):
    input_data = request.get_json()

    if input_data is None:
        return jsonify({"error": "No JSON body provided"}), 400

    try:
        result = route_model(model_name, input_data)
        return jsonify(result)
    except ValueError as e:
        return jsonify({"error": str(e), "not_found": True}), 404
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


def get_history_route():
    result = get_history()
    return jsonify(result)

def clear_history_route():
    try:
        clear_history()
        return jsonify({"success": True, "message": "History cleared successfully"})
    except Exception as e:
        return jsonify({"error": f"Failed to clear history: {str(e)}"}), 500