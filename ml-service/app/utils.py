import numpy as np
from google import genai
from google.genai import types
from app.model_loader import get_features
from config import Config

# create a client
client = genai.Client(api_key=Config.GEMINI_API_KEY)

def prepare_input(user_symptoms):
    features = get_features();

    descriptions = [
        f"{s['severity']} {s['name']} for {s['duration']}" 
        for s in user_symptoms
    ]

    features_text = ", ".join(features)
    
    mapping_prompt = f"""
    You are a medical data mapping assistant.

    You are given:
    1. A FIXED list of valid symptoms (feature list)
    2. A patient's described symptoms

    Your task:
    - Select ONLY the symptoms that EXACTLY match or are semantically closest to the patient's symptoms
    - You MUST choose symptoms ONLY from the provided feature list
    - Do NOT invent new symptoms
    - Do NOT modify symptom names
    - Do NOT return anything outside the list

    STRICT RULES:
    - Output must be a JSON array of strings
    - Each string must EXACTLY match one item from the feature list
    - No explanations, no extra text

    Feature List:
    [{features_text}]

    Patient Symptoms:
    {descriptions}

    Return ONLY:
    ["symptom1", "symptom2"]
    """

    model_name = Config.GEMINI_MODEL
    response = client.models.generate_content(
        model=model_name,
        contents=mapping_prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema={
                "type": "ARRAY",
                "items": {
                    "type": "STRING"
                }
            }
        )
    )
    matched_symptoms = response.parsed
    print(matched_symptoms)
    input_vector = [0] * len(features)

    for s in matched_symptoms:
        if s in features:
            index = features.index(s)
            input_vector[index] = 1;
    return np.array([input_vector])