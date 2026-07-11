-- Project views — AGGREGATE ONLY.
-- Ranks case-study pages /<locale>/work/<slug>/ by traffic, aggregated across locales.
-- approx_unique_viewers = COUNT(DISTINCT c_ip) (viewer IP = personal data; aggregate only).
SELECT
  regexp_extract(cs_uri_stem, '/work/([^/]+)', 1) AS project_slug,
  COUNT(*) AS views,
  COUNT(DISTINCT c_ip) AS approx_unique_viewers
FROM khaled_portfolio_analytics.cloudfront_standard_logs
WHERE cs_method = 'GET'
  AND sc_status < 400
  AND NOT regexp_like(lower(url_decode(cs_user_agent)),
        '(bot|crawl|spider|scan|curl|wget|python|headless)')
  AND cs_uri_stem LIKE '%/work/%'
  AND regexp_extract(cs_uri_stem, '/work/([^/]+)', 1) <> ''
GROUP BY 1
ORDER BY views DESC;
