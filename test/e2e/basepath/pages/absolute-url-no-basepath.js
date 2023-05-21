import React from 'react'
import Link from 'next/link'

export async function getServerSideProps({ query: { port } }) {
  if (!port) {
    throw new Error('port required')
  }
  return { props: { port } }
}

export default function Page({ port }) {
  return (
    <>
      <Link
        href={`http://127.0.0.1:${port}/rewrite-no-basepath`}
        id="absolute-link"
      >
        http://127.0.0.1:{port}/rewrite-no-basepath
      </Link>
    </>
  )
}
