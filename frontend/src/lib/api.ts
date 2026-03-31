const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

const getHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {})
});

export async function apiFetch<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...getHeaders(token),
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: "Request failed." }));
    throw new Error(data.message ?? "Request failed.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
