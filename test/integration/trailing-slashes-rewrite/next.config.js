module.exports = {
  trailingSlash: true,

  async rewrites() {
    return [
      {
        source: '/:path*/',
        destination: '/:path*/',
      },
      {
        source: '/:path*/',
        destination: 'http://127.0.0.1:__EXTERNAL_PORT__/:path*',
      },
    ]
  },
}
