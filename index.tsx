// pages/index.tsx
// Entry point — renders the full ClaimSmart app
// The ClaimSmartAI.jsx component contains all pages and routing

import dynamic from "next/dynamic";

// Import the full app component (disable SSR — it uses browser APIs)
const ClaimSmartApp = dynamic(() => import("../components/ClaimSmartAI"), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: "100vh",
      background: "#07090F",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 14,
      gap: 12,
    }}>
      <span style={{ animation: "spin 1s linear infinite", display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,.2)", borderTopColor: "#7C3AED", borderRadius: "50%" }} />
      Loading ClaimSmart AI...
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  ),
});

export default function Home() {
  return <ClaimSmartApp />;
}
