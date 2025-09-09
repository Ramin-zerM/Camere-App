# Create Project
      npx create-expo-app@latest camera-app --template blank-typescript

# Install Library
      npx expo install expo-camera expo-media-library

      
<img width="393" height="857" alt="cameraapp1" src="https://github.com/user-attachments/assets/16b98f70-5bb8-40c7-badd-db7d2c2a59e6" />
<img width="395" height="865" alt="cameraapp2" src="https://github.com/user-attachments/assets/6e6e7f2d-820a-4604-bc24-a99f8c1a48a2" />

# 1. Flash Mode (3 options)
      Off – Turns off the flash
      On – Turns on the flash
      Auto – Automatic flash mode, depends on the lighting conditions

How it works: Users can select the flash mode before taking a photo. The app will adjust the camera’s flash setting according to the user’s choice.
Uses APIs such as expo-camera in React Native.

# 2. Switch Front and Back Camera
Users can switch between the front (selfie) camera and the back camera.
Use a variable type to specify the camera.

# 3. Capturing and Saving Photos
Supports taking photos and saving them to the device.
Use the function takePictureAsync() to capture images.
