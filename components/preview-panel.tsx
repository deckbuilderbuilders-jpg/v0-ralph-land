"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Monitor, Smartphone, Tablet, RefreshCw, Code, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { GeneratedFile } from "@/lib/file-parser"

interface PreviewPanelProps {
  files: GeneratedFile[]
  isLoading?: boolean
}

type ViewportSize = "desktop" | "tablet" | "mobile"

const viewportSizes: Record<ViewportSize, { width: number; height: number }> = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
}

export function PreviewPanel({ files, isLoading }: PreviewPanelProps) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop")
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [showCode, setShowCode] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Generate preview HTML from files
  useEffect(() => {
    if (files.length === 0) {
      setPreviewHtml(null)
      return
    }

    const html = generatePreviewHtml(files)
    setPreviewHtml(html)
  }, [files, refreshKey])

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
  }

  if (files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-secondary/20 rounded-xl border border-border">
        <div className="text-center text-muted-foreground">
          <Monitor className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Preview will appear here</p>
          <p className="text-sm">as code is generated</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-card rounded-xl border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-border bg-secondary/30">
        <Tabs value={viewport} onValueChange={(v) => setViewport(v as ViewportSize)}>
          <TabsList className="h-8">
            <TabsTrigger value="desktop" className="h-7 px-2">
              <Monitor className="h-3.5 w-3.5" />
            </TabsTrigger>
            <TabsTrigger value="tablet" className="h-7 px-2">
              <Tablet className="h-3.5 w-3.5" />
            </TabsTrigger>
            <TabsTrigger value="mobile" className="h-7 px-2">
              <Smartphone className="h-3.5 w-3.5" />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setShowCode(!showCode)}>
            <Code className="h-3.5 w-3.5 mr-1" />
            {showCode ? "Preview" : "Code"}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-secondary/10 p-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : showCode ? (
          <div className="h-full overflow-auto">
            <pre className="text-xs font-mono p-4 bg-background rounded-lg overflow-auto max-h-full">
              {files.map((f) => `// ${f.path}\n${f.content}`).join("\n\n")}
            </pre>
          </div>
        ) : (
          <motion.div
            key={viewport}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
            style={{
              width: Math.min(viewportSizes[viewport].width, window.innerWidth - 100),
              height: viewportSizes[viewport].height,
              maxHeight: "calc(100vh - 300px)",
            }}
          >
            {previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                title="App Preview"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Unable to generate preview</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Generate a sandboxed HTML preview from the generated files
function generatePreviewHtml(files: GeneratedFile[]): string {
  // Find the main page component
  const pageFile = files.find(
    (f) => f.path === "app/page.tsx" || f.path === "pages/index.tsx" || f.path.endsWith("/page.tsx"),
  )

  // Find globals.css
  const globalsFile = files.find((f) => f.path.includes("globals.css"))

  // Extract component content (simplified - just shows structure)
  const componentContent = pageFile?.content || "<div>No page found</div>"

  // Convert JSX to basic HTML for preview (very simplified)
  const htmlContent = convertJsxToHtml(componentContent)

  // Extract CSS
  const cssContent = globalsFile?.content || ""

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${cssContent}
    body { font-family: system-ui, sans-serif; }
  </style>
</head>
<body class="bg-background text-foreground">
  <div id="root">
    ${htmlContent}
  </div>
</body>
</html>
  `
}

// Very simplified JSX to HTML converter for preview purposes
function convertJsxToHtml(jsx: string): string {
  // Remove imports
  let html = jsx.replace(/^import.*$/gm, "")

  // Remove export statements
  html = html.replace(/^export\s+(default\s+)?/gm, "")

  // Remove function declarations, keep JSX return
  const returnMatch = html.match(/return\s*$$\s*([\s\S]*?)\s*$$\s*[;}]?$/) || html.match(/return\s*([\s\S]*?)\s*[;}]?$/)

  if (returnMatch) {
    html = returnMatch[1]
  }

  // Convert className to class
  html = html.replace(/className=/g, "class=")

  // Remove JSX expressions {variable} - replace with placeholder
  html = html.replace(/\{[^}]+\}/g, "...")

  // Remove event handlers
  html = html.replace(/on[A-Z][a-zA-Z]*=\{[^}]+\}/g, "")

  // Handle self-closing tags
  html = html.replace(/<([A-Z][a-zA-Z]*)\s*\/>/g, '<div class="component-$1">[$1]</div>')

  // Handle component tags (capitalize = component)
  html = html.replace(/<([A-Z][a-zA-Z]*)/g, '<div class="component-$1" data-component="$1"')
  html = html.replace(/<\/([A-Z][a-zA-Z]*)>/g, "</div>")

  return html
}
