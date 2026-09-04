import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// 英作文アプリの画面構造を、文章ではなくテストとして固定する。
//
// このアプリのコアループ（書く → 裏で採点 → まとめて読む）は、
// 実装のどこか一箇所で「採点を待ってから次へ」に戻せてしまう。
// 戻ったことに気づけるように、構造の要点だけを見張る。

const root = new URL("../", import.meta.url);
const readSrc = (p) => readFileSync(new URL(p, root), "utf8");

/** app/ 配下の .tsx を全部集める */
function collectTsx(dir = "app") {
  const out = [];
  for (const entry of readdirSync(new URL(dir + "/", root), { withFileTypes: true })) {
    if (entry.isDirectory()) out.push(...collectTsx(join(dir, entry.name)));
    else if (entry.name.endsWith(".tsx")) out.push(join(dir, entry.name));
  }
  return out;
}

const composeFiles = collectTsx();

test("出題画面は採点結果を待たない（確定したら次の問題へ進む）", () => {
  const hook = readSrc("app/hooks/useComposeSession.ts");
  // 採点は待たずに投げっぱなしにする（await していたら待ち時間がループに入る）
  assert.match(hook, /void gradeComposition\(/, "採点を待たずに投げる形になっていない");
  assert.doesNotMatch(hook, /await gradeComposition\(/, "採点を await している");
  // 確定した時点で次の問題へ移す
  assert.match(hook, /setWritingIndex\(index \+ 1\)/);
});

test("出題中の画面に点数・正誤が出ない（書いている最中に手が止まる）", () => {
  const writing = readSrc("app/components/WritingCard.tsx");
  for (const forbidden of ["grade.score", "verdict", "correct"]) {
    assert.ok(
      !writing.includes(forbidden),
      `出題カードが採点結果（${forbidden}）を参照している`,
    );
  }
});

test("講評は採点が返るまで先へ進めない（読まずに飛ばせない）", () => {
  const review = readSrc("app/components/ReviewCard.tsx");
  assert.match(review, /if \(!grade\) \{/, "採点待ちの分岐が無い");
  const waiting = review.slice(review.indexOf("if (!grade) {"), review.indexOf("const verdict"));
  assert.ok(!waiting.includes("onNext"), "採点が返る前に「次へ」を押せてしまう");
});

test("講評は自分の答案を添削より先に置く", () => {
  const source = readSrc("app/components/ReviewCard.tsx");
  // 見出しの並びだけを見る（先頭の設計コメントに同じ語が出るので本体に絞る）
  const review = source.slice(source.indexOf("const verdict = VERDICT_LABEL"));
  assert.ok(
    review.indexOf("あなたの答案") < review.indexOf("添削"),
    "添削文が自分の答案より先に来ている（自分の文を読み直す前に答えを見てしまう）",
  );
  assert.ok(
    review.indexOf("添削") < review.indexOf("模範解答"),
    "模範解答が添削より先に来ている",
  );
});

test("画面のどこにも生の16進カラーを書かない（トークン経由で色を決める）", () => {
  for (const file of composeFiles) {
    // ルートレイアウトの themeColor と apple-icon は例外。ブラウザのUIや
    // ImageResponse へ渡す値なので CSS 変数を解決できず、リテラルでしか書けない。
    // 代わりに、他のトークン・アイコンとずれていないことを後続のテストで見張る。
    if (file === "app/layout.tsx" || file === "app/apple-icon.tsx") continue;
    const hits = [...readSrc(file).matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
    assert.deepEqual(hits, [], `${file} に直書きの色が残っている`);
  }
});

test("太さ指定のユーティリティを使わない（強弱は文字色とサイズで付ける）", () => {
  for (const file of composeFiles) {
    const hits = [
      ...readSrc(file).matchAll(
        /\bfont-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/g,
      ),
    ].map((m) => m[0]);
    assert.deepEqual(hits, [], `${file} に太さ指定が残っている`);
  }
});

test("ブラウザUIの色はアプリの地の色と揃っている", () => {
  // ずれると、アドレスバーとアプリの間に色の段差ができて視線が境界に引かれる。
  const surface0 = readSrc("app/globals.css").match(/--surface-0:\s*(#[0-9a-fA-F]{6})/)[1];
  const themeColor = readSrc("app/layout.tsx").match(/themeColor:\s*"(#[0-9a-fA-F]{6})"/)[1];
  assert.equal(themeColor.toLowerCase(), surface0.toLowerCase());
});

test("apple-icon はホーム画面用アイコン（icon.svg）と同じ配色", () => {
  // ずれると、ホーム画面に置いたときだけ違うアプリに見える。
  // 枠線（#272C36）は iOS 側が角丸マスクを掛けるため apple-icon には持たせない。
  const icon = readSrc("app/icon.svg");
  const appleIcon = readSrc("app/apple-icon.tsx");
  const brandColors = [...icon.matchAll(/stop-color="(#[0-9a-fA-F]{6})"/g)].map((m) => m[1]);
  assert.ok(brandColors.length > 0);
  for (const hex of brandColors) {
    assert.ok(
      appleIcon.toUpperCase().includes(hex.toUpperCase()),
      `apple-icon.tsx に icon.svg の色 ${hex} が無い`,
    );
  }
});

test("習熟度の色は地の上で読める（WCAG AA）", () => {
  const css = readSrc("app/globals.css");
  const tokens = {};
  for (const [, name, value] of css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6});/g)) {
    tokens[name] = value;
  }
  const luminance = (hex) => {
    const n = Number.parseInt(hex.slice(1), 16);
    const [r, g, b] = [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff].map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  assert.ok(tokens.warning, "--warning が定義されていない");
  assert.ok(ratio(tokens.warning, tokens["surface-0"]) >= 4.5);
  // 3段階（弱い・途中・定着）が輝度でも区別できること。色相だけに頼らない
  const [negative, warning, positive] = [tokens.negative, tokens.warning, tokens.positive].map(luminance);
  assert.ok(warning > negative && warning > positive * 0.9);
});
