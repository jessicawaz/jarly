import { getToken } from "./auth";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

export async function post(path, body) {
  const fullUrl = `${BASE_URL}${path}`;

  let token = null;
  try {
    token = await getToken();
  } catch (e) {
    console.log("TOKEN ERROR:", e.message);
  }

  try {
    const res = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(
        `Server returned non-JSON (${res.status}): ${text.substring(0, 100)}`,
      );
    }

    if (!res.ok) {
      throw new Error(data.error?.message || "Something went wrong.");
    }

    return data;
  } catch (e) {
    console.log("FETCH ERROR:", e.message);
    throw e;
  }
}

export async function get(path) {
  const fullUrl = `${BASE_URL}${path}`;

  let token = null;
  try {
    token = await getToken();
  } catch (e) {
    console.log("TOKEN ERROR:", e.message);
  }

  const res = await fetch(fullUrl, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(
      `Server returned non-JSON (${res.status}): ${text.substring(0, 100)}`,
    );
  }

  if (!res.ok) {
    throw new Error(data.error?.message || "Something went wrong.");
  }

  return data;
}

export async function patch(path, body) {
  const fullUrl = `${BASE_URL}${path}`;

  let token = null;
  try {
    token = await getToken();
  } catch (e) {
    console.log("TOKEN ERROR:", e.message);
  }

  try {
    const res = await fetch(fullUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log(e)
      throw new Error(
        `Server returned non-JSON (${res.status}): ${text.substring(0, 100)}`,
      );
    }

    if (!res.ok) {
      throw new Error(data.error?.message || "Something went wrong.");
    }

    return data;
  } catch (e) {
    console.log("FETCH ERROR:", e.message);
    throw e;
  }
}

export async function del(path, body) {
  const fullUrl = `${BASE_URL}${path}`;

  let token = null;
  try {
    token = await getToken();
  } catch (e) {
    console.log("TOKEN ERROR:", e.message);
  }

  try {
    const res = await fetch(fullUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log(e)
      throw new Error(
        `Server returned non-JSON (${res.status}): ${text.substring(0, 100)}`,
      );
    }

    if (!res.ok) {
      throw new Error(data.error?.message || "Something went wrong.");
    }

    return data;
  } catch (e) {
    console.log("FETCH ERROR:", e.message);
    throw e;
  }
}