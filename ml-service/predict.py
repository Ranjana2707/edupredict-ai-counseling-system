
import joblib
import json
import sys
import pandas as pd

MODEL_PATH = "dropout_prediction_model.pkl"


def predict_dropout(student_data):
    # Load trained model
    model = joblib.load(MODEL_PATH)

    # Convert input JSON to DataFrame
    input_data = pd.DataFrame([student_data])

    # Generate prediction
    prediction = int(model.predict(input_data)[0])

    # Generate dropout probability
    probability = float(model.predict_proba(input_data)[0][1])

    # Risk classification
    if probability >= 0.60:
        risk_level = "High"
    elif probability >= 0.40:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "prediction": prediction,
        "dropout_probability": round(probability, 4),
        "dropout_probability_percent": round(probability * 100, 2),
        "risk_level": risk_level
    }


if __name__ == "__main__":
    input_json = sys.argv[1]
    student_data = json.loads(input_json)

    result = predict_dropout(student_data)

    print(json.dumps(result))
