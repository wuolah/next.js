import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export async function getServerSideProps({ query: { port } }) {
  if (!port) {
    throw new Error('port required')
  }
  return { props: { port } }
}

export default function Page({ port }) {
  const router = useRouter()
  return (
    <>
      <Link
        href={`http://127.0.0.1:${port}${router.basePath}/something-else`}
        id="absolute-link"
      >
        http://127.0.0.1:{port}
        {router.basePath}/something-else
      </Link>
    </>
  )
}
