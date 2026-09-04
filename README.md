# Flash English Sentence（瞬間英作文）

日本語を見て英文をその場で書く／英文を和訳する学習アプリ。書いた文をAIが添削・採点し、
**文法・表現ごとの弱点を測って、そこから優先して出題する**。

- 出題 → 続けて書く（既定5問）→ 1問ずつ添削を読む → タグ別の習熟度の変化を見る
- 採点は書いている裏で並走するので、1問ごとに待たされない
- 21種の文法タグごとに習熟度（0〜100）を推定し、弱いタグから優先して出す
- `/analysis` にタグ別の習熟度・弱点の指針・直近の答案（添削の差分つき）

設計の理由と、出題データの足しかたは [`docs/DESIGN.md`](./docs/DESIGN.md)。

## 開発

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # ロジックと画面構造のテスト
npm run lint
npm run build
```

### 環境変数

| 変数 | 用途 |
| --- | --- |
| `GEMINI_API_KEY` | AI採点（`gemini-2.5-flash`）。サーバー側だけで読む |

未設定でもアプリは動く。その場合の採点は模範解答との照合（`lib/localGrade.ts`）へ
自動的に落ちる。AI採点の添削文を試すときだけキーが要る。

## 構成

```
app/
  page.tsx           出題〜講評〜総括（1画面で完結）
  analysis/          弱点分析
  api/check/         採点API（設問・模範解答はここでサーバー側から引く）
  components/        画面の部品
  hooks/             セッションの状態
lib/
  prompts/           出題データ（basic / standard / advanced 各30問）
  grammarTags.ts     文法タグ21種
  mastery.ts         タグ習熟度の推定（EMA＋縮小推定）
  selection.ts       出題の抽選（弱さ × 復習どき × レベル）
  gradeComposition.ts / aiCompositionReview.ts / localGrade.ts   採点
tests/               ロジックと画面構造のテスト
```

姉妹アプリ: [vocab-app](https://github.com/Dr-sakamoto/vocab-app)（記述式の英単語アプリ）。
デザイントークン・AI判定の作法・分散学習の間隔はそちらから流用している。
