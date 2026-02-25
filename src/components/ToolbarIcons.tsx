const iconStyle: React.CSSProperties = {
  display: "block",
  width: 14,
  height: 14,
};

export function IconList({ color }: { color: string }) {
  return (
    <svg style={iconStyle} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="square">
      <line x1="2" y1="4" x2="14" y2="4" />
      <line x1="2" y1="8" x2="14" y2="8" />
      <line x1="2" y1="12" x2="14" y2="12" />
    </svg>
  );
}

export function IconListCollapse({ color }: { color: string }) {
  return (
    <svg style={iconStyle} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="square">
      <line x1="2" y1="4" x2="14" y2="4" />
      <line x1="2" y1="8" x2="10" y2="8" />
      <line x1="2" y1="12" x2="14" y2="12" />
    </svg>
  );
}

export function IconPlus({ color }: { color: string }) {
  return (
    <svg style={iconStyle} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="square">
      <line x1="8" y1="3" x2="8" y2="13" />
      <line x1="3" y1="8" x2="13" y2="8" />
    </svg>
  );
}

export function IconTheme({ color }: { color: string }) {
  return (
    <svg style={iconStyle} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="square">
      <rect x="2" y="2" width="5" height="5" />
      <rect x="9" y="2" width="5" height="5" />
      <rect x="2" y="9" width="5" height="5" />
      <rect x="9" y="9" width="5" height="5" />
    </svg>
  );
}

export function IconClose({ color }: { color: string }) {
  return (
    <svg style={iconStyle} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="square">
      <line x1="4" y1="4" x2="12" y2="12" />
      <line x1="12" y1="4" x2="4" y2="12" />
    </svg>
  );
}
