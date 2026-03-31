import type { NextConfig } from "next";
import { off } from "process";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  devIndicators: false,
};

export default nextConfig;
