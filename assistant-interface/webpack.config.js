const defaultConfig = require('@wordpress/scripts/config/webpack.config');

// Remove React Refresh plugin to avoid conflicts with WordPress externals
const filteredPlugins = defaultConfig.plugins.filter(
    plugin => plugin.constructor.name !== 'ReactRefreshPlugin'
);

// Remove React Refresh from babel-loader options
const updatedRules = defaultConfig.module.rules.map(rule => {
    if (rule.use && Array.isArray(rule.use)) {
        return {
            ...rule,
            use: rule.use.map(loader => {
                if (loader.loader && loader.loader.includes('babel-loader')) {
                    return {
                        ...loader,
                        options: {
                            ...loader.options,
                            plugins: (loader.options.plugins || []).filter(
                                plugin => !plugin.includes || !plugin.includes('react-refresh')
                            )
                        }
                    };
                }
                return loader;
            })
        };
    }
    return rule;
});

module.exports = {
    ...defaultConfig,
    plugins: filteredPlugins,
    module: {
        ...defaultConfig.module,
        rules: updatedRules,
    },
    devServer: {
        ...defaultConfig.devServer,
        host: '0.0.0.0',
        port: 8887,
        hot: true,
        liveReload: true,
        client: {
            webSocketURL: 'ws://localhost:8887/ws',
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        allowedHosts: 'all',
        devMiddleware: {
            writeToDisk: false,
            publicPath: '/',
        },
        static: false,
    },
};
