# AI Proctoring System - Implementation & Roadmap

This document outlines the architecture, models used, current implementation status, and the upcoming features of the AI Video Proctoring system.

---

## 🏗️ System Architecture Overview

The system runs a **decoupled, concurrent backend architecture** utilizing:
1. **FastAPI**: Serves the REST API endpoints and interactive Swagger documentation.
2. **Celery**: Handles asynchronous, heavy deep learning tasks (processing video frames frame-by-frame).
3. **Redis**: Acts as the message broker between FastAPI and Celery worker.

---

## 🧠 AI Models & Purpose

Here is the breakdown of the AI models currently in use or planned, along with their roles:

### 1. Face Detection
* **Model:** **RetinaFace**
* **Library:** `retina-face`
* **Purpose:** Detects all human faces in a video frame or registration photo. It provides high-accuracy bounding box coordinates ($x_{min}, y_{min}, x_{max}, y_{max}$) and confidence scores.

### 2. Identity Verification (Face Matching)
* **Model:** **ArcFace**
* **Library:** `DeepFace`
* **Purpose:** Performs facial recognition by comparing the cropped face bounding box from video frames against the reference registration image (`registration_photos/<student_id>.[jpg/png]`). Uses cosine similarity distance to verify identity.

### 3. Head Pose Estimation
* **Model:** **FaceLandmarker** (Tasks API)
* **Library:** `mediapipe` (v0.10.x+)
* **Purpose:** Automatically downloads and runs the `face_landmarker.task` model. It extracts the **facial transformation matrix** (4x4 matrix) to compute rotation angles:
  * **Yaw** (looking left/right)
  * **Pitch** (looking up/down)
  * **Roll** (tilting head left/right)
  * **Suspicious Flag:** If any angle exceeds **$\pm 15^\circ$**, it flags the frame as `suspicious_pose: true`.

---

## 📈 Roadmap & What's Next

### Phase 1: Completed Features
- [x] **Video Frame Extraction:** Decoupled frame extraction to 1 FPS for processing.
- [x] **Concurrent Task Queue:** Setup celery, redis, and uvicorn backend.
- [x] **Face Detection (RetinaFace):** Detect faces and bounding boxes.
- [x] **Identity Verification (ArcFace):** Verify if the face matches the student registration photo.
- [x] **Head Pose Estimation (MediaPipe Tasks):** Real-time Euler angles calculation to detect looking away.

### Phase 2: Upcoming Features

#### 4. Eye Gaze Tracking (Next Step)
* **Proposed Model:** MediaPipe Face Mesh / Blendshapes
* **Purpose:** Detects eye movement, iris displacement, and blinking patterns. If the user continuously looks away from the screen (without turning their whole head), this module will flag it as an anomaly.

#### 5. Object Detection (Forbidden Items)
* **Proposed Model:** **YOLOv8** (You Only Look Once - Nano variant for speed)
* **Purpose:** Scans frames to detect proctoring violations:
  * Mobile phones, tablets, or laptops
  * Books, notes, or calculators
  * Multiple persons present in the frame

#### 6. Audio Proctoring
* **Proposed Model:** YAMNet / WebRTC VAD (Voice Activity Detector)
* **Purpose:** Monitors audio input for whispers, voice presence, or background talking events during the exam.

#### 7. Anomaly Aggregator & Scoring
* **Approach:** Custom statistical algorithm
* **Purpose:** Aggregates all anomalies (face count $\neq 1$, unverified identity, suspicious head pose, phone detected, sound detected) into a single timeline and generates a **Proctoring Trust Score (0-100%)** for the student.
