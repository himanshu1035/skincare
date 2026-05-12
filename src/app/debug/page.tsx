"use client";

export default function DebugPage() {
  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>Debug Page</h1>
      <p>If you can see this, the website is working.</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  );
}
