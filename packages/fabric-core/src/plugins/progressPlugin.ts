import { Presets, SingleBar } from 'cli-progress'
import { createPlugin } from './createPlugin.ts'
import { relative } from 'node:path'
import process from 'node:process'

export const progressPlugin = createPlugin({
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
