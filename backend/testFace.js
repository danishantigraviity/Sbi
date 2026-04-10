const { getEncodingFromImage, verifyFaceLivenessAndMatch } = require('./utils/faceHandler');
const mongoose = require('mongoose');

async function test() {
  console.log("--- BIOMETRIC LOGIC TEST ---");
  try {
    // A simple 1x1 black pixel base64 (to test decoding without crash)
    const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    
    console.log("1. Testing getEncodingFromImage (Should detect 'No face')...");
    const encoding = await getEncodingFromImage(base64Image);
    console.log("   Result:", encoding ? "FAAILED (Detected something in a black pixel?)" : "SUCCESS (Correctly detected no face)");
    
    console.log("2. Testing verifyFaceLivenessAndMatch with empty user list...");
    const result = await verifyFaceLivenessAndMatch([base64Image], []);
    console.log("   Result:", result.match === false ? "SUCCESS (Correctly rejected due to no users)" : "FAILED");
    console.log("   Message:", result.message);

    console.log("--- TEST COMPLETE ---");
  } catch (err) {
    console.error("CRASH:", err.message);
    console.error(err.stack);
  }
}

test();
