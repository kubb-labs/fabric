import { App, createFabric, File } from '@kubb/fabric-core'
import { fsPlugin, fsxPlugin } from '@kubb/fabric-core/plugins'

async function run() {
  const fabric = createFabric()

  fabric.use(fsPlugin, {
    clean: { path: './example6/gen' },
  })

  fabric.use(fsxPlugin)

  const app = App({
    children: [
      File({
        baseName: 'file1.ts',
        path: './example6/gen/file1.ts',
        children: File.Source({
          children: 'const test = 1;',
        }),
      }),
      File({
        baseName: 'file2.ts',
        path: './example6/gen/file2.ts',
        children: File.Source({
          children: 'const test = 2;',
        }),
      }),
    ],
  })
  //
  // const appChildren = App().children(
  //   File({
  //     baseName: 'file1.ts',
  //     path: './example6/gen/file1.ts',
  //   }).children(File.Source().children( 'const test = 1;')),
  //   File({
  //     baseName: 'file2.ts',
  //     path: './example6/gen/file2.ts',
  //   }).children(File.Source().children( 'const test = 2;')),
  // )

  // app.component()

  const output = await fabric.render(app)

  console.log(output, JSON.stringify(fabric.files, null, 2))

  await fabric.write()
}

run()
