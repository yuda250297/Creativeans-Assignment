
export async function getStats(params?: Record<string, string>) {
  const query = new URLSearchParams(params ?? {}).toString();
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/stats?${query}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  return await response.json();
}