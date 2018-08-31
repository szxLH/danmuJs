module.exports = {
    // devServer: {
    //     proxy: {
    //         '/bullet': {
    //             target: 'http://localhost:3002',
    //             ws: true,
    //             changeOrigin: true
    //         }
    //     }
    // },
    css: {
        loaderOptions: {
            css: {
                // options here will be passed to css-loader
            },
            postcss: {
                // options here will be passed to postcss-loader
                plugins: [require('postcss-px2rem')({
                    remUnit: 75,
                    // minPixelValue: 1
                })]
            }
        }
    },
    baseUrl: process.env.NODE_ENV === 'production'
        ? './'
        : '/'
    // configureWebpack: config => {
    //     if (process.env.NODE_ENV === 'production') {
    //         config.baseUrl = '.'
    //     } else {
    //         // 为开发环境修改配置...
    //     }
    // }
}