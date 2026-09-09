import os
import json
import io

import numpy as np
import tensorflow as tf

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image


# ============================================================
# PATH CONFIGURATION
# ============================================================

# Gets the Arogyai-main project folder
BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

# Trained models
TFLITE_MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "models",
    "skin_classifier.tflite"
)

KERAS_MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "models",
    "skin_classifier.keras"
)

# Class mapping
CLASS_MAPPING_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "models",
    "class_mapping.json"
)


# ============================================================
# LOAD TRAINED MODEL (TFLite preferred for <50MB RAM, Keras fallback)
# ============================================================

print("=" * 60)
print("Loading ArogyAI Skin Disease Model...")
print("=" * 60)

tflite_interpreter = None
tflite_input_details = None
tflite_output_details = None
keras_model = None
active_backend = None

# 1. Attempt TFLite (Ultra-low RAM < 50MB, prevents Render Free Tier OOM crashes)
if os.path.exists(TFLITE_MODEL_PATH):
    try:
        try:
            import tflite_runtime.interpreter as tflite_rt
            tflite_interpreter = tflite_rt.Interpreter(model_path=TFLITE_MODEL_PATH)
        except ImportError:
            import tensorflow as tf
            tflite_interpreter = tf.lite.Interpreter(model_path=TFLITE_MODEL_PATH)

        tflite_interpreter.allocate_tensors()
        tflite_input_details = tflite_interpreter.get_input_details()
        tflite_output_details = tflite_interpreter.get_output_details()
        active_backend = "TFLite (Low-RAM)"
        print(f"Loaded TFLite model successfully: {TFLITE_MODEL_PATH}")
    except Exception as tfl_err:
        print(f"Notice: TFLite load failed ({tfl_err}), falling back to Keras...")

# 2. Attempt Keras model if TFLite not loaded
if tflite_interpreter is None and os.path.exists(KERAS_MODEL_PATH):
    try:
        import tensorflow as tf
        keras_model = tf.keras.models.load_model(KERAS_MODEL_PATH)
        active_backend = "Keras EfficientNetB0"
        print(f"Loaded Keras model successfully: {KERAS_MODEL_PATH}")
    except Exception as keras_err:
        print("ERROR: Could not load Keras model.")
        print(keras_err)
        raise

if tflite_interpreter is None and keras_model is None:
    raise RuntimeError("Neither TFLite nor Keras model could be loaded.")

def run_inference(img_array: np.ndarray) -> np.ndarray:
    if tflite_interpreter is not None:
        tflite_interpreter.set_tensor(tflite_input_details[0]['index'], img_array)
        tflite_interpreter.invoke()
        return tflite_interpreter.get_tensor(tflite_output_details[0]['index'])
    elif keras_model is not None:
        return keras_model.predict(img_array, verbose=0)
    else:
        raise RuntimeError("No model loaded for inference.")


# ============================================================
# LOAD CLASS MAPPING
# ============================================================

try:

    with open(CLASS_MAPPING_PATH, "r") as file:
        class_mapping = json.load(file)

    print("Class mapping loaded successfully!")
    print(f"Number of classes: {len(class_mapping)}")

except Exception as error:

    print("ERROR: Could not load class mapping.")
    print(error)
    raise


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="ArogyAI Skin Disease Detection API",
    description="AI-powered skin disease prediction API",
    version="1.0.0"
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# HOME / HEALTH CHECK
# ============================================================

@app.get("/")
def home():

    return {
        "success": True,
        "message": "ArogyAI Skin Disease Detection API is running",
        "model": "EfficientNetB0",
        "backend": active_backend,
        "classes": len(class_mapping)
    }


# ============================================================
# MODEL INFORMATION
# ============================================================

@app.get("/model-info")
def model_info():

    return {
        "success": True,
        "model": "EfficientNetB0",
        "backend": active_backend,
        "number_of_classes": len(class_mapping),
        "classes": list(class_mapping.values())
    }


# ============================================================
# SKIN IMAGE PREDICTION
# ============================================================

