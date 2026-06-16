import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware navigation primitives. Link/usePathname/useRouter automatically
// keep the active locale prefix, so the EN/DE toggle is a real route switch.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
