export default function SSG(props) {
  return <pre id="props">{JSON.stringify(props)}</pre>
}

export async function getStaticProps() {
  const res = await fetch('http://127.0.0.1:44001')
  const props = await res.json()
  return { props }
}
