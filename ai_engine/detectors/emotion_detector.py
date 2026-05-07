from deepface import DeepFace

class EmotionDetector:
    EMOTION_MAP = {
        "happy":     "focused",
        "neutral":   "focused",
        "surprise":  "focused",
        "sad":       "disengaged",
        "angry":     "distracted",
        "fear":      "distracted",
        "disgust":   "bored"
    }

    def detect(self, face_crop):
        """
        Input:  Cropped face image (numpy array)
        Output: emotion label + engagement category
        """
        try:
            result = DeepFace.analyze(
                face_crop,
                actions=["emotion"],
                enforce_detection=False,
                silent=True
            )
            raw_emotion = result[0]["dominant_emotion"]
            return {
                "raw_emotion": raw_emotion,
                "engagement_state": self.EMOTION_MAP.get(raw_emotion, "neutral"),
                "scores": result[0]["emotion"]   # full probability dict
            }
        except Exception as e:
            return {"raw_emotion": "unknown", "engagement_state": "neutral", "scores": {}}