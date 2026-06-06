
export async function getLocations(params?: Record<string, string>) {
  const query = new URLSearchParams(params ?? {}).toString();
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/site-locations?${query}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // body: JSON.stringify(params ?? {}),
  });

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  return await response.json();
}

export async function createLocations(body?: any) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/site-locations`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body ?? {}),
  });

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  return await response.json();
}