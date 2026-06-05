import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SlideUpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function SlideUpPanel({ isOpen, onClose, children }: SlideUpPanelProps) {
  const animatedY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      Animated.spring(animatedY, {
        toValue: 0, 
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    } else {
      Animated.timing(animatedY, {
        toValue: SCREEN_HEIGHT, 
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false);
      });
    }
  }, [isOpen, animatedY]);

  if (!shouldRender) return null;

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose} 
      />

      {/* The Sliding Thingy */}
      <Animated.View 
        style={[
          styles.panelContainer, 
          { transform: [{ translateY: animatedY }] }
        ]}
      >
        <View style={styles.dragHandle} />
        
        <View style={styles.contentBody}>
          {children}
        </View>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)", 
    zIndex: 10,
  },
  panelContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.5, 
    backgroundColor: "#e5e5ea",    
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 24,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#a1a1a6",    
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 14,
  },
  contentBody: {
    flex: 1,
  },
});