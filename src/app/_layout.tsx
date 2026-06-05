import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import React, { Suspense } from "react";
import { LoadingFallback } from "../../components/loading-fallback";

export default function RootLayout() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SQLiteProvider
        databaseName="holybible.db"
        assetSource={{ assetId: require('../../assets/holybible.db') }}
        useSuspense={true}
      >
        <Stack screenOptions={{headerShown: false}}/>
      </SQLiteProvider>
    </Suspense>
  );
}
