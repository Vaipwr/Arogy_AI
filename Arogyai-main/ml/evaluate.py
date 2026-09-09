# pyright: reportMissingImports=false
import os
import json
import numpy as np
import tensorflow as tf

from sklearn.metrics import (
    classification_report,
    confusion_matrix
)

import matplotlib.pyplot as plt


# ============================================================
# 1. PATHS
# ============================================================

DATASET_PATH = r"C:\Users\Vaibhavi\Downloads\Arogyai-main_finall\Arogyai-main\ml\Skin Disease Dataset\archive (5)\SkinDisease\SkinDisease"

TEST_DIR = os.path.join(DATASET_PATH, "test")

MODEL_PATH = r"models\skin_classifier.keras"

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16


# ============================================================
# 2. LOAD MODEL
# ============================================================

print("\nLoading trained model...")

model = tf.keras.models.load_model(MODEL_PATH)

print("Model loaded successfully!")


# ============================================================
# 3. LOAD TEST DATA
# ============================================================

print("\nLoading test dataset...")

test_ds = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    shuffle=False,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="int"
)

class_names = test_ds.class_names

print(f"\nNumber of classes: {len(class_names)}")

print("\nClasses:")
for i, name in enumerate(class_names):
    print(f"{i}: {name}")


# ============================================================
# 4. PREDICTIONS
# ============================================================

print("\nGenerating predictions...")

predictions = model.predict(test_ds)

predicted_labels = np.argmax(predictions, axis=1)

true_labels = np.concatenate(
    [labels.numpy() for _, labels in test_ds],
    axis=0
)


# ============================================================
# 5. CLASSIFICATION REPORT
# ============================================================

print("\n" + "=" * 80)
print("CLASSIFICATION REPORT")
print("=" * 80)

report = classification_report(
    true_labels,
    predicted_labels,
    target_names=class_names,
    digits=4,
    zero_division=0
)

print(report)


# ============================================================
# 6. CONFUSION MATRIX
# ============================================================

print("\nGenerating confusion matrix...")

cm = confusion_matrix(
    true_labels,
    predicted_labels
)

plt.figure(figsize=(16, 14))

plt.imshow(cm)

plt.title("Skin Disease Classification - Confusion Matrix")

plt.colorbar()

plt.xticks(
    range(len(class_names)),
    class_names,
    rotation=90
)

plt.yticks(
    range(len(class_names)),
    class_names
)

plt.xlabel("Predicted Label")
plt.ylabel("True Label")

plt.tight_layout()


# ============================================================
# 7. SAVE CONFUSION MATRIX
# ============================================================

output_path = "confusion_matrix.png"

plt.savefig(
    output_path,
    dpi=200,
    bbox_inches="tight"
)

print(f"\nConfusion matrix saved to: {output_path}")

plt.show()


# ============================================================
# 8. TOP PREDICTION CONFIDENCE
# ============================================================

confidence = np.max(predictions, axis=1)

print("\n" + "=" * 80)
print("CONFIDENCE INFORMATION")
print("=" * 80)

print(
    f"Average prediction confidence: "
    f"{np.mean(confidence) * 100:.2f}%"
)

print(
    f"Minimum prediction confidence: "
    f"{np.min(confidence) * 100:.2f}%"
)

print(
    f"Maximum prediction confidence: "
    f"{np.max(confidence) * 100:.2f}%"
)


# ============================================================
# 9. SAVE RESULTS
# ============================================================

results = {
    "number_of_classes": len(class_names),
    "test_images": len(true_labels),
    "average_confidence": float(np.mean(confidence)),
    "test_accuracy": float(
        np.mean(predicted_labels == true_labels)
    )
}

with open(
    "evaluation_results.json",
    "w"
) as f:
    json.dump(
        results,
        f,
        indent=4
    )

print("\nEvaluation results saved to: evaluation_results.json")

print("\n" + "=" * 80)
print("EVALUATION COMPLETE")
print("=" * 80)