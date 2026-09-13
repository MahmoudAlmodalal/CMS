/** Demo content is opt-in in production and only implicit for local, keyless development. */
export const USE_DEMO_CONTENT =
  process.env.NEXT_PUBLIC_USE_DEMO_CONTENT === "true" ||
  (process.env.NODE_ENV !== "production" &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL);
