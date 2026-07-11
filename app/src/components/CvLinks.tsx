"use client";

import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Download } from "./ui/icons";

// The two audience-split CVs. Hrefs are locale-invariant (files in app/public),
// so they live here as the single source; only the labels come from the `cv`
// catalog (reused verbatim from footer.links). Rendered as REAL <a> anchors with
// target=_blank + rel — so both PDFs sit in the static DOM (crawlable, JS-off)
// wherever this is used (hero + contact). Styling is passed per placement; the
// shared .kp-cv-link class owns colour + the quiet hover (colour only, no motion).
const CVS = [
  { key: "mobile", href: "/Khaled_Hossameldin_Mobile_CV.pdf" },
  { key: "devops", href: "/Khaled_Hossameldin_DevOps_CV.pdf" },
] as const;

export function CvLinks({
  itemStyle,
  iconSize = 16,
  onNavigate,
}: {
  itemStyle?: CSSProperties;
  iconSize?: number;
  onNavigate?: () => void;
}) {
  const t = useTranslations("cv");
  return (
    <>
      {CVS.map((cv) => (
        <a
          key={cv.key}
          className="kp-cv-link"
          href={cv.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          style={itemStyle}
        >
          <Download size={iconSize} aria-hidden />
          {t(cv.key)}
        </a>
      ))}
    </>
  );
}
