import numpy as np
from app.model_loader import get_model, get_label_encoder

def predict_top3(symptom_vector):
    model = get_model()
    label_encoder = get_label_encoder()
    input_data = np.array(symptom_vector).reshape(1, -1)

    preds = model.predict(input_data)[0]

    top_indices = preds.argsort()[-3:][::-1]

    results = []
    for i in top_indices:
        disease = label_encoder.inverse_transform([i])[0]
        confidence = float(preds[i] * 100)

        results.append({
            "disease": disease,
            "confidence": round(confidence, 2)
        })
    
    return results