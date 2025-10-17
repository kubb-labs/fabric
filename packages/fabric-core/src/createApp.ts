import { defineApp } from './defineApp.ts'

export const createApp = defineApp(() => {
  return {
    async render() {
      throw new Error('Method not implemented')
    },
    async waitUntilExit() {
      throw new Error('Method not implemented')
    },
  }
})
