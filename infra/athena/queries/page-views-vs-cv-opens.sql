-- Simple funnel: page views vs CV opens per day — AGGREGATE ONLY, humans only.
-- Crawlers/tools are excluded by UA (URL-decoded, case-insensitive). page_views counts GET HTML
-- (assets excluded); cv_opens matches the two CV PDFs robustly (case-insensitive, url_decoded,
-- any method — a PDF open logs as range/206 + HEAD rows, not a clean GET, which is why the old
-- exact-path + GET match under-counted). Successful statuses only (sc_status < 400 keeps 206).
-- NOTE: contact submissions are a SEPARATE surface. Read them from the CloudWatch metric
-- KhaledPortfolio/ContactSubmissions (or the khaled-portfolio-analytics dashboard), NOT from
-- these logs — the contact POST goes to API Gateway/Lambda, not through CloudFront.
SELECT
  "date" AS day,
  SUM(CASE
        WHEN cs_method = 'GET'
         AND cs_uri_stem NOT LIKE '/_next/%'
         AND NOT regexp_like(lower(cs_uri_stem),
               '\.(js|css|ico|svg|png|jpe?g|webp|avif|gif|woff2?|ttf|txt|xml|map|json|webmanifest|pdf)$')
        THEN 1 ELSE 0 END) AS page_views,
  SUM(CASE
        WHEN regexp_like(lower(url_decode(cs_uri_stem)), '/khaled_hossameldin_(mobile|devops)_cv\.pdf$')
        THEN 1 ELSE 0 END) AS cv_opens
FROM khaled_portfolio_analytics.cloudfront_standard_logs
WHERE sc_status < 400
  AND NOT regexp_like(lower(url_decode(cs_user_agent)),
        '(bot|crawl|spider|scan|curl|wget|python|headless)')
GROUP BY "date"
ORDER BY day DESC;
