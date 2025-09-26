import { defineApp } from './defineApp.ts'
import { ref } from './reactive/ref.ts'
import type * as KubbFile from './types'

export const createApp = defineApp<{ files: Array<KubbFile.File> }>((app) => {
  const files = ref<Array<KubbFile.File>>(app.files)
  const output = ref<string>('')

  return {
    files,
    output,
    async run() {
      throw new Error('Method not implemented')
    },
    async waitUntilExit() {
      throw new Error('Method not implemented')
    },
  }
})
