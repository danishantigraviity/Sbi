from deepface import DeepFace
try:
    print("Testing DeepFace...")
    # This will trigger the VGG-Face download
    rep = DeepFace.represent(img_path="python/test_dummy.jpg", model_name="VGG-Face", enforce_detection=False)
    print("Success!")
except Exception as e:
    print(f"FAILED: {e}")
