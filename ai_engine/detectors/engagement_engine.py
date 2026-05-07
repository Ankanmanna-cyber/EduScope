class EngagementEngine:
    # Weights for each signal
    WEIGHTS = {
        "attention":  0.50,   # gaze is the strongest signal
        "emotion":    0.30,
        "face_present": 0.20
    }

    EMOTION_SCORES = {
        "focused":    100,
        "neutral":    70,
        "distracted": 30,
        "disengaged": 20,
        "bored":      15
    }

    def calculate(self, attention_score, emotion_state, face_detected):
        """
        Returns final engagement score 0–100 and label
        """
        face_score    = 100 if face_detected else 0
        emotion_score = self.EMOTION_SCORES.get(emotion_state, 50)

        final = (
            attention_score  * self.WEIGHTS["attention"] +
            emotion_score    * self.WEIGHTS["emotion"] +
            face_score       * self.WEIGHTS["face_present"]
        )
        final = round(final, 1)

        if final >= 75:   label = "Highly Engaged"
        elif final >= 50: label = "Moderately Engaged"
        elif final >= 25: label = "Low Engagement"
        else:             label = "Disengaged"

        return {"score": final, "label": label}