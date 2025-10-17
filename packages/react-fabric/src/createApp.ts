import process from 'node:process'
import { defineApp } from '@kubb/fabric-core'
import type { ElementType } from 'react'
import { createElement } from './index.ts'
import { ReactTemplate } from './ReactTemplate.tsx'

export const createApp = defineApp<ElementType>((app, context) => {
  const template =
    process.env.NODE_ENV === 'test'
      ? new ReactTemplate({ context })
      : new ReactTemplate({ context, stdout: process.stdout, stderr: process.stderr, stdin: process.stdin })

  return {
    async render() {
      return template.render(createElement(app))
    },
    waitUntilExit() {
      return template.waitUntilExit()
    },
  }
})
