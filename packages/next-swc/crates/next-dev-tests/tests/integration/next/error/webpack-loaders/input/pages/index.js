import { useTestHarness } from '@turbo/pack-test-harness'

export default function Home() {
  useTestHarness(runTests)

  return null
}

function runTests() {
  it('run', () => {})
}
