"""
Train a custom CNN emotion classifier on FER2013.

Steps:
1. Download dataset from https://www.kaggle.com/datasets/msambare/fer2013
2. Place fer2013.csv in ai-engine/models/emotion_model/
3. Run: python train_emotion.py
4. Model saves as emotion_model.h5
"""

import os
import json
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks
from sklearn.model_selection import train_test_split

# ── Config ───────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(__file__)
CSV_PATH    = os.path.join(BASE_DIR, "fer2013.csv")
MODEL_PATH  = os.path.join(BASE_DIR, "emotion_model.h5")
LABELS_PATH = os.path.join(BASE_DIR, "label_map.json")

LABEL_MAP = {
    0: "angry", 1: "disgust", 2: "fear",
    3: "happy", 4: "neutral", 5: "sad", 6: "surprise"
}
IMG_SIZE   = 48
NUM_CLASSES = 7
EPOCHS     = 50
BATCH_SIZE = 64

# ── Load Data ────────────────────────────────────────────────
def load_fer2013():
    print("Loading FER2013 dataset...")
    df = pd.read_csv(CSV_PATH)

    X, y = [], []
    for _, row in df.iterrows():
        pixels = np.array(row["pixels"].split(), dtype=np.float32)
        img    = pixels.reshape(IMG_SIZE, IMG_SIZE, 1) / 255.0
        X.append(img)
        y.append(int(row["emotion"]))

    X = np.array(X)
    y = tf.keras.utils.to_categorical(y, NUM_CLASSES)
    print(f"  Loaded {len(X)} samples")
    return X, y

# ── Build Model ───────────────────────────────────────────────
def build_model():
    model = models.Sequential([
        # Block 1
        layers.Conv2D(32, (3,3), activation="relu", padding="same",
                      input_shape=(IMG_SIZE, IMG_SIZE, 1)),
        layers.BatchNormalization(),
        layers.Conv2D(32, (3,3), activation="relu", padding="same"),
        layers.MaxPooling2D(2,2),
        layers.Dropout(0.25),

        # Block 2
        layers.Conv2D(64, (3,3), activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.Conv2D(64, (3,3), activation="relu", padding="same"),
        layers.MaxPooling2D(2,2),
        layers.Dropout(0.25),

        # Block 3
        layers.Conv2D(128, (3,3), activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2,2),
        layers.Dropout(0.25),

        # Classifier
        layers.Flatten(),
        layers.Dense(256, activation="relu"),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(NUM_CLASSES, activation="softmax")
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    return model

# ── Train ─────────────────────────────────────────────────────
def train():
    X, y = load_fer2013()
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )

    # Data augmentation — prevents overfitting
    augmentor = tf.keras.preprocessing.image.ImageDataGenerator(
        rotation_range=10,
        width_shift_range=0.1,
        height_shift_range=0.1,
        horizontal_flip=True,
        zoom_range=0.1
    )

    model = build_model()
    model.summary()

    cbs = [
        callbacks.ModelCheckpoint(
            MODEL_PATH, save_best_only=True,
            monitor="val_accuracy", verbose=1
        ),
        callbacks.EarlyStopping(
            patience=8, monitor="val_accuracy",
            restore_best_weights=True
        ),
        callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=0.5,
            patience=4, min_lr=1e-6, verbose=1
        )
    ]

    print("\nTraining started...")
    model.fit(
        augmentor.flow(X_train, y_train, batch_size=BATCH_SIZE),
        validation_data=(X_val, y_val),
        epochs=EPOCHS,
        callbacks=cbs,
        verbose=1
    )

    # Save label map
    with open(LABELS_PATH, "w") as f:
        json.dump({str(k): v for k, v in LABEL_MAP.items()}, f, indent=2)

    print(f"\n✅ Model saved to {MODEL_PATH}")
    print(f"✅ Label map saved to {LABELS_PATH}")

    # Quick evaluation
    loss, acc = model.evaluate(X_val, y_val, verbose=0)
    print(f"\nValidation Accuracy: {acc*100:.2f}%")

if __name__ == "__main__":
    train()