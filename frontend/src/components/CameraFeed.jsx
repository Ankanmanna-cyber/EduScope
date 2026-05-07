import { useRef, useEffect, useState, useCallback } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const CAPTURE_INTERVAL_MS = 2000;

export default function CameraFeed({ sessionId, studentId, onResult }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const [active, setActive] = useState(false);
  const [status, setStatus] = useState("Camera off");

  // START CAMERA
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
      });

      // Show video UI first
      setActive(true);
      setStatus("Monitoring active...");

      // Wait for React to render the video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);

      // Start AI monitoring
      startCapturing();

    } catch (err) {
      console.error("Camera error:", err);
      setStatus("Camera access denied");
    }
  };

  // ANALYZE FRAME
  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 640;
    canvas.height = 480;

    ctx.drawImage(videoRef.current, 0, 0, 640, 480);

    // Convert frame to Base64
    const base64Frame = canvas
      .toDataURL("image/jpeg", 0.7)
      .split(",")[1];

    try {
      const { data } = await axios.post(
        `${API}/api/session/analyze`,
        {
          session_id: sessionId,
          student_id: studentId,
          frame: base64Frame,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Send result to parent component
      onResult(data.result, data.alert);

    } catch (err) {
      console.error("Analysis failed:", err.message);
    }
  }, [sessionId, studentId, onResult]);

  // START CAPTURING
  const startCapturing = () => {
    intervalRef.current = setInterval(
      captureAndAnalyze,
      CAPTURE_INTERVAL_MS
    );
  };

  // STOP CAMERA
  const stopCamera = () => {
    clearInterval(intervalRef.current);

    const stream = videoRef.current?.srcObject;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    setActive(false);
    setStatus("Camera off");
  };

  // CLEANUP
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="bg-[#111c3d]/90 border border-white/10 rounded-3xl p-6 shadow-2xl">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl shadow-lg">
          📹
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">
            Live Monitoring
          </h2>

          <p className="text-gray-400 text-sm">
            AI-powered classroom engagement tracking
          </p>
        </div>
      </div>

      {/* Camera Area */}
      <div className="relative bg-[#07122b] border border-white/10 rounded-3xl overflow-hidden min-h-[450px] flex items-center justify-center">

        {/* Background Glow */}
        <div className="absolute w-80 h-80 bg-purple-600/20 blur-3xl rounded-full"></div>

        {active ? (
          <div className="relative w-full h-full">

            {/* Webcam Feed */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-[450px] object-cover rounded-3xl"
            />

            {/* LIVE Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              LIVE
            </div>

            {/* Status */}
            <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm">
              {status}
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">

            {/* Camera Icon */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl shadow-2xl">
              📷
            </div>

            {/* Title */}
            <h3 className="text-3xl font-bold text-white mt-6">
              Camera is Off
            </h3>

            {/* Description */}
            <p className="text-gray-400 mt-3 max-w-md">
              Start monitoring to analyze student attention,
              focus levels, and classroom engagement in real time.
            </p>

            {/* Start Button */}
            <button
              onClick={startCamera}
              className="
                mt-8
                px-8 py-4
                rounded-2xl
                bg-gradient-to-r from-purple-600 to-pink-500
                hover:scale-105
                hover:shadow-purple-500/40
                transition-all duration-300
                text-white
                font-semibold
                text-lg
                shadow-2xl
              "
            >
              ▶ Start Monitoring
            </button>
          </div>
        )}
      </div>

      {/* Hidden Canvas */}
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />

      {/* Stop Button */}
      {active && (
        <div className="flex justify-end mt-6">
          <button
            onClick={stopCamera}
            className="
              px-6 py-3
              rounded-2xl
              bg-red-500 hover:bg-red-600
              transition-all duration-300
              text-white font-semibold shadow-lg
            "
          >
            ⏹ Stop Monitoring
          </button>
        </div>
      )}
    </div>
  );
}
