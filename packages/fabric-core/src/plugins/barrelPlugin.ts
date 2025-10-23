import { createPlugin } from './createPlugin.ts'

type Options = {}

type ExtendOptions = {}

// biome-ignore lint/suspicious/noTsIgnore: production ready
// @ts-ignore
declare module '@kubb/fabric-core' {
  interface App {}
}

declare global {
  namespace Kubb {
    interface App {}
  }
}

export const barrelPlugin = createPlugin<Options, ExtendOptions>({
  name: 'barrel',
  async install() {},
})
