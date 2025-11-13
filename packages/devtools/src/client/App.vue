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
      return 'green'
    case 'connecting':
      return 'yellow'
    case 'error':
      return 'red'
    case 'disconnected':
    default:
      return 'gray'
  }
})

const eventColor = (eventName: string) => {
  const map: Record<string, string> = {
    start: 'blue',
    end: 'blue',
    'process:start': 'blue',
    'process:progress': 'cyan',
    'process:end': 'green',
    'file:add': 'purple',
    'file:start': 'cyan',
    'file:end': 'green',
    'file:resolve:path': 'violet',
    'file:resolve:name': 'violet',
    'write:start': 'blue',
    'write:end': 'green',
  }

  return map[eventName] ?? 'gray'
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
  <UContainer class="py-8 space-y-6">
    <UCard :ui="{ body: { padding: 'p-6 space-y-6' } }">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-semibold tracking-tight">Fabric Devtools</h1>
            <p class="text-sm text-gray-400">
              Logger endpoint:
              <span class="font-mono text-gray-200">{{ loggerUrl }}</span>
            </p>
          </div>
          <UBadge :color="statusColor" variant="soft" size="lg">
            {{ statusLabel }}
          </UBadge>
        </div>
      </template>

      <div class="flex flex-wrap gap-3">
        <UButton :loading="connection === 'connecting'" @click="reconnect">
          Reconnect
        </UButton>
        <UButton
          color="gray"
          variant="ghost"
          :disabled="events.length === 0"
          @click="clearEvents"
        >
          Clear events
        </UButton>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <UCard :ui="{ body: { padding: 'p-4' } }" class="bg-white/5 backdrop-blur-sm border-white/10">
          <template #header>
            <span class="text-sm uppercase tracking-wide text-gray-400">Connected clients</span>
          </template>
          <p class="text-3xl font-semibold text-white">
            {{ connectedClients }}
          </p>
        </UCard>
        <UCard :ui="{ body: { padding: 'p-4' } }" class="bg-white/5 backdrop-blur-sm border-white/10">
          <template #header>
            <span class="text-sm uppercase tracking-wide text-gray-400">Events tracked</span>
          </template>
          <p class="text-3xl font-semibold text-white">
            {{ events.length }}
          </p>
        </UCard>
      </div>

      <UAlert
        v-if="lastError"
        color="red"
        variant="soft"
        :title="'Connection issue'"
        :description="lastError"
      />
    </UCard>

    <div class="grid gap-6 lg:grid-cols-3">
      <UCard :ui="{ body: { padding: 'p-4 space-y-3' } }">
        <template #header>
          <h2 class="text-lg font-semibold text-white">Status updates</h2>
        </template>

        <div v-if="orderedStatuses.length === 0" class="text-sm text-gray-400">
          Waiting for status updates…
        </div>

        <div v-else class="space-y-2 max-h-[420px] overflow-auto pr-1">
          <div
            v-for="statusMessage in orderedStatuses"
            :key="`${statusMessage.timestamp}-${statusMessage.status}-${statusMessage.details.clients}`"
            class="flex items-start justify-between gap-4 rounded-md border border-white/5 bg-white/5 p-3 text-sm"
          >
            <div class="space-y-1">
              <p class="font-medium capitalize text-white">
                {{ statusMessage.status.replace('-', ' ') }}
              </p>
              <p class="text-xs text-gray-400">
                Clients: {{ statusMessage.details.clients }}
              </p>
              <p v-if="statusMessage.error" class="text-xs text-red-300">
                {{ statusMessage.error.message }}
              </p>
            </div>
            <span class="text-xs text-gray-400 whitespace-nowrap">{{ formatTime(statusMessage.timestamp) }}</span>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: { padding: 'p-4 space-y-3' } }" class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-white">Events timeline</h2>
            <p class="text-xs text-gray-400">
              Showing latest {{ Math.min(events.length, 500) }} events
            </p>
          </div>
        </template>

        <div v-if="orderedEvents.length === 0" class="py-10 text-center text-sm text-gray-400">
          Trigger Fabric actions to see activity here.
        </div>

        <div v-else class="space-y-3 max-h-[560px] overflow-auto pr-1">
          <UCard
            v-for="event in orderedEvents"
            :key="event.id"
            :ui="{ body: { padding: 'p-4 space-y-3' } }"
            class="border border-white/5 bg-gradient-to-br from-white/5 to-white/2"
          >
            <template #header>
              <div class="flex items-center justify-between gap-4">
                <UBadge :color="eventColor(event.event)" variant="soft">
                  {{ event.event }}
                </UBadge>
                <span class="text-xs text-gray-400">{{ formatTime(event.timestamp) }}</span>
              </div>
            </template>

            <pre class="max-h-64 overflow-auto rounded-md bg-black/40 p-3 text-xs leading-relaxed text-gray-200">
{{ formatPayload(event.payload) }}
            </pre>
          </UCard>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
