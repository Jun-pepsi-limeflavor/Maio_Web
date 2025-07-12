export const API_BASE_URL = 'http://127.0.0.1:5000'; // API 기본 URL

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || '서버 오류');
  }
  return response.json() as Promise<T>;
}