@app.post("/predict")
async def predict_skin(
    image: UploadFile = File(...)
):

    try:

        # ----------------------------------------------------
        # 1. CHECK FILE TYPE
        # ----------------------------------------------------

        if not image.content_type:
            return {
                "success": False,
                "error": "Could not determine image type."
            }

        allowed_types = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ]

        if image.content_type not in allowed_types:

            return {
                "success": False,
                "error": (
                    "Invalid image format. "
                    "Please upload JPG, JPEG, PNG or WEBP."
                )
            }


        # ----------------------------------------------------
        # 2. READ IMAGE
        # ----------------------------------------------------

        image_bytes = await image.read()

        if not image_bytes:

            return {
                "success": False,
                "error": "The uploaded image is empty."
            }


        # ----------------------------------------------------
        # 3. OPEN IMAGE
        # ----------------------------------------------------

        img = Image.open(
            io.BytesIO(image_bytes)
        )


        # ----------------------------------------------------
        # 4. CONVERT TO RGB
        # ----------------------------------------------------

        img = img.convert("RGB")


        # ----------------------------------------------------
        # 5. RESIZE IMAGE
        # ----------------------------------------------------

        img = img.resize(
            (224, 224)
        )


        # ----------------------------------------------------
        # 6. CONVERT IMAGE TO NUMPY ARRAY
        # ----------------------------------------------------

        img_array = np.array(
            img,
            dtype=np.float32
        )


        # ----------------------------------------------------
        # 7. ADD BATCH DIMENSION
        # ----------------------------------------------------

        img_array = np.expand_dims(
            img_array,
            axis=0
        )


        # ----------------------------------------------------
        # 8. RUN MODEL PREDICTION
        # ----------------------------------------------------

        predictions = run_inference(img_array)


        # ----------------------------------------------------
        # 9. GET PREDICTED CLASS
        # ----------------------------------------------------

        predicted_index = int(
            np.argmax(
                predictions[0]
            )
        )


        # ----------------------------------------------------
        # 10. GET CONFIDENCE
        # ----------------------------------------------------

        confidence = float(
            predictions[0][predicted_index]
        )

        confidence_percent = round(
            confidence * 100,
            2
        )


        # ----------------------------------------------------
        # 11. GET CONDITION NAME
        # ----------------------------------------------------

        predicted_condition = class_mapping.get(
            str(predicted_index),
            "Unknown"
        )


        # ----------------------------------------------------
        # 12. CONFIDENCE THRESHOLD
        # ----------------------------------------------------

        # This is an application-level safeguard.
        # It does NOT mean that 60% confidence is medically
        # accurate.

        CONFIDENCE_THRESHOLD = 60.0


        # ----------------------------------------------------
        # 13. LOW CONFIDENCE RESULT
        # ----------------------------------------------------

        if confidence_percent < CONFIDENCE_THRESHOLD:

            return {

                "success": True,

                "condition": None,

                "confidence": confidence_percent,

                "status": "low_confidence",

                "message": (
                    "The AI could not confidently "
                    "classify this image. "
                    "Please upload a clearer skin image."
                ),

                "medical_notice": (
                    "This AI result is for informational "
                    "and educational purposes only and "
                    "is not a medical diagnosis."
                )
            }


        # ----------------------------------------------------
        # 14. NORMAL PREDICTION RESULT
        # ----------------------------------------------------

        return {

            "success": True,

            "condition": predicted_condition,

            "confidence": confidence_percent,

            "status": "prediction",

            "message": (
                "AI prediction generated successfully."
            ),

            "medical_notice": (
                "This AI result is for informational "
                "and educational purposes only and "
                "is not a medical diagnosis."
            )
        }


    # ========================================================
    # ERROR HANDLING
    # ========================================================

    except Exception as error:

        print("=" * 60)
        print("PREDICTION ERROR")
        print("=" * 60)
        print(error)

        return {

            "success": False,

            "condition": None,

            "confidence": None,

            "status": "error",

            "error": str(error),

            "message": (
                "Unable to process the uploaded image."
            )
        }


# ============================================================
# SERVER START MESSAGE
# ============================================================

print("=" * 60)
print("ArogyAI Backend Ready")
print("=" * 60)
print("Prediction endpoint: POST /predict")
print("API documentation: http://127.0.0.1:8000/docs")
print("=" * 60)