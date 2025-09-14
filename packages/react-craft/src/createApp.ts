import { defineApp, type KubbFile, ref } from '@kubb/craft-core'
import type { ElementType } from 'react'
import { createElement } from './index.ts'
import { ReactTemplate } from './ReactTemplate.tsx'

export const createApp = defineApp<ElementType>((container) => {
  const files = ref<Array<KubbFile.File>>([])
  const output = ref<string>('')
  const template = new ReactTemplate({ files, output })

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
