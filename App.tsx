import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";

type FlashMode = "off" | "on" | "auto";

export default function App() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
    useState<boolean | null>(null);

  const cameraRef = useRef<CameraView | null>(null);

  const [facing, setFacing] = useState<"back" | "front">("back");
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [image, setImage] = useState<string | null>(null);
  const [isTaking, setIsTaking] = useState(false);
  const [caption, setCaption] = useState<string>("Polaroid");

  useEffect(() => {
    (async () => {
      const mediaLibStatus = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibStatus.status === "granted");

      if (!cameraPermission) {
        await requestCameraPermission();
      } else if (cameraPermission?.status !== "granted") {
        await requestCameraPermission();
      }
    })();
  }, []);

  const cycleFlash = () => {
    setFlashMode((prev) => {
      switch (prev) {
        case "off":
          return "on";
        case "on":
          return "auto";
        default:
          return "off";
      }
    });
  };

  const handleTakePicture = async () => {
    if (!cameraRef.current || isTaking) return;
    setIsTaking(true);
    try {
      const options = { quality: 1, skipProcessing: false };
      const newPhoto = await cameraRef.current.takePictureAsync?.(options);
      if (newPhoto?.uri) {
        const time = new Date();
        setCaption(
          `${time.getFullYear()}/${(time.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${time
            .getDate()
            .toString()
            .padStart(2, "0")}`
        );
        setImage(newPhoto.uri);
      }
    } catch (err) {
      console.error("takePicture error:", err);
    } finally {
      setIsTaking(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (image && hasMediaLibraryPermission) {
      try {
        await MediaLibrary.createAssetAsync(image);
        setImage(null);
      } catch (err) {
        console.error("save error:", err);
      }
    }
  };

  if (!cameraPermission || hasMediaLibraryPermission === null) {
    return (
      <View style={styles.centered}>
        <Text>Requesting permissions...</Text>
      </View>
    );
  }

  if (image) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.cameraWrap}>
          <View style={styles.polaroidFrame}>
            <Image source={{ uri: image }} style={styles.cameraInFrame} />
            <View style={styles.polaroidBottomArea}>
              <Text style={styles.polaroidLabel}>{caption}</Text>
            </View>
          </View>
        </View>

        <SafeAreaView style={styles.overlay}>
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setImage(null)}
            >
              <Text style={styles.primaryButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSaveToGallery}
            >
              <Text style={styles.primaryButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    );
  }

  // 📷 Main camera
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.cameraWrap}>
        <View style={styles.polaroidFrame}>
          <CameraView
            ref={cameraRef}
            style={styles.cameraInFrame}
            facing={facing}
            flash={flashMode}
          />
          <View style={styles.polaroidBottomArea}>
            <Text style={styles.polaroidLabel}>Polaroid</Text>
          </View>
        </View>
      </View>

      <SafeAreaView pointerEvents="box-none" style={styles.overlay}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={cycleFlash}>
            <Ionicons name="flash" size={20} color="#fff" />
            <Text style={styles.topText}>{flashMode.toUpperCase()}</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              setFacing((p) => (p === "back" ? "front" : "back"))
            }
          >
            <Ionicons name="camera-reverse" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.smallButton}>
            <Ionicons name="image" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shutterButton}
            onPress={handleTakePicture}
            activeOpacity={0.8}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallButton}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  cameraWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  polaroidFrame: {
    width: "80%",
    aspectRatio: 3 / 4,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },

  cameraInFrame: {
    width: "100%",
    height: "78%", 
    backgroundColor: "#000",
  },

  polaroidBottomArea: {
    width: "100%",
    height: "22%",
    alignItems: "center",
    justifyContent: "center",
  },

  polaroidLabel: {
    fontSize: 14,
    color: "#222",
    fontWeight: "600",
  },

  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  topBar: {
    marginTop: Platform.OS === "android" ? 12 : 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  topText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 12,
    fontWeight: "600",
  },

  bottomBar: {
    paddingBottom: Platform.OS === "android" ? 18 : 28,
    paddingTop: 12,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
  },

  smallButton: {
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
  },

  shutterButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    marginBottom: 100,
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
  },

  // preview
  primaryButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    backgroundColor: "#0a84ff",
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  secondaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});
