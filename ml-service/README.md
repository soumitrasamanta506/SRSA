# 🧠 AI Disease Prediction ML Service

This is a **Flask-based Machine Learning service** that predicts possible diseases based on symptoms using a trained **Artificial Neural Network (ANN)** model.

It is designed to integrate with a **Node.js backend + LLM chatbot (Gemini)** and follows **production-level best practices**.

---

# 🚀 Features

* 🔬 Neural Network-based disease prediction (750+ diseases)
* 📊 Top-3 disease prediction with confidence scores
* ⚙️ Configurable via `.env`
* 🪵 Structured logging with **rotating logs**
* 📦 Clean modular architecture
* 🔗 Easily connectable with Node.js backend

---

# 🏗️ Project Structure

```
ml-service/
│
├── app/
│   ├── __init__.py
│   ├── routes.py
│   ├── predictor.py
│   ├── model_loader.py
│   ├── logger.py
│   ├── utils.py
│
├── models/
│   ├── disease_model.h5
│   ├── label_encoder.pkl
│   ├── features.json
│
├── logs/                  # auto-created
│   └── app.log
│
├── data/                  # auto-created
│   └── dataset.csv
│
├── notebooks/                  # auto-created
│   └── Disease_Prediction.ipynb
│
├── run.py
├── config.py
├── requirements.txt
├── .env
└── README.md
```

---

# ⚙️ Prerequisites

* Python version required: 3.13
* pip
* Virtual environment (recommended)

---

# 🧪 Setup Instructions

## 2️⃣ Create Virtual Environment

### Windows

```
python -m venv venv
venv\Scripts\activate
```

### Mac/Linux

```
python3 -m venv venv
source venv/bin/activate
```

---

## 3️⃣ Install Dependencies

```
pip install -r requirements.txt
```

---

## 4️⃣ Setup Environment Variables

Create a `.env` file:

```
PORT=8000
DEBUG=True

MODEL_PATH=models/disease_model.h5
ENCODER_PATH=models/label_encoder.pkl
FEATURE_PATH=models/features.json
```

---

## 5️⃣ Add Model Files

Download dataset from: <https://drive.google.com/file/d/1WBlt53EfKIM-dxBXiDuTu3wvpeYvi9pO/view?usp=drive_link>
Place it inside /data folder

Place the following inside `models/`:

* `disease_model.h5` → Trained ANN model
* `label_encoder.pkl` → Encoded disease labels
* `features.json` → Feature column order

---

# 🧠 What is `features.json`?

This file ensures correct mapping between input symptoms and model features.

Example:

```
[
  "itching",
  "skin_rash",
  "continuous_sneezing",
  ...
]
```

⚠️ Order must match training dataset exactly.

---

# ▶️ Run the Application

```
python run.py
```

Server will start at:

```
http://localhost:8000
```

---

# 📡 API Endpoints

## 🔹 Predict Disease

```
POST /predict
```

### Request Body

```
{
  "symptoms": [0, 0, 1, 0.6, 0, ...]
}
```

### Response

```
{
  "success": true,
  "message": "Prediction successful",
  "data": {
    "predictions": [
      {
        "disease": "Malaria",
        "confidence": 82.3
      },
      {
        "disease": "Dengue",
        "confidence": 10.5
      }
    ]
  }
}
```

---

# 🪵 Logging

* Logs are stored inside `logs/` folder
* Uses **rotating file handler**
* Automatically creates new log files when size limit is reached

Example log:

```
2026-04-09 10:30:21 - INFO - Prediction request received
2026-04-09 10:30:21 - INFO - Prediction: [...]
```

---

# 🧠 System Flow

```
User → Chatbot (Gemini)
   ↓
Extract Symptoms
   ↓
Node.js Mapping Layer
   ↓
Flask ML API
   ↓
Prediction (Top-3 Diseases)
```

