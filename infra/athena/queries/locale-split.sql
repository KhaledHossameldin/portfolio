-- Locale split — AGGREGATE ONLY.
-- Page views grouped by leading locale segment (/en, /de, /ar). Assets excluded.
SELECT
  regexp_extract(cs_uri_stem, '^/([a-z]{2})(/|$)', 1) AS locale,
  COUNT(*) AS page_views
FROM khaled_portfolio_analytics.cloudfront_standard_logs
WHERE cs_method = 'GET'
  AND sc_status < 400
  AND cs_uri_stem NOT LIKE '/_next/%'
  AND NOT regexp_like(lower(cs_uri_stem),
        '\.(js|css|ico|svg|png|jpe?g|webp|avif|gif|woff2?|ttf|txt|xml|map|json|webmanifest|pdf)$')
  AND NOT regexp_like(lower(url_decode(cs_user_agent)),
        '(bot|crawl|spider|scan|curl|wget|python|headless)')
  AND regexp_extract(cs_uri_stem, '^/([a-z]{2})(/|$)', 1) IN ('en', 'de', 'ar')
GROUP BY 1
ORDER BY page_views DESC;
