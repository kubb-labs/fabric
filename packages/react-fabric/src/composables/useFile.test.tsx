import { describe, expect, test } from 'vitest'
import { File } from '../components/File'
import { useFile } from './useFile'
import { createApp } from '@kubb/fabric-core'
import { reactPlugin } from '@kubb/react-fabric/plugins'

describe('useFile', () => {
  test('returns current file context when used inside <File />', async () => {
    let ctx: ReturnType<typeof useFile> | undefined

    const Test = () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      ctx = useFile()
      return null
    }

    const meta = { flag: true }

    const Component = () => (
      <File baseName="index.ts" path="/tmp/index.ts" meta={meta}>
        <Test />
      </File>
    )

    const app = createApp()
    app.use(reactPlugin)

    app.render(Component)

    expect(ctx).toBeDefined()
    expect(ctx?.baseName).toBe('index.ts')
    expect(ctx?.path).toBe('/tmp/index.ts')
    expect(ctx?.meta).toEqual(meta)
  })
})
