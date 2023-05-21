import ky from 'ky-universal'

export default function SSRPageWithGetInitialProps({ data }) {
  return <div>{data.foo}</div>
}

SSRPageWithGetInitialProps.getInitialProps = async () => {
  const port = process.env.NEXT_PUBLIC_API_PORT
  const json = await ky.get(`http://127.0.0.1:${port}/`).json()
  return {
    data: json,
  }
}
