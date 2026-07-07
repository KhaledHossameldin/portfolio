-- Top referrers — AGGREGATE ONLY.
-- External sources + direct traffic. Same-site (internal-nav) referrers are excluded;
-- blank/'-' referrers are coalesced to '(direct/none)' rather than dropped.
SELECT
  CASE WHEN cs_referrer = '-' OR cs_referrer = '' THEN '(direct/none)' ELSE cs_referrer END AS ref,
  COUNT(*) AS hits
FROM khaled_portfolio_analytics.cloudfront_standard_logs
WHERE cs_referrer NOT LIKE '%khaledhossameldin.com%'
GROUP BY 1
ORDER BY hits DESC;
