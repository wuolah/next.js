export default async function handler(_req, res) {
  const fetchRes = await fetch('http://127.0.0.1:44001')
  const props = await fetchRes.json()
  res.json(props)
}
