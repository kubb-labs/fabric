import { defineApp } from './defineApp.ts'
import { ref } from './reactive/ref.ts'
import type * as KubbFile from './types'

export const createApp = defineApp(() => {
  const files = ref<Array<KubbFile.File>>([])
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
