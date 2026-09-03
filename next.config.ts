import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This repo owns its agent instructions. Without this, next dev writes a managed block
  // into AGENTS.md whenever it detects a coding agent, and that block does not follow the
  // typography this public repo keeps. The pre-commit guard in lefthook.yml is the second net.
  agentRules: false,
  /* config options here */
};

export default nextConfig;
