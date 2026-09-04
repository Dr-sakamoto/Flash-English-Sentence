"use client";

import { useId, useState } from "react";

interface ApiKeySettingsProps {
  apiKey: string;
  onApiKeyChange: (next: string) => void;
}

/**
 * 学習者が自分のGemini APIキーを入力する場所。
 *
 * サーバー側に `GEMINI_API_KEY` が設定されていればここは使わなくていい
 * （自分でホストしていて、サーバーにキーを置けない・置きたくない場合の代用）。
 * 入力したキーは端末の localStorage にだけ残り、採点のたびに一度きり
 * サーバーへ渡る。サーバーは保存しない（app/api/check/route.ts）。
 */
export default function ApiKeySettings({ apiKey, onApiKeyChange }: ApiKeySettingsProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(apiKey);
  const [revealed, setRevealed] = useState(false);
  const inputId = useId();

  return (
    <div className="prompt-card mt-3 p-4">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-xs text-ink-3"
      >
        <span>
          Gemini APIキー
          <span className="ml-2 text-ink-3">{apiKey ? "設定済み" : "未設定（模範解答との照合で採点）"}</span>
        </span>
        <span aria-hidden="true">{open ? "閉じる" : "設定する"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          <p className="text-[11px] text-ink-3">
            AI採点にはGeminiのAPIキーが要ります。このアプリ自体にキーが設定されて
            いなければ、ここに自分のキーを入れると使えます。キーは
            <span className="text-ink-2">この端末にだけ</span>保存され、採点のリクエストに
            添えて送る以外には使いません。
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
              className="ml-1 underline underline-offset-2 hover:text-ink-2"
            >
              キーの発行はこちら
            </a>
          </p>

          <div className="flex gap-2">
            <label htmlFor={inputId} className="sr-only">
              Gemini APIキー
            </label>
            <input
              id={inputId}
              type={revealed ? "text" : "password"}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="AIza..."
              autoComplete="off"
              spellCheck={false}
              className="min-h-10 flex-1 rounded-lg border border-line bg-surface-1 px-3 py-2 text-xs text-ink-1 outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => setRevealed((prev) => !prev)}
              className="btn-quiet min-h-10 rounded-lg px-3 text-xs"
            >
              {revealed ? "隠す" : "表示"}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onApiKeyChange(draft)}
              className="btn-accent min-h-9 flex-1 rounded-lg px-3 py-1.5 text-xs"
            >
              保存
            </button>
            {apiKey && (
              <button
                type="button"
                onClick={() => {
                  setDraft("");
                  onApiKeyChange("");
                }}
                className="btn-quiet min-h-9 rounded-lg px-3 py-1.5 text-xs"
              >
                削除
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
