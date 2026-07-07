-- Unique-ish viewers per day — AGGREGATE ONLY.
-- COUNT(DISTINCT c_ip) is an APPROXIMATION of distinct visitors (NAT, proxies and IPv6
-- rotation make it imperfect). c_ip is a viewer IP = PERSONAL DATA (GDPR): use only for an
-- aggregate trend, NEVER to identify or profile an individual. Rows auto-expire per the
-- bucket lifecycle (log_retention_days).
SELECT "date" AS day,
       COUNT(DISTINCT c_ip) AS approx_unique_viewers
FROM khaled_portfolio_analytics.cloudfront_standard_logs
WHERE cs_method = 'GET'
  AND sc_status < 400
  AND cs_uri_stem NOT LIKE '/_next/%'
  AND NOT regexp_like(lower(cs_uri_stem),
        '\.(js|css|ico|svg|png|jpe?g|webp|avif|gif|woff2?|ttf|txt|xml|map|json|pdf)$')
GROUP BY "date"
ORDER BY day DESC;
