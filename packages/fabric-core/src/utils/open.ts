import { spawn } from 'node:child_process'

const spawnBin = (bin: string, args: string[]): Promise<boolean> => {
  return new Promise((resolve) => {
    const process = spawn(bin, args, {
      detached: true,
      shell: false,
      windowsHide: true,
    })

    process.on('close', (code) => {
      resolve(!code)
    })
  })
}

type Options = {
  app?: string
}

export async function open(path: string, options?: Options): Promise<boolean> {
  const app = options?.app

  if (process.platform === 'win32') {
    return spawnBin('cmd.exe', ['/c', 'start', app || '', path.replace(/[&^]/g, '^$&')])
  }

  if (process.platform === 'linux') {
    return spawnBin(app || 'xdg-open', [path])
  }
  if (process.platform === 'darwin') {
    return spawnBin('open', app ? ['-a', app, path] : [path])
  }

  throw new Error(`Unsupported platform, could not open "${path}"`)
}
