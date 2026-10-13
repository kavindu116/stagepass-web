/**
 * Placeholder QR graphic. Replace with a real QR (e.g. the `qrcode.react`
 * package) rendering the signed ticket token from the backend.
 */
export function QrCode({ label = "Ticket QR code" }: { label?: string }) {
  return (
    <svg
      width={140}
      height={140}
      viewBox="0 0 21 21"
      role="img"
      aria-label={label}
      className="flex-none rounded-[10px] bg-white p-2"
    >
      <g fill="#0E0D12">
        <rect x="0" y="0" width="7" height="7" />
        <rect x="14" y="0" width="7" height="7" />
        <rect x="0" y="14" width="7" height="7" />
      </g>
      <g fill="#FFFFFF">
        <rect x="1" y="1" width="5" height="5" />
        <rect x="15" y="1" width="5" height="5" />
        <rect x="1" y="15" width="5" height="5" />
      </g>
      <g fill="#0E0D12">
        <rect x="2" y="2" width="3" height="3" />
        <rect x="16" y="2" width="3" height="3" />
        <rect x="2" y="16" width="3" height="3" />
        <rect x="9" y="1" width="2" height="2" />
        <rect x="8" y="4" width="3" height="1" />
        <rect x="9" y="8" width="3" height="3" />
        <rect x="13" y="9" width="2" height="2" />
        <rect x="16" y="9" width="3" height="1" />
        <rect x="1" y="9" width="3" height="2" />
        <rect x="5" y="10" width="2" height="1" />
        <rect x="9" y="13" width="1" height="3" />
        <rect x="11" y="15" width="3" height="2" />
        <rect x="15" y="14" width="2" height="2" />
        <rect x="18" y="16" width="2" height="3" />
        <rect x="12" y="18" width="4" height="2" />
        <rect x="9" y="18" width="2" height="2" />
      </g>
    </svg>
  );
}
