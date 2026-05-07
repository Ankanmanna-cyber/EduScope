import os
import json
import numpy as np
import tensorflow as tf
from deepface import DeepFace

class ModelManager:
    """
    Singleton class — loads all models once at startup,
    reuses them across every request. This is critical for
    keeping latency under 2 seconds.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return   # already loaded, skip

        print("[ModelManager] Loading all models...")
        self.BASE_DIR = os.path.dirname(__file__)

        self.emotion_model    = self._load_emotion_model()
        self.label_map        = self._load_label_map()
        self.thresholds       = self._load_thresholds()

        # Warm up DeepFace on first import (avoids cold-start lag on first request)
        self._warmup_deepface()

        self._initialized = True
        print("[ModelManager] All models ready ✅")

    # ── Emotion Model ────────────────────────────────────────
    def _load_emotion_model(self):
        model_path = os.path.join(self.BASE_DIR, "emotion_model", "emotion_model.h5")

        if os.path.exists(model_path):
            print(f"  → Loading custom emotion model from {model_path}")
            model = tf.keras.models.load_model(model_path)
            self.using_custom_emotion_model = True
        else:
            print("  → Custom emotion model not found. Will use DeepFace built-in.")
            model = None
            self.using_custom_emotion_model = False

        return model

    def _load_label_map(self):
        path = os.path.join(self.BASE_DIR, "emotion_model", "label_map.json")
        if os.path.exists(path):
            with open(path) as f:
                return json.load(f)
        # Default FER2013 label map
        return {
            "0": "angry",
            "1": "disgust",
            "2": "fear",
            "3": "happy",
            "4": "neutral",
            "5": "sad",
            "6": "surprise"
        }

    # ── Attention Thresholds ─────────────────────────────────
    def _load_thresholds(self):
        path = os.path.join(self.BASE_DIR, "attention_model", "thresholds.json")
        if os.path.exists(path):
            with open(path) as f:
                return json.load(f)
        # Default thresholds if not calibrated yet
        return {
            "center_min": 0.35,
            "center_max": 0.65,
            "blink_rate_normal": 15,      # blinks per minute
            "head_pose_tolerance": 20     # degrees
        }

    # ── DeepFace Warmup ──────────────────────────────────────
    def _warmup_deepface(self):
        """
        DeepFace lazy-loads its backend model on first call.
        We trigger it at startup so the first real request isn't slow.
        """
        try:
            dummy = np.zeros((48, 48, 3), dtype=np.uint8)
            DeepFace.analyze(
                dummy,
                actions=["emotion"],
                enforce_detection=False,
                silent=True
            )
            print("  → DeepFace warmed up ✅")
        except Exception:
            print("  → DeepFace warmup skipped (ok)")

    # ── Predict with custom model ─────────────────────────────
    def predict_emotion(self, face_gray_48x48):
        """
        Use your custom trained model if available,
        otherwise fall back to DeepFace.

        Input : grayscale face image resized to 48x48
        Output: emotion string e.g. "happy"
        """
        if self.emotion_model is None:
            return None   # caller should use DeepFace

        img = face_gray_48x48.astype("float32") / 255.0
        img = np.expand_dims(img, axis=(0, -1))   # (1, 48, 48, 1)

        predictions = self.emotion_model.predict(img, verbose=0)
        idx = str(np.argmax(predictions[0]))
        return self.label_map.get(idx, "neutral")