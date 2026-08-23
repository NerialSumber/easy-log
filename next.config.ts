import type { NextConfig } from 'next';
import fs from 'fs';

const nextConfig: NextConfig = {
  turbopack: {
    // Resolve through the C:\Users\...\Downloads junction so Turbopack
    // does not concatenate C:\ and D:\ into an invalid path.
    root: fs.realpathSync(__dirname),
  },
};

export default nextConfig;
