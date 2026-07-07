-- Simple funnel: page views vs CV opens per day — AGGREGATE ONLY.
-- NOTE: contact submissions are a SEPARATE surface. Read them from the CloudWatch metric
-- KhaledPortfolio/ContactSubmissions (or the khaled-portfolio-analytics dashboard), NOT from
-- these logs — the contact POST goes to API Gateway/Lambda, not through CloudFront.
SELECT
  "date" AS day,
  SUM(CASE
        WHEN cs_uri_stem NOT LIKE '/_next/%'
         AND NOT regexp_like(lower(cs_uri_stem),
               '\.(js|css|ico|svg|png|jpe?g|webp|avif|gif|woff2?|ttf|txt|xml|map|json|pdf)$')
        THEN 1 ELSE 0 END) AS page_views,
  SUM(CASE
        WHEN cs_uri_stem IN ('/Khaled_Hossameldin_Mobile_CV.pdf', '/Khaled_Hossameldin_DevOps_CV.pdf')
        THEN 1 ELSE 0 END) AS cv_opens
FROM khaled_portfolio_analytics.cloudfront_standard_logs
WHERE cs_method = 'GET'
  AND sc_status < 400
GROUP BY "date"
ORDER BY day DESC;
