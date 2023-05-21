export default async function ApiRoute(_req, res) {
  const port = process.env.NEXT_PUBLIC_API_PORT
  const response = await fetch(`http://127.0.0.1:${port}/`)
  const json = await response.json()
  res.json(json)
}
