from flask import Blueprint, request, jsonify
from app.predictor import predict_top3
from app.logger import setup_logger
from app.utils import prepare_input

bp = Blueprint("routes", __name__)
logger = setup_logger()

@bp.route("/api/disease/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        if not data or "symptoms" not in data:
            return jsonify({
            "success": False,
            "message": "Missing symptoms",
            "data": None
        }), 400

        user_symptoms = data.get("symptoms")
        final_input = prepare_input(user_symptoms)

        result=predict_top3(final_input)

        return jsonify({
            "success": True,
            "message": "Prediction successful",
            "data": {
                "predictions": result
            }
        }), 200
    
    except Exception as e:
        logger.error(f"Error: {str(e)}")

        return jsonify({
            "success": False,
            "message": "Internal server error",
            "data": None
        }), 500