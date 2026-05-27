import { ExpoRoot } from "expo-router";
import { AppRegistry } from "react-native";

const ctx = require.context("./app", true, /\.[jt]sx?$/);

function App() {
  return <ExpoRoot context={ctx} />;
}

AppRegistry.registerComponent("main", () => App);
