import { createFabric } from '@kubb/fabric-core'
import { describe, expect, test } from 'vitest'
import { File } from '../components/File'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { useFile } from './useFile'

describe('useFile', () => {
  test('returns current file context when used inside <File />', async () => {
    let ctx: ReturnType<typeof useFile> | undefined

    const Test = () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      ctx = useFile()
      return null
    }

    const meta = { flag: true }

    const Component = (
      <File baseName="index.ts" path="/tmp/index.ts" meta={meta}>
        <Test />
      </File>
    )

    const fabric = createFabric()
    fabric.use(reactPlugin)

    await fabric.render(Component)

    expect(ctx).toMatchInlineSnapshot(`
      {
        "banner": undefined,
        "baseName": "index.ts",
        "exports": [],
        "footer": undefined,
        "imports": [],
        "meta": {
          "flag": true,
        },
        "path": "/tmp/index.ts",
        "sources": [],
      }
    `)
  })
})
