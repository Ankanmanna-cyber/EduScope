"""
Run this ONCE per student to calibrate their gaze baseline.
Saves a personal calibration profile so attention scoring
is accurate even if someone naturally looks slightly to one side.

Usage:
  python calibrate.py --student_id student_001
"""

import cv2
import json
import os
import argparse
import numpy as np
import mediapipe as mp

PROFILES_DIR = os.path.join(os.path.dirname(__file__), "profiles")
os.makedirs(PROFILES_DIR, exist_ok=True)

def collect_gaze_samples(cap, mesh, seconds=5):
    """Look at 4 target positions, collect iris ratios"""
    positions = [
        ("CENTER — Look straight at the camera", (0.5, 0.5)),
        ("LEFT   — Look at the left edge",       (0.2, 0.5)),
        ("RIGHT  — Look at the right edge",       (0.8, 0.5)),
        ("UP     — Look at the top",              (0.5, 0.2)),
    ]

    all_samples = {"center": [], "left": [], "right": [], "up": []}

    LEFT_IRIS  = [474, 475, 476, 477]
    RIGHT_IRIS = [469, 470, 471, 472]
    LEFT_EYE   = [362, 382, 381, 380, 374, 373, 390, 249,
                  263, 466, 388, 387, 386, 385, 384, 398]
    RIGHT_EYE  = [33,   7, 163, 144, 145, 153, 154, 155,
                  133, 173, 157, 158, 159, 160, 161, 246]

    for label, (tx, ty) in positions:
        print(f"\n>>> {label}")
        print(f"    Hold position for {seconds} seconds...")
        import time; time.sleep(2)   # give time to adjust

        samples = []
        start   = time.time()

        while time.time() - start < seconds:
            ret, frame = cap.read()
            if not ret: continue

            h, w = frame.shape[:2]
            rgb  = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            res  = mesh.process(rgb)

            if res.multi_face_landmarks:
                lm = res.multi_face_landmarks[0].landmark

                def pts(idxs):
                    return [(lm[i].x * w, lm[i].y * h) for i in idxs]

                l_iris = pts(LEFT_IRIS)
                r_iris = pts(RIGHT_IRIS)
                l_eye  = pts(LEFT_EYE)
                r_eye  = pts(RIGHT_EYE)

                def ratio(iris, eye):
                    ex_min = min(p[0] for p in eye)
                    ex_max = max(p[0] for p in eye)
                    cx     = np.mean([p[0] for p in iris])
                    return (cx - ex_min) / (ex_max - ex_min + 1e-6)

                avg = (ratio(l_iris, l_eye) + ratio(r_iris, r_eye)) / 2
                samples.append(avg)

            # Show live feed during calibration
            cv2.putText(frame, label, (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.imshow("EduScope Calibration", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        direction = label.split("—")[0].strip().lower()
        all_samples[direction] = samples
        print(f"    Collected {len(samples)} samples for {direction}")

    return all_samples

def build_profile(samples):
    center = samples.get("center", [0.5])
    return {
        "baseline_center": float(np.mean(center)),
        "baseline_std":    float(np.std(center)),
        "center_min":      float(np.mean(center) - 2 * np.std(center)),
        "center_max":      float(np.mean(center) + 2 * np.std(center)),
        "calibrated":      True
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--student_id", required=True)
    args = parser.parse_args()

    print(f"\n=== EduScope Gaze Calibration for {args.student_id} ===")
    print("Follow the on-screen instructions.\n")

    mp_mesh = mp.solutions.face_mesh
    mesh    = mp_mesh.FaceMesh(refine_landmarks=True,
                               min_detection_confidence=0.5,
                               min_tracking_confidence=0.5)
    cap     = cv2.VideoCapture(0)

    try:
        samples = collect_gaze_samples(cap, mesh, seconds=4)
        profile = build_profile(samples)

        path = os.path.join(PROFILES_DIR, f"{args.student_id}.json")
        with open(path, "w") as f:
            json.dump(profile, f, indent=2)

        print(f"\n✅ Calibration complete!")
        print(f"   Center baseline: {profile['baseline_center']:.3f}")
        print(f"   Attention range: {profile['center_min']:.3f} – {profile['center_max']:.3f}")
        print(f"   Profile saved to: {path}")
    finally:
        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()