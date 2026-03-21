const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'woff2',
  'woff',
  'ttf',
  'otf',
];

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.headers.origin && req.headers.origin.includes('.replit.dev')) {
        delete req.headers.origin;
      }
      middleware(req, res, next);
    };
  },
};

module.exports = config;
