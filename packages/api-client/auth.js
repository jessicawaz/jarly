import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

export async function signIn(email, password) {
  const fullUrl = `${BASE_URL}/api/v1/auth/mobile-signin`;
  console.log("SIGNIN REQUEST:", fullUrl);

  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const text = await res.text();
  console.log("SIGNIN RESPONSE:", res.status, text.substring(0, 300));

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(
      `Server returned non-JSON (${res.status}): ${text.substring(0, 100)}`,
    );
  }

  if (!res.ok) {
    throw new Error(data.error?.message || data.error || "Sign in failed.");
  }

  await SecureStore.setItemAsync("token", data.token);
  return data;
}

export async function getToken() {
  return SecureStore.getItemAsync("token");
}

export async function signOut() {
  await SecureStore.deleteItemAsync("token");
}
