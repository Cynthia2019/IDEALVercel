const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/model',
        createProxyMiddleware({
            target: 'https://metamaterials-srv.northwestern.edu/',
            changeOrigin: true,
            secure: true,
        })
    );
};

