import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

// 画面のすべて（日本語・英数字とも）を1ファミリーで受け持つ細めのゴシック。
//
// system-ui を先頭に置くと、同じ一行の中でもラテン文字だけOSのUI書体
// （SF Pro / Segoe UI）、日本語だけ Hiragino / Yu Gothic という二重書体になる。
// このアプリは「日本語の設問」と「自分の書いた英文」を並べて読ませるので、
// 和文と欧文で字面・太さ・字幅が揃わないと、比較そのものがしづらい。
//
// ウェイトは 300 ひとつだけ。強弱は太さではなく文字色（--ink-1/2/3）と
// サイズで付ける方針なので、太字は元々不要。1ウェイトに絞ると見た目が
// 完全に揃い、CJKのサブセット取得量も半分で済む。
const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "瞬間英作文 ― AI採点で弱点から出題",
  description:
    "日本語を見て英文を書き、AIが添削・採点する瞬間英作文アプリ。文法・表現ごとの習熟度を測り、苦手なところから優先して出題します。",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "瞬間英作文",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // アプリの地の色（--surface-0）と揃える。ブラウザのUIとアプリの間に
  // 色の段差ができると、そのつど視線が境界に引かれる。
  themeColor: "#12141a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`h-full antialiased ${notoSansJp.variable}`}>
      {/*
        学習の状態は端末（localStorage）に持ち、画面をまたぐたびに読み直す。
        セッション中は1つの画面から出ないので、状態を Provider へ上げる必要がない。
      */}
      <body className="min-h-dvh flex flex-col safe-area">{children}</body>
    </html>
  );
}
