module.exports = {
  // 确保兼容 Node.js 16
  experimental: {
    // 禁用需要更新 Node.js 版本的功能
    serverComponentsExternalPackages: [],
  },
  // 设置输出模式
  output: 'standalone',
  // 确保 TypeScript 严格模式
  typescript: {
    ignoreBuildErrors: false,
  },
  // 确保 ESLint 严格模式
  eslint: {
    ignoreDuringBuilds: false,
  },
};
