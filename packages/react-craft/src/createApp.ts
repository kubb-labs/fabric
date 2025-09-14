import process from 'node:process'
import { defineApp, type KubbFile, ref } from '@kubb/craft-core'
import type { ElementType } from 'react'
import { createElement } from './index.ts'
import { ReactTemplate } from './ReactTemplate.tsx'

export const createApp = defineApp<ElementType>((container) => {
  const files = ref<Array<KubbFile.File>>([])
  const output = ref<string>('')
  const template =
    process.env.NODE_ENV === 'test'
      ? new ReactTemplate({ files, output })
      : new ReactTemplate({ files, output, stdout: process.stdout, stderr: process.stderr, stdin: process.stdin })

  return {
    files,
    output,
    mount() {
      return template.render(createElement(container))
    },
    waitUntilExit() {
      return template.waitUntilExit()
    },
  }
})
