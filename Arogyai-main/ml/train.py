# pyright: reportMissingImports=false
import os
import json
import numpy as np
import tensorflow as tf

layers = tf.keras.layers
models = tf.keras.models
callbacks = tf.keras.callbacks
EarlyStopping = callbacks.EarlyStopping
ReduceLROnPlateau = callbacks.ReduceLROnPlateau
ModelCheckpoint = callbacks.ModelCheckpoint
EfficientNetB0 = tf.keras.applications.EfficientNetB0

from sklearn.utils.class_weight import compute_class_weight


# ============================================================
# 1. SETTINGS
# ============================================================

DATASET_PATH = r"C:\Users\Vaibhavi\Downloads\Arogyai-main_finall\Arogyai-main\ml\Skin Disease Dataset\archive (5)\SkinDisease\SkinDisease"

TRAIN_DIR = os.path.join(DATASET_PATH, "train")
TEST_DIR = os.path.join(DATASET_PATH, "test")

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16
SEED = 42

MODEL_DIR = "models"

os.makedirs(MODEL_DIR, exist_ok=True)


# ============================================================
# 2. LOAD TRAINING DATA
# ============================================================

print("\nLoading training dataset...")

train_ds = tf.keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    validation_split=0.20,
    subset="training",
    seed=SEED,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="int"
)


# ============================================================
# 3. LOAD VALIDATION DATA
# ============================================================

print("\nLoading validation dataset...")

validation_ds = tf.keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    validation_split=0.20,
    subset="validation",
    seed=SEED,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="int"
)


# ============================================================
# 4. LOAD TEST DATA
# ============================================================

print("\nLoading test dataset...")

test_ds = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    shuffle=False,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="int"
)


# ============================================================
# 5. GET CLASS NAMES
# ============================================================

class_names = train_ds.class_names

NUM_CLASSES = len(class_names)

print("\nClasses:")
for i, class_name in enumerate(class_names):
    print(f"{i}: {class_name}")

print(f"\nTotal classes: {NUM_CLASSES}")


# Save class mapping
class_mapping = {
    str(i): class_name
    for i, class_name in enumerate(class_names)
}

with open(
    os.path.join(MODEL_DIR, "class_mapping.json"),
    "w"
) as f:
    json.dump(class_mapping, f, indent=4)


# ============================================================
# 6. PERFORMANCE OPTIMIZATION
# ============================================================

AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.prefetch(AUTOTUNE)
validation_ds = validation_ds.prefetch(AUTOTUNE)
test_ds = test_ds.prefetch(AUTOTUNE)


# ============================================================
# 7. DATA AUGMENTATION
# ============================================================

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.08),
    layers.RandomZoom(0.10),
    layers.RandomContrast(0.10),
], name="data_augmentation")


# ============================================================
# 8. CALCULATE CLASS WEIGHTS
# ============================================================

print("\nCalculating class weights...")

train_labels = []

for _, labels in train_ds.unbatch():
    train_labels.append(labels.numpy())

train_labels = np.array(train_labels)

class_weights_array = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(train_labels),
    y=train_labels
)

class_weights = {
    i: weight
    for i, weight in enumerate(class_weights_array)
}

print("\nClass weights:")
for i, weight in class_weights.items():
    print(f"{class_names[i]}: {weight:.3f}")


# ============================================================
# 9. BUILD EFFICIENTNETB0 MODEL
# ============================================================

print("\nBuilding EfficientNetB0 model...")

base_model = EfficientNetB0(
    include_top=False,
    weights="imagenet",
    input_shape=(224, 224, 3)
)

# Initially freeze pretrained model
base_model.trainable = False


inputs = layers.Input(shape=(224, 224, 3))

x = data_augmentation(inputs)

x = base_model(x, training=False)

x = layers.GlobalAveragePooling2D()(x)

x = layers.Dropout(0.3)(x)

outputs = layers.Dense(
    NUM_CLASSES,
    activation="softmax"
)(x)

model = models.Model(inputs, outputs)


# ============================================================
# 10. COMPILE MODEL
# ============================================================

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.001
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()


# ============================================================
# 11. CALLBACKS
# ============================================================

checkpoint_path = os.path.join(
    MODEL_DIR,
    "skin_classifier_best.keras"
)

callbacks = [

    ModelCheckpoint(
        checkpoint_path,
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1
    ),

    EarlyStopping(
        monitor="val_loss",
        patience=4,
        restore_best_weights=True,
        verbose=1
    ),

    ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.3,
        patience=2,
        verbose=1
    )
]


# ============================================================
# 12. INITIAL TRAINING
# ============================================================

print("\n" + "=" * 60)
print("STARTING INITIAL TRAINING")
print("=" * 60)

history = model.fit(
    train_ds,
    validation_data=validation_ds,
    epochs=10,
    class_weight=class_weights,
    callbacks=callbacks
)


# ============================================================
# 13. FINE-TUNING
# ============================================================

print("\n" + "=" * 60)
print("STARTING FINE-TUNING")
print("=" * 60)

# Unfreeze EfficientNet
base_model.trainable = True

# Keep earlier layers frozen
for layer in base_model.layers[:-30]:
    layer.trainable = False


model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.00001
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)


model.fit(
    train_ds,
    validation_data=validation_ds,
    epochs=10,
    class_weight=class_weights,
    callbacks=callbacks
)


# ============================================================
# 14. LOAD BEST MODEL
# ============================================================

print("\nLoading best model...")

model = tf.keras.models.load_model(
    checkpoint_path
)


# ============================================================
# 15. TEST EVALUATION
# ============================================================

print("\n" + "=" * 60)
print("EVALUATING MODEL ON TEST DATA")
print("=" * 60)

test_loss, test_accuracy = model.evaluate(test_ds)

print(f"\nTest Loss: {test_loss:.4f}")
print(f"Test Accuracy: {test_accuracy * 100:.2f}%")


# ============================================================
# 16. SAVE FINAL MODEL
# ============================================================

final_model_path = os.path.join(
    MODEL_DIR,
    "skin_classifier.keras"
)

model.save(final_model_path)

print("\n" + "=" * 60)
print("TRAINING COMPLETE")
print("=" * 60)

print(f"\nModel saved at:")
print(final_model_path)

print("\nClass mapping saved at:")
print(os.path.join(MODEL_DIR, "class_mapping.json"))