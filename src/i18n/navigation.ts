import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware replacements for next/link and next/navigation. Using these keeps
 * the visitor inside their locale when they navigate.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
