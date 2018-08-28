module.exports = {
    devServer: {
        proxy: {
            '/bullet': {
                target: 'http://localhost:3002',
                ws: true,
                changeOrigin: true
            }
        }
    }
}