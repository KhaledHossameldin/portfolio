import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Static export — no SSR, no runtime middleware (locked decision §2).
  output: "export",
  images: { unoptimized: true },
  // Emit directory-style routes (out/en/index.html) so S3 + CloudFront serve
  // them with default_root_object = "en/index.html" and no rewrite function.
  trailingSlash: true,
};

export default withNextIntl(nextConfig);
