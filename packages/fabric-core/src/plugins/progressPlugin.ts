import { Presets, SingleBar } from 'cli-progress'
import { createPlugin } from './createPlugin.ts'
import { relative } from 'node:path'
import process from 'node:process'

type Options = {}

// biome-ignore lint/suspicious/noTsIgnore: production ready
// @ts-ignore
declare module '@kubb/fabric-core' {
  interface App {}
}

declare global {
  namespace Kubb {
    interface App {}
  }
}

export const progressPlugin = createPlugin<Options>({
  name: 'progress',
  install(app) {
    const progressBar = new SingleBar(
      {
        format: '{bar} {percentage}% | {value}/{total} | {message}',
        barCompleteChar: '█',
        barIncompleteChar: '░',
        hideCursor: true,
        clearOnComplete: true,
      },
      Presets.shades_grey,
    )

    app.context.events.on('process:start', async ({ files }) => {
      progressBar.start(files.length, 0, { message: 'Starting...' })
    })

    app.context.events.on('process:progress', async ({ file }) => {
      const message = `Writing ${relative(process.cwd(), file.path)}`
      progressBar.increment(1, { message })
    })

    app.context.events.on('process:end', async ({ files }) => {
      progressBar.update(files.length, { message: 'Done ✅' })
      progressBar.stop()
    })
  },
})
