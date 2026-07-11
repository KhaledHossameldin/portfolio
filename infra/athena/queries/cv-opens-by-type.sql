-- CV opens by type — AGGREGATE ONLY, humans only.
-- Which CV resonates: Mobile vs DevOps.
--
-- ROOT CAUSE of the previous "returns 0": the old query required cs_method = 'GET' AND matched
-- the PDF path with an exact, case-sensitive '='. A PDF "open" is NOT one clean GET 200 — the
-- browser / PDF viewer / link-unfurlers log it as HTTP range/partial requests (206) and HEAD
-- probes, so those rows do not all satisfy cs_method = 'GET' (206 < 400 already passes, so the
-- status filter was fine; the GET filter is what dropped every CV row). Fix: match both PDFs
-- case-insensitively via lower(url_decode(cs_uri_stem)); keep only successful statuses
-- (sc_status < 400 retains 206); DROP the GET-only restriction (it doesn't make a PDF-open metric
-- meaningful); exclude crawler/tool UAs; de-dup the range-request storm with COUNT(DISTINCT c_ip)
-- while still surfacing raw_requests. De-dup is done by IP, NOT by filtering to non-range rows —
-- the latter would zero the metric whenever every open is a range request.
--
-- c_ip is a viewer IP = PERSONAL DATA (GDPR): aggregate trend only, never profiling; rows
-- auto-expire per the bucket lifecycle.
SELECT
  CASE
    WHEN regexp_like(u, '/khaled_hossameldin_mobile_cv\.pdf$') THEN 'Mobile'
    WHEN regexp_like(u, '/khaled_hossameldin_devops_cv\.pdf$') THEN 'DevOps'
  END AS cv_type,
  COUNT(DISTINCT c_ip) AS approx_openers,
  COUNT(*)             AS raw_requests
FROM (
  SELECT c_ip,
         sc_status,
         lower(url_decode(cs_uri_stem))   AS u,
         lower(url_decode(cs_user_agent)) AS ua
  FROM khaled_portfolio_analytics.cloudfront_standard_logs
) t
WHERE sc_status < 400
  AND regexp_like(u, '/khaled_hossameldin_(mobile|devops)_cv\.pdf$')
  AND NOT regexp_like(ua, '(bot|crawl|spider|scan|curl|wget|python|headless)')
GROUP BY 1
ORDER BY approx_openers DESC;
