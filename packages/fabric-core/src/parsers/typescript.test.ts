import type ts from 'typescript'
import { format } from '../../mocks/format.ts'

import { print, createImport, createExport } from './typescript.ts'

const formatTS = (elements: ts.Node | (ts.Node | undefined)[]) => {
  return format(print([elements].flat().filter(Boolean)))
}

describe('TypeScript parser', () => {
  test('createImport', async () => {
    expect(
      await formatTS(
        createImport({
          name: 'hello',
          path: './hello.ts',
        }),
      ),
    ).toMatchSnapshot()

    expect(
      await formatTS(
        createImport({
          name: 'hello',
          path: './hello.ts',
          isTypeOnly: true,
        }),
      ),
    ).toMatchSnapshot()

    expect(
      await formatTS(
        createImport({
          name: ['hello'],
          path: './hello.ts',
        }),
      ),
    ).toMatchSnapshot()

    expect(
      await formatTS(
        createImport({
          name: 'hello',
          path: './hello.ts',
          isNameSpace: true,
        }),
      ),
    ).toMatchSnapshot()

    expect(
      await formatTS(
        createImport({
          name: [{ propertyName: 'hello', name: 'helloWorld' }],
          path: './hello.ts',
        }),
      ),
    ).toMatchSnapshot()
  })

  test('createExport', async () => {
    expect(
      await formatTS(
        createExport({
          path: './hello.ts',
        }),
      ),
    ).toMatchSnapshot()

    expect(
      await formatTS(
        createExport({
          name: ['hello', 'world'],
          asAlias: true,
          path: './hello.ts',
        }),
      ),
    ).toMatchSnapshot()

    expect(
      await formatTS(
        createExport({
          name: 'hello',
          asAlias: true,
          path: './hello.ts',
        }),
      ),
    ).toMatchSnapshot()

    try {
      await formatTS(
        createExport({
          name: 'hello',
          path: './hello.ts',
        }),
      )
    } catch (e) {
      expect(e).toBeDefined()
    }
  })
})
