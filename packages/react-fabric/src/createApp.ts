import process from 'node:process'
import { defineApp, type KubbFile, ref } from '@kubb/fabric-core'
import type { ElementType } from 'react'
import { createElement } from './index.ts'
import { ReactTemplate } from './ReactTemplate.tsx'

export const createApp = defineApp<ElementType>((app) => {
  const files = ref<Array<KubbFile.File>>([])
  const output = ref<string>('')
  const template =
    process.env.NODE_ENV === 'test'
      ? new ReactTemplate({ files, output })
      : new ReactTemplate({ files, output, stdout: process.stdout, stderr: process.stderr, stdin: process.stdin })

  return {
    files,
    output,
    async run() {
      await template.render(createElement(app))
    },
    waitUntilExit() {
      return template.waitUntilExit()
    },
  }
})
