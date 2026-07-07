-- Top pages by request count — AGGREGATE ONLY.
-- Same page filter as page-views; groups by the requested path.
SELECT cs_uri_stem AS page,
       COUNT(*) AS views
FROM khaled_portfolio_analytics.cloudfront_standard_logs
WHERE cs_method = 'GET'
  AND sc_status < 400
  AND cs_uri_stem NOT LIKE '/_next/%'
  AND NOT regexp_like(lower(cs_uri_stem),
        '\.(js|css|ico|svg|png|jpe?g|webp|avif|gif|woff2?|ttf|txt|xml|map|json|pdf)$')
GROUP BY cs_uri_stem
ORDER BY views DESC
LIMIT 50;
