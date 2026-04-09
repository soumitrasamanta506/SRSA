import numpy as np
from app.model_loader import get_features

def prepare_input(user_symptoms):
    features = get_features();
    input_vector = [0] * len(features)

    for s in user_symptoms:
        if s in features:
            index = features.index(s)
            input_vector[index] = 1;
    return np.array([input_vector])