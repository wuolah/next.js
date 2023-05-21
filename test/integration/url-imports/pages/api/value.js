import value from 'http://127.0.0.1:12345/value4.js'

export default (req, res) => {
  res.json({ value: value })
}
