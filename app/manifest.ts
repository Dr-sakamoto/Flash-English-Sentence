import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "瞬間英作文 ― AI採点で弱点から出題",
    short_name: "瞬間英作文",
    description:
      "日本語を見て英文を書き、AIが添削・採点する瞬間英作文アプリ。文法・表現ごとの習熟度を測り、苦手なところから優先して出題します。",
    start_url: "/",
    display: "standalone",
    // アプリの地の色に合わせる。起動時の白フラッシュを挟まない
    background_color: "#12141a",
    theme_color: "#12141a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
