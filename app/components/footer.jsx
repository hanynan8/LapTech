import Footer from './_footClient';

// ISR revalidation period (in seconds) for the page
export const revalidate = 86400;

// Fetch footer data from API
async function fetchFooterData() {
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
    const footerData = Array.isArray(json?.footer) ? json.footer[0] : (json?.footer ?? json);

    if (footerData) {
      return footerData;
    }

    // Fallback if no footer data
    return {
      company: {
        name: "اسم الشركة",
        subtitle: "",
        description: "",
        year: new Date().getFullYear()
      },
      socialLinks: [],
      sections: [],
      bottomLinks: []
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('Fetch timed out');
    } else {
      console.error('Error fetching footer data:', err);
    }
    // Return fallback data on error
    return {
      company: {
        name: "اسم الشركة",
        subtitle: "",
        description: "",
        year: new Date().getFullYear()
      },
      socialLinks: [],
      sections: [],
      bottomLinks: []
    };
  }
}

export default async function Page() {
  const footerData = await fetchFooterData();
  return <Footer footerData={footerData} loading={false} />;
}