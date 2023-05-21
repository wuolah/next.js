import fetch from 'node-fetch'

export default async (req, res) => {
  const dataRes = await fetch(
    `http://127.0.0.1:${req.query.port}/api/query?hello=from-pipe`
  )

  res.status(dataRes.status)
  dataRes.body.pipe(res)
}
