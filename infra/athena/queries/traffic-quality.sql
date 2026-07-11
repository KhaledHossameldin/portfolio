-- Traffic quality — how much traffic is automated vs browser-ish. AGGREGATE ONLY.
-- Buckets every request by its User-Agent (URL-decoded + lowercased; UA is URL-encoded in
-- CloudFront logs), first-match wins. This is a UA heuristic, so it is a FLOOR, not truth:
-- UA-spoofing scrapers that send a real browser UA land in 'browser-ish' and inflate it. Read it
-- to see roughly how much traffic is bots/scanners/tools; treat the human metrics
-- (unique-viewers-per-day, page-views-per-day, cv-opens-by-type) as approximate, not exact.
-- c_ip is a viewer IP = PERSONAL DATA (GDPR): aggregate counts only, never profiling.
WITH classified AS (
  SELECT
    c_ip,
    CASE
      WHEN regexp_like(ua, '(bot|crawl|spider|slurp|feed|preview|facebookexternalhit|embedly|bingpreview|mediapartners|monitor|uptime|pingdom|archive|semrush|ahrefs|dataprovider|telegram|whatsapp|discord)') THEN 'bot'
      WHEN regexp_like(ua, '(scan|nmap|nikto|masscan|zgrab|nuclei|censys|shodan|paloalto|expanse|zmeu|acunetix|internet-measurement)') THEN 'scanner'
      WHEN regexp_like(ua, '(curl|wget|python|go-http|java/|libwww|okhttp|httpclient|axios|node-fetch|headless|phantom|puppeteer|playwright|postman|insomnia|guzzle|restsharp)') THEN 'tool'
      ELSE 'browser-ish'
    END AS traffic_class
  FROM (
    SELECT c_ip, lower(url_decode(cs_user_agent)) AS ua
    FROM khaled_portfolio_analytics.cloudfront_standard_logs
  ) t
)
SELECT traffic_class,
       COUNT(*)             AS hits,
       COUNT(DISTINCT c_ip) AS distinct_ips
FROM classified
GROUP BY traffic_class
ORDER BY hits DESC;
