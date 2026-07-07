-- Requests by CloudFront edge location — AGGREGATE ONLY, geographic PROXY.
-- CAVEAT: CloudFront STANDARD logs do NOT contain the viewer's country. x_edge_location is
-- the edge Point of Presence that served the request (e.g. 'FRA56' = Frankfurt, 'IAD79' =
-- Washington). The 3-letter IATA prefix approximates the viewer's region, not their country.
-- True viewer-country requires real-time logs or an added CloudFront-Viewer-Country header
-- (intentionally out of scope: extra cost/complexity, and this stays aggregate-only).
SELECT substr(x_edge_location, 1, 3) AS edge_pop,
       COUNT(*) AS requests
FROM khaled_portfolio_analytics.cloudfront_standard_logs
WHERE cs_method = 'GET'
  AND sc_status < 400
GROUP BY substr(x_edge_location, 1, 3)
ORDER BY requests DESC;
