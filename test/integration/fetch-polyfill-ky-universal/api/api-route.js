import ky from 'ky-universal'

export default async function ApiRoute(_req, res) {
  const port = process.env.NEXT_PUBLIC_API_PORT
  const json = await ky.get(`http://127.0.0.1:${port}/`).json()
  res.json(json)
}
