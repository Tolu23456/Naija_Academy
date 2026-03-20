import React from 'react';

interface Props {
  html: string;
  title: string;
}

const LESSON_CSS = `
  .lesson-container { padding: 0 4px; }
  .glass-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    margin-bottom: 16px;
  }
  .padding-2, .padding-1 { padding: 20px; }
  .padding-1 { padding: 12px; }
  .mb-1 { margin-bottom: 8px; }
  .mb-2 { margin-bottom: 16px; }
  .mt-1 { margin-top: 8px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .text-accent   { color: #00E5A0; }
  .text-warning  { color: #F5A623; }
  .text-success  { color: #50C878; }
  .text-orange   { color: #FF7043; }
  .text-blue     { color: #4FC3F7; }
  .text-secondary{ color: rgba(255,255,255,0.55); }
  .text-center   { text-align: center; }
  .bg-dark { background: rgba(0,0,0,0.35); }
  .rounded { border-radius: 10px; }
  .p-2 { padding: 14px; }
  h1 { font-size: 2.2rem; margin-bottom: 6px; font-weight: 700; }
  h2 { font-size: 1.25rem; font-weight: 600; }
  h4 { font-size: 1rem; font-weight: 600; margin-bottom: 6px; }
  p  { font-size: 0.97rem; line-height: 1.7; color: rgba(255,255,255,0.82); margin: 6px 0; }
  ul, ol { padding-left: 20px; margin: 8px 0; }
  li { font-size: 0.95rem; line-height: 1.7; color: rgba(255,255,255,0.82); margin-bottom: 4px; }
  code { font-family: monospace; font-size: 0.92rem; }
  table { border-collapse: collapse; width: 100%; font-size: 0.9rem; }
  th, td { padding: 6px 10px; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.85); }
  th { background: rgba(255,255,255,0.06); }
  img { max-width: 100%; border-radius: 8px; margin-top: 10px; }
  strong { color: #fff; }
  em { color: rgba(255,255,255,0.75); }
`;

export default function LessonHTML({ html }: Props) {
  return (
    <div
      style={{
        color: 'rgba(255,255,255,0.88)',
        fontFamily: "'Inter', sans-serif",
        fontSize: 16,
        lineHeight: 1.6,
        paddingBottom: 40,
      }}
    >
      <style>{LESSON_CSS}</style>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
