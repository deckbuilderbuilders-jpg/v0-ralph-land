"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, Check, Code, RefreshCw, Github, Rocket, FileCode, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { generateZip, downloadBlob } from "@/lib/zip-generator"
import { getFileStats } from "@/lib/file-parser"
import { GitHubModal } from "@/components/github-modal"
import { DeployModal } from "@/components/deploy-modal"
import { PreviewPanel } from "@/components/preview-panel"

export function DownloadStep() {
  const { generatedFiles, appDescription, reset } = useAppStore()
  const [isGeneratingZip, setIsGeneratingZip] = useState(false)
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false)
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)
  const [githubRepoUrl, setGithubRepoUrl] = useState<string | null>(null)

  const stats = getFileStats(generatedFiles)

  // Generate project name from description
  const projectName =
    appDescription
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30) || "ralph-app"

  const handleDownload = async () => {
    if (generatedFiles.length === 0) {
      alert("No files to download")
      return
    }

    setIsGeneratingZip(true)
    try {
      const blob = await generateZip(generatedFiles, projectName)
      downloadBlob(blob, `${projectName}.zip`)
    } catch (err) {
      console.error("ZIP generation failed:", err)
      alert("Failed to generate ZIP file")
    } finally {
      setIsGeneratingZip(false)
    }
  }

  const handleGitHubSuccess = (repoUrl: string) => {
    setGithubRepoUrl(repoUrl)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto"
    >
      <GitHubModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        files={generatedFiles}
        defaultRepoName={projectName}
        onSuccess={handleGitHubSuccess}
      />

      <DeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        githubRepoUrl={githubRepoUrl}
        projectName={projectName}
      />

      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/10 mb-6"
        >
          <Check className="h-10 w-10 text-emerald-500" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-3">Your App is Ready!</h2>
        <p className="text-muted-foreground">Preview, download, or deploy your production-ready code</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Preview Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="h-[500px]"
        >
          <PreviewPanel files={generatedFiles} />
        </motion.div>

        {/* Right: Actions */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-4 rounded-xl bg-primary/5 border border-primary/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-primary" />
                <span className="font-medium">{stats.fileCount} Files Generated</span>
              </div>
              <div className="text-sm text-muted-foreground">{stats.totalLines.toLocaleString()} lines of code</div>
            </div>
            {/* File type breakdown */}
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(stats.byType).map(([ext, count]) => (
                <span key={ext} className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground">
                  .{ext}: {count}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl bg-card border border-border"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              What&apos;s Included
            </h3>
            <ul className="space-y-2">
              {[
                "Complete Next.js 14+ TypeScript source code",
                "Tailwind CSS styling with shadcn/ui components",
                "Auto-generated package.json with dependencies",
                "README with setup instructions",
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {githubRepoUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">Pushed to GitHub</span>
              </div>
              <a
                href={githubRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View Repo <ExternalLink className="h-3 w-3" />
              </a>
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleDownload} className="h-12" disabled={isGeneratingZip || generatedFiles.length === 0}>
              {isGeneratingZip ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download ZIP
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="h-12 bg-transparent"
              onClick={() => setIsGitHubModalOpen(true)}
              disabled={generatedFiles.length === 0}
            >
              <Github className="mr-2 h-4 w-4" />
              {githubRepoUrl ? "Update GitHub" : "Push to GitHub"}
            </Button>
          </div>

          <Button
            variant="secondary"
            className="w-full h-12"
            onClick={() => setIsDeployModalOpen(true)}
            disabled={!githubRepoUrl}
          >
            <Rocket className="mr-2 h-4 w-4" />
            {githubRepoUrl ? "Deploy to Vercel" : "Push to GitHub first to deploy"}
          </Button>

          <div className="pt-4 border-t border-border">
            <Button variant="ghost" onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Build Another App
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
