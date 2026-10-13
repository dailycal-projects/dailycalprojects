import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { portalTarget } from "../host";
import { strings } from "../strings";

export type PickerItem<T> = { key: string; label: string; value: T };

/** Phone entry for a choice (an address, a unit): a full-screen sheet with the input on top and the matches
 * below it, sized to what the keyboard leaves visible, so no match is ever hidden behind the keyboard. */
export function Picker<T>({
  aria,
  placeholder,
  initial,
  search,
  note,
  selectedKey,
  onPick,
  onClose,
}: {
  aria: string;
  placeholder: string;
  initial: string;
  search: (text: string) => PickerItem<T>[];
  /** A message to show under the matches (a hint, or "nothing found"), or null. */
  note: (text: string, matches: number) => string | null;
  selectedKey?: string; // the current choice, marked in the list
  onPick: (item: PickerItem<T>) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(initial);
  const sheet = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const hits = useMemo(() => search(text), [search, text]);
  const message = note(text, hits.length);

  // focus inside the tap that opened the sheet, so the keyboard comes up with it; select what was there
  useLayoutEffect(() => {
    input.current?.focus();
    input.current?.select();
  }, []);

  // The page behind the sheet is frozen (iOS ignores overflow:hidden on the body, so it is pinned instead), and
  // the sheet is kept on exactly the part of the screen the keyboard leaves visible: phones shrink the "visual
  // viewport" when the keyboard opens and may slide it down the page.
  useEffect(() => {
    const body = document.body;
    const scrollY = window.scrollY;
    body.classList.add("locked");
    body.style.position = "fixed";
    body.style.top = `${-scrollY}px`;
    body.style.width = "100%";

    const vv = window.visualViewport;
    let frame = 0;
    let shown = "";
    const fit = () => {
      frame = 0;
      if (!vv || !sheet.current) return;
      const next = `${vv.height}|${vv.offsetTop}`;
      if (next === shown) return; // nothing moved: don't touch layout (touching it mid-scroll is what makes iOS jump)
      shown = next;
      sheet.current.style.height = `${vv.height}px`;
      sheet.current.style.top = `${vv.offsetTop}px`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(fit);
    };
    fit();
    vv?.addEventListener("resize", schedule);
    vv?.addEventListener("scroll", schedule);

    // Scrolling the list must never scroll the page: stop a drag that is past the top or bottom of the list
    // (the rubber-band that chains to the page), and stop drags on the bar above it.
    const el = list.current;
    const top = sheet.current;
    let startY = 0;
    const onStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const onListMove = (e: TouchEvent) => {
      if (!el) return;
      const dy = e.touches[0].clientY - startY;
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      if ((atTop && dy > 0) || (atBottom && dy < 0)) e.preventDefault();
    };
    const onSheetMove = (e: TouchEvent) => {
      const t = e.target as HTMLElement;
      if (!el?.contains(t) && t.tagName !== "INPUT") e.preventDefault();
    };
    el?.addEventListener("touchstart", onStart, { passive: true });
    el?.addEventListener("touchmove", onListMove, { passive: false });
    top?.addEventListener("touchmove", onSheetMove, { passive: false });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      vv?.removeEventListener("resize", schedule);
      vv?.removeEventListener("scroll", schedule);
      el?.removeEventListener("touchstart", onStart);
      el?.removeEventListener("touchmove", onListMove);
      top?.removeEventListener("touchmove", onSheetMove);
      body.classList.remove("locked");
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  return createPortal(
    <div className="picker" ref={sheet} role="dialog" aria-modal="true" aria-label={aria}>
      <div className="picker-top">
        <input
          ref={input}
          className="big-input"
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
          role="combobox"
          aria-expanded={hits.length > 0}
          aria-controls="picker-list"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && hits.length) {
              e.preventDefault();
              onPick(hits[0]);
            } else if (e.key === "Escape") onClose();
          }}
        />
        <button className="picker-cancel" onClick={onClose}>
          {strings.finder.pickerCancel}
        </button>
      </div>
      <ul className="picker-list" id="picker-list" role="listbox" ref={list}>
        {hits.map((h) => (
          <li
            key={h.key}
            role="option"
            aria-selected={h.key === selectedKey}
            className={h.key === selectedKey ? "on" : undefined}
            onClick={() => onPick(h)}
          >
            {h.label}
          </li>
        ))}
        {message && <li className="picker-note">{message}</li>}
      </ul>
    </div>,
    portalTarget(),
  );
}
