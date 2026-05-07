from models.model_manager import ModelManager

# Load all models ONCE at startup before Flask starts accepting requests
print("Initializing EduScope AI Engine...")
manager = ModelManager()   # singleton — safe to call multiple times

# ... rest of app.py stays the same

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2, numpy as np, base64, time

from detectors.face_detector    import FaceDetector
from detectors.emotion_detector import EmotionDetector
from detectors.attention_tracker import AttentionTracker
from detectors.engagement_engine import EngagementEngine

app = Flask(__name__)
CORS(app)

face_det    = FaceDetector()
emo_det     = EmotionDetector()
att_tracker = AttentionTracker()
eng_engine  = EngagementEngine()

def decode_frame(b64_string):
    img_bytes = base64.b64decode(b64_string)
    np_arr    = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

@app.route("/analyze", methods=["POST"])
def analyze():
    data  = request.json
    frame = decode_frame(data["frame"])       # base64 encoded frame from frontend
    student_id = data.get("student_id", "unknown")

    # Run all detectors
    faces = face_det.detect(frame)
    face_detected = len(faces) > 0

    emotion_result = {"engagement_state": "neutral"}
    if face_detected:
        fx, fy, fw, fh = faces[0]["x"], faces[0]["y"], faces[0]["w"], faces[0]["h"]
        face_crop = frame[fy:fy+fh, fx:fx+fw]
        if face_crop.size > 0:
            emotion_result = emo_det.detect(face_crop)

    attention_score = att_tracker.get_attention_score(frame)
    engagement      = eng_engine.calculate(
        attention_score,
        emotion_result["engagement_state"],
        face_detected
    )

    return jsonify({
        "student_id":   student_id,
        "timestamp":    time.time(),
        "face_detected": face_detected,
        "emotion":      emotion_result.get("raw_emotion", "unknown"),
        "attention":    attention_score,
        "engagement":   engagement
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)