-- Traffic over time + edge cache efficiency — AGGREGATE ONLY.
-- All requests per day (assets included) alongside the CloudFront cache-hit ratio.
SELECT "date" AS day,
       COUNT(*) AS total_requests,
       SUM(CASE WHEN x_edge_result_type = 'Hit' THEN 1 ELSE 0 END) AS cache_hits,
       round(
         100.0 * SUM(CASE WHEN x_edge_result_type = 'Hit' THEN 1 ELSE 0 END) / COUNT(*),
         1
       ) AS cache_hit_pct
FROM khaled_portfolio_analytics.cloudfront_standard_logs
GROUP BY "date"
ORDER BY day DESC;
