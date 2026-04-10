import base64
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import mediapipe as mp
import os
import json

app = Flask(__name__)
CORS(app)

# Mediapipe for Liveness (Blink Detection)
# mp_face_mesh = mp.solutions.face_mesh
# face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, refine_landmarks=True)

# Indices for Eyes in Mediapipe Face Mesh
LEFT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
RIGHT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]

def decode_base64(data):
    """Decode base64 string to OpenCV image."""
    try:
        encoded_data = data.split(',')[1] if ',' in data else data
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"Decode error: {e}")
        return None

def calculate_ear(eye_landmarks, landmarks):
    """Simple Eye Aspect Ratio calculation."""
    # This is a placeholder for a more complex EAR calculation
    # Real EAR uses 6 points per eye.
    return 0.25 # Mock result for now

@app.route('/encode', methods=['POST'])
def encode_faces():
    """Generates 128D representations for multiple frames."""
    try:
        req_data = request.json
        images_base64 = req_data.get('images', [])
        
        encodings = []
        for b64 in images_base64:
            img = decode_base64(b64)
            if img is not None:
                # Use DeepFace to get 128D Facenet vector
                # The first time this runs, it will download weights (~500MB)
                objs = DeepFace.represent(img, model_name="Facenet", enforce_detection=False)
                if objs:
                    encodings.append(objs[0]["embedding"])
        
        if not encodings:
            return jsonify({"success": False, "message": "No faces detected in samples"}), 400
            
        return jsonify({"success": True, "encodings": encodings})
    except Exception as e:
        import traceback
        print(f"[FACE DEBUG] Encoding Exception: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/verify', methods=['POST'])
def verify_face():
    """Verifies a live face against stored encodings."""
    try:
        req_data = request.json
        live_image_b64 = req_data.get('image')
        stored_encodings = req_data.get('storedEncodings', [])

        img = decode_base64(live_image_b64)
        if img is None:
            return jsonify({"match": False, "message": "Invalid image"}), 400

        # Get representation of live face
        objs = DeepFace.represent(img, model_name="Facenet", enforce_detection=True)
        if not objs:
            return jsonify({"match": False, "message": "No face detected in live frame"}), 400
        
        live_encoding = np.array(objs[0]["embedding"])
        
        # Compare with stored encodings using Cosine Similarity
        # DeepFace threshold for Facenet is usually 0.40
        match_found = False
        for stored in stored_encodings:
            stored_arr = np.array(stored)
            dist = np.dot(live_encoding, stored_arr) / (np.linalg.norm(live_encoding) * np.linalg.norm(stored_arr))
            if dist > 0.85: # Cosine similarity > 0.85 (very tight match)
                match_found = True
                break
        
        # Simple Liveness Check (MOCK for now - should check for blinks across frames)
        # In a real app, the browser would capture 5-10 frames and we'd check EAR
        is_alive = True 

        return jsonify({
            "match": match_found,
            "isAlive": is_alive,
            "confidence": float(dist) if match_found else 0
        })

    except Exception as e:
        print(f"Verify error: {e}")
        return jsonify({"match": False, "message": str(e)}), 500

if __name__ == '__main__':
    print("Face AI Service Starting on port 5002...")
    print("Note: First request will download Facenet weights (500MB). Stay patient!")
    app.run(host='0.0.0.0', port=5002)
