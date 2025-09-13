// frontend/src/lib/api.ts
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000/api';

type FetchOptions = RequestInit & { token?: string };

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const bearer = token || options.token;
  if (bearer) (headers as Record<string, string>).Authorization = `Bearer ${bearer}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    
  });

  
  if (!res.ok) {
    let message = res.statusText;
    try {
      const err = await res.json();
      message = (err && (err.message || err.error)) || message;
    } catch {
      
    }
    const e = new Error(message) as Error & { status?: number };
    e.status = res.status;
    throw e;
  }

  if (res.status === 204) {
    return null as unknown as T;
  }

  
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return (await res.json()) as T;
  }
  const text = await res.text();
 
  return (text ? (text as unknown as T) : (null as unknown as T));
}
