-- Page views per day — AGGREGATE ONLY.
-- Counts successful HTML page requests (excludes Next.js assets, images, fonts, etc.).
-- "date" is a reserved word in Athena, so it is double-quoted.
SELECT "date" AS day,
       COUNT(*) AS page_views
FROM khaled_portfolio_analytics.cloudfront_standard_logs
WHERE cs_method = 'GET'
  AND sc_status < 400
  AND cs_uri_stem NOT LIKE '/_next/%'
  AND NOT regexp_like(lower(cs_uri_stem),
        '\.(js|css|ico|svg|png|jpe?g|webp|avif|gif|woff2?|ttf|txt|xml|map|json|webmanifest|pdf)$')
  AND NOT regexp_like(lower(url_decode(cs_user_agent)),
        '(bot|crawl|spider|scan|curl|wget|python|headless)')
GROUP BY "date"
ORDER BY day DESC;
