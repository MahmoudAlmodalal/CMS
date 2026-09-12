// Scoped to this route rather than the (public) group: see PageSkeleton for why
// /artists and /news must not open a Suspense boundary over their [slug] children.
export { PageSkeleton as default } from "@/components/public/PageSkeleton";
