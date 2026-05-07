const base = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: false,
};

function Svg({ size, children, ...rest }) {
    const props = size ? { ...base, width: size, height: size } : base;
    return <svg {...props} {...rest}>{children}</svg>;
}

export const IconHome = (p) => (
    <Svg {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></Svg>
);

export const IconWallet = (p) => (
    <Svg {...p}><path d="M3 7h15a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /><path d="M3 7V6a2 2 0 012-2h11" /><circle cx="17" cy="13" r="1.5" fill="currentColor" stroke="none" /></Svg>
);

export const IconTarget = (p) => (
    <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /></Svg>
);

export const IconBanknote = (p) => (
    <Svg {...p}><rect x="2" y="6" width="20" height="12" rx="1" /><circle cx="12" cy="12" r="2.5" /><path d="M6 9v.01M18 15v.01" /></Svg>
);

export const IconShield = (p) => (
    <Svg {...p}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" /></Svg>
);

export const IconShieldAlert = (p) => (
    <Svg {...p}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" /><path d="M12 8v4" /><circle cx="12" cy="15" r=".5" fill="currentColor" stroke="none" /></Svg>
);

export const IconBrain = (p) => (
    <Svg {...p}><path d="M9 4a3 3 0 00-3 3v.5A2.5 2.5 0 003.5 10v1A2.5 2.5 0 006 13.5v.5a3 3 0 003 3" /><path d="M15 4a3 3 0 013 3v.5a2.5 2.5 0 012.5 2.5v1a2.5 2.5 0 01-2.5 2.5v.5a3 3 0 01-3 3" /><path d="M9 4v16M15 4v16" /></Svg>
);

export const IconSparkles = (p) => (
    <Svg {...p}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" /><path d="M19 15l.7 2L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-1z" /></Svg>
);

export const IconChart = (p) => (
    <Svg {...p}><path d="M3 3v18h18" /><path d="M7 15l4-5 3 3 5-7" /></Svg>
);

export const IconCalendar = (p) => (
    <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="1" /><path d="M3 10h18M8 3v4M16 3v4" /></Svg>
);

export const IconClock = (p) => (
    <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
);

export const IconAlertTriangle = (p) => (
    <Svg {...p}><path d="M10.3 3.9L2 19a2 2 0 001.7 3h16.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /><path d="M12 9v5" /><circle cx="12" cy="17.5" r=".5" fill="currentColor" stroke="none" /></Svg>
);

export const IconAlertOctagon = (p) => (
    <Svg {...p}><path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z" /><path d="M12 8v4" /><circle cx="12" cy="15.5" r=".5" fill="currentColor" stroke="none" /></Svg>
);

export const IconCheck = (p) => (
    <Svg {...p}><path d="M4 12l5 5L20 6" /></Svg>
);

export const IconCheckCircle = (p) => (
    <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></Svg>
);

export const IconX = (p) => (
    <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>
);

export const IconPlus = (p) => (
    <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
);

export const IconMinus = (p) => (
    <Svg {...p}><path d="M5 12h14" /></Svg>
);

export const IconArrowRight = (p) => (
    <Svg {...p}><path d="M5 12h14M13 5l7 7-7 7" /></Svg>
);

export const IconArrowDown = (p) => (
    <Svg {...p}><path d="M12 5v14M5 13l7 7 7-7" /></Svg>
);

export const IconChevronDown = (p) => (
    <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>
);

export const IconArrowsHorizontal = (p) => (
    <Svg {...p}><path d="M8 7l-4 4 4 4M16 7l4 4-4 4M4 11h16" /></Svg>
);

export const IconRepeat = (p) => (
    <Svg {...p}><path d="M17 2l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" /></Svg>
);

export const IconEdit = (p) => (
    <Svg {...p}><path d="M14 4l6 6L9 21H3v-6L14 4z" /><path d="M13 5l6 6" /></Svg>
);

export const IconTrash = (p) => (
    <Svg {...p}><path d="M3 6h18" /><path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" /><path d="M5 6l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14" /></Svg>
);

export const IconUpload = (p) => (
    <Svg {...p}><path d="M12 16V4" /><path d="M5 11l7-7 7 7" /><path d="M4 18v2a1 1 0 001 1h14a1 1 0 001-1v-2" /></Svg>
);

export const IconDownload = (p) => (
    <Svg {...p}><path d="M12 4v12" /><path d="M5 13l7 7 7-7" /><path d="M4 4h16" /></Svg>
);

export const IconCart = (p) => (
    <Svg {...p}><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l3 13h12l2-9H6" /></Svg>
);

export const IconRocket = (p) => (
    <Svg {...p}><path d="M14 4c4 0 6 2 6 6 0 4-4 8-8 10l-4-4c2-4 6-8 10-8z" /><path d="M9 14l-3 3a2 2 0 00.5 3.2L9 22l1-4" /><circle cx="14.5" cy="9.5" r="1.5" /></Svg>
);

export const IconHeart = (p) => (
    <Svg {...p}><path d="M12 21s-7-5-9-9.5C2 7.5 5 5 8 5c2 0 3 1 4 2 1-1 2-2 4-2 3 0 6 2.5 5 6.5-2 4.5-9 9.5-9 9.5z" /></Svg>
);

export const IconFlame = (p) => (
    <Svg {...p}><path d="M12 22c4 0 7-3 7-7 0-3-2-5-3-6 0 2-1 3-2 3 0-3-1-6-4-9-1 4-5 6-5 12 0 4 3 7 7 7z" /></Svg>
);
