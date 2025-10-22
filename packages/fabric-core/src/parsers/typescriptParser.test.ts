import type ts from 'typescript'
import { format } from '../../mocks/format.ts'

import { print, createImport, createExport, typescriptParser } from './typescriptParser.ts'

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

  test('typescriptParser.print combines banner/imports/exports/sources/footer and respects extname', async () => {
    const file = {
      path: '/project/src/index.ts',
      extname: '.ts',
      banner: '// banner',
      footer: '// footer',
      sources: [{ value: 'export const x = 1' }, { value: 'export const y = 2' }],
      imports: [
        { name: 'foo', path: './utils.ts' },
        { name: ['bar'], path: '/project/src/bar.js', root: '/project/src' },
      ],
      exports: [{ path: './hello.js' }, { name: ['alpha', 'beta'], path: './names.ts', asAlias: true }],
      meta: {},
    } as any

    const output = await typescriptParser.parse(file, { extname: '.ts' as any })
    expect(await format(output)).toMatchSnapshot()
  })
})
