export interface ArticleStatusLike {
  is_published: boolean;
  published_at: string;
}

/** True only when the row is both flagged published and its scheduled time has arrived. */
export function isArticleLive(article: ArticleStatusLike): boolean {
  return article.is_published && new Date(article.published_at) <= new Date();
}

/** A published-but-future row is a scheduled post, not an error state. */
export function isArticleScheduled(article: ArticleStatusLike): boolean {
  return article.is_published && new Date(article.published_at) > new Date();
}
