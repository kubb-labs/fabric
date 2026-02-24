import { relative } from 'node:path'
import { styleText } from 'node:util'
import * as clack from '@clack/prompts'
import { definePlugin } from './definePlugin.ts'

type Options = {
  /**
   * Toggle progress bar output.
   * @default true
   */
  progress?: boolean
}

function pluralize(word: string, count: number) {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

const DEFAULT_PROGRESS_BAR_SIZE = 30

export const loggerPlugin = definePlugin<Options>({
  name: 'logger',
  install(ctx, options = {}) {
    const { progress = true } = options

    const state = {
      spinner: clack.spinner(),
      isSpinning: false,
      progressBar: undefined as ReturnType<typeof clack.progress> | undefined,
    }

    function formatPath(path: string) {
      return relative(process.cwd(), path)
    }

    ctx.on('lifecycle:start', async () => {
      clack.intro(`${styleText('blue', 'Fabric')} ${styleText('dim', 'Starting run')}`)
    })

    ctx.on('lifecycle:render', async () => {
      clack.log.info(`${styleText('blue', 'ℹ')} Rendering application graph`)
    })

    ctx.on('files:added', async (files) => {
      if (!files.length) {
        return
      }

      clack.log.info(`${styleText('blue', 'ℹ')} Queued ${pluralize('file', files.length)}`)
    })

    ctx.on('file:resolve:path', async (file) => {
      clack.log.step(`Resolving path for ${styleText('dim', formatPath(file.path))}`)
    })

    ctx.on('file:resolve:name', async (file) => {
      clack.log.step(`Resolving name for ${styleText('dim', formatPath(file.path))}`)
    })

    ctx.on('files:processing:start', async (files) => {
      clack.log.step(`Processing ${styleText('green', pluralize('file', files.length))}`)

      if (progress) {
        state.progressBar = clack.progress({
          style: 'block',
          max: files.length,
          size: DEFAULT_PROGRESS_BAR_SIZE,
        })
        state.progressBar.start(`Processing ${files.length} files`)
      }
    })

    ctx.on('file:processing:start', async (file, index, total) => {
      if (!state.progressBar) {
        clack.log.step(`Processing ${styleText('dim', `[${index + 1}/${total}]`)} ${formatPath(file.path)}`)
      }
    })

    ctx.on('file:processing:update', async ({ processed, total, percentage, file }) => {
      if (state.progressBar) {
        // undefined = auto-increment by 1
        state.progressBar.advance(undefined, `Writing ${formatPath(file.path)}`)
      } else {
        const formattedPercentage = Number.isFinite(percentage) ? percentage.toFixed(1) : '0.0'
        clack.log.step(`Progress ${styleText('green', `${formattedPercentage}%`)} ${styleText('dim', `(${processed}/${total})`)} → ${formatPath(file.path)}`)
      }
    })

    ctx.on('file:processing:end', async (file, index, total) => {
      if (state.progressBar) {
        state.progressBar.message(`${styleText('green', '✓')} Finished ${styleText('dim', `[${index + 1}/${total}]`)} ${formatPath(file.path)}`)
      } else {
        clack.log.success(`${styleText('green', '✓')} Finished ${styleText('dim', `[${index + 1}/${total}]`)} ${formatPath(file.path)}`)
      }
    })

    ctx.on('files:processing:end', async (files) => {
      if (state.progressBar) {
        state.progressBar.stop(`${styleText('green', '✓')} Processed ${pluralize('file', files.length)}`)
        state.progressBar = undefined
      } else {
        clack.log.success(`${styleText('green', '✓')} Processed ${pluralize('file', files.length)}`)
      }
    })

    ctx.on('lifecycle:end', async () => {
      if (state.progressBar) {
        state.progressBar.stop()
        state.progressBar = undefined
      }

      clack.outro(`${styleText('blue', 'Fabric')} ${styleText('dim', 'completed')}`)
    })
  },
})
