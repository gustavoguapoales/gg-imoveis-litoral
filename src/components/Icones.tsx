import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const IconeArea = (p: P) => (<svg {...base} {...p}><path d="M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6" /></svg>);
export const IconeCama = (p: P) => (<svg {...base} {...p}><path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 15h18M7 9V6h4v3" /></svg>);
export const IconeSuite = (p: P) => (<svg {...base} {...p}><path d="M5 12h14v3a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-3ZM7 12V6a2 2 0 0 1 4 0M8 19l-1 2M16 19l1 2" /></svg>);
export const IconeBanho = (p: P) => (<svg {...base} {...p}><path d="M4 4h4v3M8 7a3 3 0 0 1 6 0M9 13l-.5 1.5M12 12v2M15 13l.5 1.5M10 17l-.5 1.5M14 17l.5 1.5" /></svg>);
export const IconeVaga = (p: P) => (<svg {...base} {...p}><path d="M5 16V11l2-5h10l2 5v5M5 16h14M5 16v2M19 16v2M8 13h.01M16 13h.01" /></svg>);
export const IconeOnda = (p: P) => (<svg {...base} {...p}><path d="M2 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2M2 19c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" /></svg>);
export const IconePino = (p: P) => (<svg {...base} {...p}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>);
export const IconeSeta = (p: P) => (<svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const IconeLupa = (p: P) => (<svg {...base} {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>);
export const IconeMenu = (p: P) => (<svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
export const IconeFechar = (p: P) => (<svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const IconeCheck = (p: P) => (<svg {...base} {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>);
export const IconeChevron = (p: P) => (<svg {...base} {...p}><path d="m9 6 6 6-6 6" /></svg>);

export const IconeWhatsApp = (p: P) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.06 2.87 1.21 3.07.15.2 2.09 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35ZM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.99 6.7 2.78a9.4 9.4 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46Zm8.06-17.53A11.33 11.33 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2.01.52 3.97 1.52 5.7L.55 23.63l6.05-1.59a11.37 11.37 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.34-8.05Z" />
  </svg>
);
