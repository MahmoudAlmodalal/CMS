import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // CMS editors intentionally hydrate editable local state from server props.
    // This is a controlled synchronization boundary, not an external side effect.
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    // These boundaries adapt untyped Supabase responses until generated database
    // types cover every legacy action and DAL shape.
    files: [
      "src/actions/booking.ts",
      "src/actions/cms.ts",
      "src/actions/newsletter.ts",
      "src/lib/auth-guard.ts",
      "src/lib/dal/booking.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
