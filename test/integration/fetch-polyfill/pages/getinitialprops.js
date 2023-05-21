export default function SSRPageWithGetInitialProps({ data }) {
  return <div>{data.foo}</div>
}

SSRPageWithGetInitialProps.getInitialProps = async () => {
  const port = process.env.NEXT_PUBLIC_API_PORT
  const res = await fetch(`http://127.0.0.1:${port}/`)
  const json = await res.json()
  return {
    data: json,
  }
}
