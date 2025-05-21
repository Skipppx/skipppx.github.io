import type { NextConfig } from 'next';

module.exports = {
  env: {
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  },
};

const nextConfig: NextConfig = {
  // distDir: 'out', // Specify the output directory
  // output: 'export',
  // basePath: process.env.PAGES_BASE_PATH || '',
};

export default nextConfig;
