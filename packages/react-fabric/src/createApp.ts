import { defineApp } from '@kubb/fabric-core'
import { type ElementType, createElement } from 'react'
import { type ReactAppContext, ReactTemplate } from './ReactTemplate.tsx'

export const createApp = defineApp<ElementType, ReactAppContext>((App, context) => {
  const template = new ReactTemplate(context)

  return {
    render() {
      template.render(createElement(App))
    },
    async renderToString() {
      return template.renderToString(createElement(App))
    },
    waitUntilExit() {
      return template.waitUntilExit()
    },
  }
})
