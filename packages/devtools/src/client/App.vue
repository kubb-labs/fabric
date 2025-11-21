<script setup lang="ts">
import { computed } from 'vue'
import { useLogger } from './composables/useLogger.ts'

const {
  events,
  statuses,
  connection,
  reconnect,
  clearEvents,
  connectedClients,
  loggerUrl,
  lastError,
} = useLogger(__FABRIC_LOGGER_URL__)

const orderedEvents = computed(() => [...events.value].slice().reverse())
const orderedStatuses = computed(() => [...statuses.value].slice().reverse())

const statusLabel = computed(() => {
  switch (connection.value) {
    case 'connected':
      return 'Connected'
    case 'connecting':
      return 'Connecting'
    case 'error':
      return 'Error'
    case 'disconnected':
    default:
      return 'Disconnected'
  }
})

const statusColor = computed(() => {
  switch (connection.value) {
    case 'connected':
      return 'bg-green-500'
    case 'connecting':
      return 'bg-yellow-500'
    case 'error':
      return 'bg-red-500'
    case 'disconnected':
    default:
      return 'bg-gray-500'
  }
})

const eventColor = (eventName: string) => {
  const map: Record<string, string> = {
    start: 'bg-blue-500',
    end: 'bg-blue-500',
    'process:start': 'bg-blue-500',
    'process:progress': 'bg-cyan-500',
    'process:end': 'bg-green-500',
    'file:add': 'bg-purple-500',
    'file:start': 'bg-cyan-500',
    'file:end': 'bg-green-500',
    'file:resolve:path': 'bg-violet-500',
    'file:resolve:name': 'bg-violet-500',
    'write:start': 'bg-blue-500',
    'write:end': 'bg-green-500',
  }

  return map[eventName] ?? 'bg-gray-500'
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return timestamp
  }
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const formatPayload = (payload: unknown[]) => {
  if (!payload || payload.length === 0) {
    return 'No payload'
  }

  try {
    const value = payload.length === 1 ? payload[0] : payload
    return JSON.stringify(value, null, 2)
  } catch {
    return String(payload)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-8">
    <div class="container mx-auto px-4 space-y-6 max-w-7xl">
      <!-- Header Card -->
      <div class="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700/50 p-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-semibold tracking-tight text-white">Fabric Devtools</h1>
            <p class="text-sm text-slate-400 mt-1">
              Logger endpoint:
              <span class="font-mono text-slate-200">{{ loggerUrl }}</span>
            </p>
          </div>
          <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50">
            <div :class="['w-2 h-2 rounded-full', statusColor]"></div>
            <span class="text-sm font-medium text-white">{{ statusLabel }}</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 mt-6">
          <button
            @click="reconnect"
            :disabled="connection === 'connecting'"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {{ connection === 'connecting' ? 'Connecting...' : 'Reconnect' }}
          </button>
          <button
            @click="clearEvents"
            :disabled="events.length === 0"
            class="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            Clear events
          </button>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 mt-6">
          <div class="bg-slate-900/30 backdrop-blur-sm rounded-lg border border-slate-700/30 p-4">
            <span class="text-xs uppercase tracking-wide text-slate-400">Connected clients</span>
            <p class="text-3xl font-semibold text-white mt-2">
              {{ connectedClients }}
            </p>
          </div>
          <div class="bg-slate-900/30 backdrop-blur-sm rounded-lg border border-slate-700/30 p-4">
            <span class="text-xs uppercase tracking-wide text-slate-400">Events tracked</span>
            <p class="text-3xl font-semibold text-white mt-2">
              {{ events.length }}
            </p>
          </div>
        </div>

        <div
          v-if="lastError"
          class="mt-4 p-4 rounded-lg bg-red-900/20 border border-red-500/30"
        >
          <div class="flex gap-2">
            <svg class="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-sm font-medium text-red-300">Connection issue</p>
              <p class="text-sm text-red-400 mt-1">{{ lastError }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Status Updates -->
        <div class="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700/50">
          <div class="p-4 border-b border-slate-700/50">
            <h2 class="text-lg font-semibold text-white">Status updates</h2>
          </div>
          <div class="p-4">
            <div v-if="orderedStatuses.length === 0" class="text-sm text-slate-400 py-10 text-center">
              Waiting for status updates…
            </div>

            <div v-else class="space-y-2 max-h-[420px] overflow-auto">
              <div
                v-for="statusMessage in orderedStatuses"
                :key="`${statusMessage.timestamp}-${statusMessage.status}-${statusMessage.details.clients}`"
                class="flex items-start justify-between gap-4 rounded-md border border-slate-700/30 bg-slate-900/30 p-3 text-sm"
              >
                <div class="space-y-1 flex-1">
                  <p class="font-medium capitalize text-white">
                    {{ statusMessage.status.replace('-', ' ') }}
                  </p>
                  <p class="text-xs text-slate-400">
                    Clients: {{ statusMessage.details.clients }}
                  </p>
                  <p v-if="statusMessage.error" class="text-xs text-red-300">
                    {{ statusMessage.error.message }}
                  </p>
                </div>
                <span class="text-xs text-slate-400 whitespace-nowrap">{{ formatTime(statusMessage.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Events Timeline -->
        <div class="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700/50 lg:col-span-2">
          <div class="p-4 border-b border-slate-700/50">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-white">Events timeline</h2>
              <p class="text-xs text-slate-400">
                Showing latest {{ Math.min(events.length, 500) }} events
              </p>
            </div>
          </div>
          <div class="p-4">
            <div v-if="orderedEvents.length === 0" class="py-20 text-center text-sm text-slate-400">
              Trigger Fabric actions to see activity here.
            </div>

            <div v-else class="space-y-3 max-h-[560px] overflow-auto">
              <div
                v-for="event in orderedEvents"
                :key="event.id"
                class="border border-slate-700/30 bg-gradient-to-br from-slate-900/40 to-slate-900/20 rounded-lg overflow-hidden"
              >
                <div class="p-4 border-b border-slate-700/30">
                  <div class="flex items-center justify-between gap-4">
                    <div class="flex items-center gap-2">
                      <div :class="['w-2 h-2 rounded-full', eventColor(event.event)]"></div>
                      <span class="text-sm font-medium text-white">{{ event.event }}</span>
                    </div>
                    <span class="text-xs text-slate-400">{{ formatTime(event.timestamp) }}</span>
                  </div>
                </div>

                <pre class="max-h-64 overflow-auto bg-black/40 p-4 text-xs leading-relaxed text-slate-200 font-mono">{{ formatPayload(event.payload) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
