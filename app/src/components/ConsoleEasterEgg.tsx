"use client";

import { useEffect } from "react";

// Dry greeting for anyone who opens devtools — the sanctioned spot for the wit.
export function ConsoleEasterEgg() {
  useEffect(() => {
    try {
      console.log(
        "%cYou opened the console. Respect.%c\nLet’s talk → khaled@khaledhossameldin.com",
        "color:#F2552C;font-weight:600;font-size:13px",
        "color:#888;font-size:12px",
      );
    } catch {
      /* no console — ignore */
    }
  }, []);
  return null;
}
