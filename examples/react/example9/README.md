# PDF Support in Kubb Fabric

This directory demonstrates PDF generation support in Kubb Fabric using `react-pdf`.

## Overview

Kubb Fabric now supports generating PDF files alongside code files using the `react-pdf` library. This integration allows you to use React components to create beautiful PDFs as part of your code generation workflow.

## Installation

To use PDF support, install the optional peer dependency:

```bash
npm install @react-pdf/renderer
# or
pnpm add @react-pdf/renderer
```

## Usage

### Method 1: Using the PDF Component

Use the `<PDF>` component to embed react-pdf components in your Kubb workflow:

```tsx
import { createReactFabric, PDF } from '@kubb/react-fabric'
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
fabric.use(pdfPlugin)
fabric.use(reactPlugin)

await fabric.render(App)
```

### Method 2: Using renderPDF Method

For more control, use the `renderPDF` method directly:

```tsx
import { createReactFabric } from '@kubb/react-fabric'
import { pdfPlugin } from '@kubb/react-fabric/plugins'
import { Document, Page, Text } from '@react-pdf/renderer'

function MyPDFDocument() {
  return (
    <Document>
      <Page>
        <Text>Hello PDF!</Text>
      </Page>
    </Document>
  )
}

const fabric = createReactFabric()
fabric.use(pdfPlugin, {
  dryRun: false,
  onBeforeWrite: (path) => console.log('Writing:', path),
})

await fabric.renderPDF(MyPDFDocument, 'output.pdf')
```

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
3. **PDF Component** (`<PDF>`) - JSX component for embedding react-pdf content
4. **Virtual Node** (`kubb-pdf`) - Custom renderer node that bridges Kubb with react-pdf

The integration uses a "bridge via virtual node" approach, where:
- The `kubb-pdf` custom element is recognized by Kubb's reconciler
- react-pdf components are passed as children to the `<PDF>` component
- The PDF plugin handles the actual rendering using `@react-pdf/renderer`'s `renderToFile`

## Examples

See `example9/run.tsx` for a complete working example.

## Combining with File Generation

You can mix PDF generation with regular file generation in the same workflow:

```tsx
import { File, PDF } from '@kubb/react-fabric'

function App() {
  return (
    <>
      <File path="output/index.ts" baseName="index.ts">
        <File.Source>
          export const version = "1.0.0"
        </File.Source>
      </File>
      
      <PDF file="output/documentation.pdf">
        <Document>
          <Page>
            <Text>API Documentation</Text>
          </Page>
        </Document>
      </PDF>
    </>
  )
}
```

## Learn More

- [react-pdf Documentation](https://react-pdf.org/)
- [Kubb Fabric Documentation](https://kubb.dev/)
