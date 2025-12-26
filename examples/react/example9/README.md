# PDF Support in Kubb Fabric

This directory demonstrates PDF generation support in Kubb Fabric using `react-pdf`.

## Overview

Kubb Fabric now supports generating PDF files alongside code files using the `react-pdf` library. This integration allows you to use React components to create beautiful PDFs as part of your code generation workflow. There are two ways to generate PDFs:

1. **File-based approach** - Uses standard `File` and `File.Source` components
2. **PDF component approach** - Uses a dedicated `PDF` component with `useEffect` for direct rendering

## Installation

To use PDF support, install the optional peer dependency:

```bash
npm install @react-pdf/renderer
# or
pnpm add @react-pdf/renderer
```

## Usage

### Method 1: Using File and File.Source (String-based)

Use Fabric's standard `<File>` component with a `.pdf` extension:

```tsx
import { createReactFabric, File } from '@kubb/react-fabric'
import { pdfPlugin, reactPlugin } from '@kubb/react-fabric/plugins'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
})

function App() {
  return (
    <File path="output/report.pdf" baseName="report.pdf">
      <File.Source>
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.section}>
              <Text>Generated with Kubb 🚀</Text>
            </View>
          </Page>
        </Document>
      </File.Source>
    </File>
  )
}

const fabric = createReactFabric()
fabric.use(pdfPlugin)
fabric.use(reactPlugin)

await fabric.render(App)
```

### Method 2: Using the PDF Component (Direct rendering)

Use the `<PDF>` component which uses `useEffect` to directly render PDFs:

```tsx
import { createReactFabric, PDF } from '@kubb/react-fabric'
import { reactPlugin } from '@kubb/react-fabric/plugins'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
})

function App() {
  return (
    <PDF file="output/report.pdf">
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text>Generated with Kubb 🚀</Text>
          </View>
        </Page>
      </Document>
    </PDF>
  )
}

const fabric = createReactFabric()
fabric.use(reactPlugin)

await fabric.render(App)
```

The PDF component uses `useEffect` to dynamically import `@react-pdf/renderer` and call `renderToFile` directly with the React element tree.

## Plugin Options

The `pdfPlugin` accepts the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dryRun` | `boolean` | `false` | If true, PDFs will not be written to disk |
| `onBeforeWrite` | `(path: string) => void \| Promise<void>` | - | Called before writing each PDF file |

## Architecture

The PDF support is implemented through:

1. **PDF Parser** (`pdfParser`) - Handles `.pdf` file extensions
2. **PDF Plugin** (`pdfPlugin`) - Provides PDF rendering capabilities
3. **File Integration** - Uses standard `File` and `File.Source` components
4. **Virtual Node** (`kubb-pdf`) - Internal bridge between Kubb and react-pdf

The integration detects when a `File` component has a `.pdf` extension and automatically handles the rendering using `@react-pdf/renderer`'s `renderToFile`.

## Examples

See `example9/run.tsx` for a complete working example.

## Combining with File Generation

You can mix PDF generation with regular file generation in the same workflow:

```tsx
import { File } from '@kubb/react-fabric'
import { Document, Page, Text } from '@react-pdf/renderer'

function App() {
  return (
    <>
      <File path="output/index.ts" baseName="index.ts">
        <File.Source>
          export const version = "1.0.0"
        </File.Source>
      </File>
      
      <File path="output/documentation.pdf" baseName="documentation.pdf">
        <File.Source>
          <Document>
            <Page>
              <Text>API Documentation</Text>
            </Page>
          </Document>
        </File.Source>
      </File>
    </>
  )
}
```

## Learn More

- [react-pdf Documentation](https://react-pdf.org/)
- [Kubb Fabric Documentation](https://kubb.dev/)
