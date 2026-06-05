import { ActivityIndicator, View } from "react-native";

export function LoadingFallback() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1a1a1a" }}>
      <ActivityIndicator size="large" color="#bcbcbc" />
    </View>
  );
}