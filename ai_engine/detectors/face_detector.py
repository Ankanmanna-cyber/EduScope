import cv2
import mediapipe as mp

class FaceDetector:
    def __init__(self):
        self.mp_face = mp.solutions.face_detection
        self.detector = self.mp_face.FaceDetection(
            model_selection=1,       # 1 = full range model
            min_detection_confidence=0.6
        )

    def detect(self, frame):
        """
        Input:  BGR frame from OpenCV
        Output: list of face bounding boxes + confidence
        """
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.detector.process(rgb)
        faces = []

        if results.detections:
            h, w, _ = frame.shape
            for det in results.detections:
                bbox = det.location_data.relative_bounding_box
                faces.append({
                    "x": int(bbox.xmin * w),
                    "y": int(bbox.ymin * h),
                    "w": int(bbox.width * w),
                    "h": int(bbox.height * h),
                    "confidence": det.score[0]
                })
        return faces