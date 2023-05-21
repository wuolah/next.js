/**
 * Cleans a URL by stripping the protocol, host, and search params.
 *
 * @param urlString the url to clean
 * @returns the cleaned url
 */
export function cleanURL(urlString: string): string {
  const url = new URL(urlString)
  url.host = '127.0.0.1:3000'
  url.search = ''
  url.protocol = 'http'
  return url.toString()
}
