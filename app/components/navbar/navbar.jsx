import Navbar from './_navClient';

// ISR revalidation period (in seconds) for the page
export const revalidate = 86400;

// Fetch navbar data from API
async function fetchNavbarData() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch('https://restaurant-back-end.vercel.app/api/data', {
      signal: controller.signal,
      next: { revalidate: 86400 }, // Revalidate API response every 3600 seconds
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();
    if (json?.navbar && Array.isArray(json.navbar) && json.navbar.length > 0) {
      return json.navbar[0];
    } else if (json?.navbar && typeof json.navbar === 'object') {
      return json.navbar;
    }

    // Fallback if data structure is unexpected
    return null;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('Fetch timed out');
    } else {
      console.error('Error fetching navbar:', err);
    }
    return null;
  }
}

export default async function Page() {
  const navbarData = await fetchNavbarData();

  return <Navbar navbarData={navbarData} />;
}