from flask import Flask
from app.routes import bp
from app.model_loader import load_artifacts

def create_app():
    app = Flask(__name__)

    load_artifacts()
    app.register_blueprint(bp)

    return app