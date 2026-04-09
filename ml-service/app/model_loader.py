from tensorflow.keras.models import load_model
import pickle
import json
from config import Config

model = None
label_encoder = None
features = None

def load_artifacts():
    global model, label_encoder, features
    model = load_model(Config.MODEL_PATH)

    with open(Config.ENCODER_PATH, "rb") as f:
        label_encoder = pickle.load(f)

    with open(Config.FEATURE_PATH, "r") as f:
        features = json.load(f)

def get_features():
    if features is None:
        load_artifacts() 
    return features
def get_model():
    if model is None:
        load_artifacts() 
    return model
def get_label_encoder():
    if label_encoder is None:
        load_artifacts() 
    return label_encoder