import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScanbotBarcodeSDK, {
  BarcodeFormatCode128Configuration,
  BarcodeItem,
  ScanbotBarcodeCameraView,
  SdkConfiguration,
} from "react-native-scanbot-barcode-scanner-sdk";

export default function ScannerScreen() {
  const sheetRef = useRef<TrueSheet>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Check if SDK is available
        if (!ScanbotBarcodeSDK || typeof ScanbotBarcodeSDK.initialize !== 'function') {
          setInitError("Scanbot SDK not available. Please check native module linking.");
          return;
        }

        console.log("Initializing Scanbot SDK...");
        
        // Create configuration - SDK allows 60 seconds of testing without a license key
        const config = new SdkConfiguration({
          licenseKey: '',
        });

        const result = await ScanbotBarcodeSDK.initialize(config);
        console.log("Scanbot SDK initialized successfully:", result);
        setIsInitialized(true);
      } catch (error) {
        console.error("Scanbot SDK initialization error:", error);
        setInitError(
          error instanceof Error ? error.message : "Failed to initialize SDK"
        );
      }
    };

    // Delay initialization slightly to ensure native modules are ready
    const timeoutId = setTimeout(initializeSDK, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const onBarcodeDetected = (result?: BarcodeItem[]) => {
    console.log("Barcode detected:", result);
    
    if (result && result.length > 0) {
      console.log("Barcode detected:", result.map((b) => b.text).join(", "));
    }
  };

  const openBottomSheet = () => {
    sheetRef.current?.present();
  };

  const closeBottomSheet = () => {
    sheetRef.current?.dismiss();
  };

  if (initError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Error: {initError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.cameraContainer}>
        {isInitialized ? (
          <ScanbotBarcodeCameraView
            style={styles.camera}
            onBarcodeScannerResult={onBarcodeDetected}
            barcodeScannerConfiguration={{
              barcodeFormatConfigurations: [
                new BarcodeFormatCode128Configuration({}),
              ],
            }}
            selectionOverlayConfig={{
              overlayEnabled: true,
              polygonColor: "#208AEF",
              textColor: "#FFFFFF",
              textContainerColor: "rgba(0, 0, 0, 0.8)",
              strokeColor: "#FFFFFF",
            }}
          />
        ) : (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#208AEF" />
            <Text style={styles.loadingText}>Initializing scanner...</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.bottomSheetButton}
          onPress={openBottomSheet}
        >
          <Text style={styles.buttonText}>Open Menu</Text>
        </TouchableOpacity>
      </View>

      <TrueSheet
        ref={sheetRef}
        detents={["auto", 1]}
        backgroundColor="#1c1c1e"
        cornerRadius={24}
        dimmed={false}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Menu</Text>
          <TouchableOpacity
            style={styles.sheetButton}
            onPress={closeBottomSheet}
          >
            <Text style={styles.sheetButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </TrueSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  bottomSheetButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#208AEF",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sheetContent: {
    padding: 24,
    paddingTop: 16,
    minHeight: 200,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 24,
    textAlign: "center",
  },
  sheetButton: {
    backgroundColor: "#208AEF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  sheetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
