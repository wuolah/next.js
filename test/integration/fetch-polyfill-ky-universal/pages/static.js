import ky from 'ky-universal'

export default function StaticPage({ data }) {
  return <div>{data.foo}</div>
}

export async function getStaticProps() {
  const port = process.env.NEXT_PUBLIC_API_PORT
  const json = await ky.get(`http://127.0.0.1:${port}/`).json()
  return {
    props: {
      data: json,
    },
  }
}
