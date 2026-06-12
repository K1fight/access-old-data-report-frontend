const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://rt-access-data-report-service.icysand-9477e6ec.germanywestcentral.azurecontainerapps.io',
      changeOrigin: true,
    })
  );
};
