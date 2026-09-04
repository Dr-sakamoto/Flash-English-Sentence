import { ImageResponse } from "next/og";

// iOS の「ホーム画面に追加」はこのファイルが無いと favicon ではなく
// ページのスクリーンショットをアイコン代わりに使う。PWAとして
// インストールしたときに icon.svg と同じ見た目にするための専用アイコン。
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg
        width={180}
        height={180}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#191C24" />
            <stop offset="1" stopColor="#12141A" />
          </linearGradient>
          <linearGradient id="ink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#A8C0FF" />
            <stop offset="1" stopColor="#7AA2FF" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" fill="url(#bg)" />
        <path
          d="M120 196 h230 M120 262 h272 M120 328 h150"
          stroke="#5E677B"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M300 344 L392 156 L420 170 L328 358 L292 372 Z"
          fill="url(#ink)"
        />
        <path
          d="M300 344 L328 358"
          stroke="#12141A"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    ),
    { ...size }
  );
}
