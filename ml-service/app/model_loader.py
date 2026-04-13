from keras.models import load_model
from keras.layers import Dense, InputLayer
import pickle
import json
import os
from config import Config

model = None
label_encoder = None
features = None
dropped_features = None

class CustomDense(Dense):
    def __init__(self, *args, **kwargs):
        kwargs.pop('quantization_config', None)
        super().__init__(*args, **kwargs)

class CustomInputLayer(InputLayer):
    def __init__(self, *args, **kwargs):
        kwargs.pop('optional', None)
        super().__init__(*args, **kwargs)

def load_artifacts():
    global model, label_encoder, features
    custom_objects = {
        'Dense': CustomDense,
        'InputLayer': CustomInputLayer
    }
    model = load_model(Config.MODEL_PATH, custom_objects=custom_objects)

    with open(Config.ENCODER_PATH, "rb") as f:
        label_encoder = pickle.load(f)

    with open(Config.FEATURE_PATH, "r") as f:
        features = json.load(f)
    
    if os.path.exists(Config.DROPPED_FEATURES_PATH):
        with open(Config.DROPPED_FEATURES_PATH, "r") as f:
            dropped_features = json.load(f)
    else:
        dropped_features = []

def get_features():
    if features is None:
        load_artifacts() 
    return features

def get_dropped_features():
    if dropped_features is None:
        load_artifacts()
    return dropped_features
def get_model():
    if model is None:
        load_artifacts() 
    return model
def get_label_encoder():
    if label_encoder is None:
        load_artifacts() 
    return label_encoder