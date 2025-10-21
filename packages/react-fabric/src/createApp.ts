import { defineApp } from '@kubb/fabric-core'
import { type ElementType, createElement } from 'react'
import { type ReactAppContext, ReactTemplate } from './ReactTemplate.tsx'

export const createApp = defineApp<ElementType, ReactAppContext>((app, context) => {
  const template = new ReactTemplate(context)

  return {
    render() {
      template.render(createElement(app))
    },
    async renderToString() {
      return template.renderToString(createElement(app))
    },
    waitUntilExit() {
      return template.waitUntilExit()
    },
  }
})
