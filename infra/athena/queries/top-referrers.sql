-- Top external referrers — AGGREGATE ONLY.
-- Excludes empty referrers ('-') and self-referrals from the site's own hosts.
SELECT cs_referrer AS referrer,
       COUNT(*) AS requests
FROM khaled_portfolio_analytics.cloudfront_standard_logs
WHERE cs_method = 'GET'
  AND sc_status < 400
  AND cs_referrer <> '-'
  AND cs_referrer NOT LIKE '%khaledhossameldin.com%'
GROUP BY cs_referrer
ORDER BY requests DESC
LIMIT 50;
