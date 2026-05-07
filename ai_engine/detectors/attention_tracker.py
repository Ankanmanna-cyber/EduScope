import json
import os
import numpy as np
import mediapipe as mp
from models.model_manager import ModelManager

PROFILES_DIR = os.path.join(
    os.path.dirname(__file__), "..", "models", "attention_model", "profiles"
)

class AttentionTracker:
    def __init__(self):
        self.mp_mesh = mp.solutions.face_mesh
        self.mesh    = self.mp_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        # Load global thresholds from ModelManager
        mgr = ModelManager()
        self.thresholds = mgr.thresholds

        self.LEFT_EYE   = [362,382,381,380,374,373,390,249,263,466,388,387,386,385,384,398]
        self.RIGHT_EYE  = [33,  7,163,144,145,153,154,155,133,173,157,158,159,160,161,246]
        self.LEFT_IRIS  = [474,475,476,477]
        self.RIGHT_IRIS = [469,470,471,472]

    def _load_profile(self, student_id):
        """Load personal calibration if it exists, else use defaults"""
        path = os.path.join(PROFILES_DIR, f"{student_id}.json")
        if os.path.exists(path):
            with open(path) as f:
                return json.load(f)
        return {
            "center_min": self.thresholds["center_min"],
            "center_max": self.thresholds["center_max"],
            "calibrated": False
        }

    def get_attention_score(self, frame, student_id="default"):
        import cv2
        profile = self._load_profile(student_id)
        rgb     = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.mesh.process(rgb)

        if not results.multi_face_landmarks:
            return 0   # face absent = not attending

        lm  = results.multi_face_landmarks[0].landmark
        h, w = frame.shape[:2]

        def pts(idxs):
            return [(lm[i].x * w, lm[i].y * h) for i in idxs]

        def ratio(iris_pts, eye_pts):
            ex_min = min(p[0] for p in eye_pts)
            ex_max = max(p[0] for p in eye_pts)
            cx     = np.mean([p[0] for p in iris_pts])
            return (cx - ex_min) / (ex_max - ex_min + 1e-6)

        l_r = ratio(pts(self.LEFT_IRIS),  pts(self.LEFT_EYE))
        r_r = ratio(pts(self.RIGHT_IRIS), pts(self.RIGHT_EYE))
        avg = (l_r + r_r) / 2

        # Score based on personal calibrated center range
        c_min = profile["center_min"]
        c_max = profile["center_max"]

        if c_min <= avg <= c_max:
            score = 100   # looking at screen
        else:
            deviation = min(abs(avg - c_min), abs(avg - c_max))
            score = max(0, 100 - (deviation * 300))

        return round(score, 1)