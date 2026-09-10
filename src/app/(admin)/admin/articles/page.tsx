import { ArticlesManager } from "@/components/admin/ArticlesManager";
import { getAdminArticles } from "@/lib/dal/admin-articles";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const articles = await getAdminArticles();
  return <ArticlesManager initialArticles={articles} />;
}
