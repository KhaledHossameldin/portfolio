-- CV opens by type — AGGREGATE ONLY.
-- Which CV resonates: Mobile vs DevOps. Metric is COUNT(DISTINCT c_ip) — this de-dups the
-- multiple HTTP range-requests a single PDF open can generate, and approximates distinct
-- people. c_ip is a viewer IP = PERSONAL DATA (GDPR): aggregate trend only, never profiling;
-- rows auto-expire per the bucket lifecycle.
SELECT
  CASE
    WHEN cs_uri_stem = '/Khaled_Hossameldin_Mobile_CV.pdf' THEN 'Mobile'
    WHEN cs_uri_stem = '/Khaled_Hossameldin_DevOps_CV.pdf' THEN 'DevOps'
  END AS cv_type,
  COUNT(DISTINCT c_ip) AS approx_opens,
  COUNT(*) AS raw_requests
FROM khaled_portfolio_analytics.cloudfront_standard_logs
WHERE cs_method = 'GET'
  AND sc_status < 400
  AND cs_uri_stem IN ('/Khaled_Hossameldin_Mobile_CV.pdf', '/Khaled_Hossameldin_DevOps_CV.pdf')
GROUP BY 1
ORDER BY approx_opens DESC;
