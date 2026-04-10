import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Config:
    PORT = int(os.getenv("PORT", 8000))
    DEBUG = os.getenv("DEBUG", "False") == "True"
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL")
    MODEL_PATH = os.path.join(BASE_DIR, os.getenv("MODEL_PATH", "models/disease_model.h5"))
    ENCODER_PATH = os.path.join(BASE_DIR, os.getenv("ENCODER_PATH", "models/label_encoder.pkl"))
    FEATURE_PATH = os.path.join(BASE_DIR, os.getenv("FEATURE_PATH", "models/features.json"))

    LOG_FILE = "logs/app.log"