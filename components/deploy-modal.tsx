"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Rocket, Loader2, Check, ExternalLink, AlertCircle, Github, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deployToVercel, getDeploymentStatus, validateVercelToken } from "@/app/actions/vercel"

interface DeployModalProps {
  isOpen: boolean
  onClose: () => void
  githubRepoUrl: string | null
  projectName: string
}

type DeployState = "idle" | "validating" | "deploying" | "polling" | "success" | "error"

export function DeployModal({ isOpen, onClose, githubRepoUrl, projectName }: DeployModalProps) {
  const [vercelToken, setVercelToken] = useState("")
  const [vercelUsername, setVercelUsername] = useState<string | null>(null)
  const [deployState, setDeployState] = useState<DeployState>("idle")
  const [deploymentId, setDeploymentId] = useState<string | null>(null)
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null)
  const [projectUrl, setProjectUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Extract owner/repo from GitHub URL
  const githubRepo = githubRepoUrl?.replace("https://github.com/", "") || null

  // Poll deployment status
  const pollStatus = useCallback(async () => {
    if (!deploymentId || !vercelToken) return

    const result = await getDeploymentStatus({
      vercelToken,
      deploymentId,
    })

    if (result.status === "READY") {
      setDeployState("success")
      setDeploymentUrl(result.url || null)
    } else if (result.status === "ERROR" || result.status === "CANCELED") {
      setDeployState("error")
      setError(result.error || "Deployment failed")
    }
    // Keep polling if still building
  }, [deploymentId, vercelToken])

  useEffect(() => {
    if (deployState === "polling" && deploymentId) {
      const interval = setInterval(pollStatus, 3000)
      return () => clearInterval(interval)
    }
  }, [deployState, deploymentId, pollStatus])

  const handleValidateToken = async () => {
    if (!vercelToken.trim()) return

    setDeployState("validating")
    setError(null)

    const result = await validateVercelToken(vercelToken)

    if (result.valid) {
      setVercelUsername(result.username || null)
      setDeployState("idle")
    } else {
      setError(result.error || "Invalid token")
      setDeployState("error")
    }
  }

  const handleDeploy = async () => {
    if (!vercelToken || !githubRepo) return

    setDeployState("deploying")
    setError(null)

    const result = await deployToVercel({
      vercelToken,
      githubRepo,
      projectName,
    })

    if (result.success) {
      setDeploymentId(result.deploymentId || null)
      setDeploymentUrl(result.deploymentUrl || null)
      setProjectUrl(result.projectUrl || null)
      setDeployState("polling")
    } else {
      setError(result.error || "Deployment failed")
      setDeployState("error")
    }
  }

  const copyUrl = () => {
    if (deploymentUrl) {
      navigator.clipboard.writeText(deploymentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const resetModal = () => {
    setDeployState("idle")
    setDeploymentId(null)
    setDeploymentUrl(null)
    setProjectUrl(null)
    setError(null)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Rocket className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Deploy to Vercel</h3>
                <p className="text-sm text-muted-foreground">One-click deployment</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* GitHub Repo Info */}
            {githubRepo ? (
              <div className="p-3 rounded-lg bg-secondary/50 flex items-center gap-2">
                <Github className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono">{githubRepo}</span>
                <Check className="h-4 w-4 text-emerald-500 ml-auto" />
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">Push to GitHub first before deploying</span>
              </div>
            )}

            {/* Success State */}
            {deployState === "success" && deploymentUrl && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Check className="h-5 w-5 text-emerald-500" />
                    <span className="font-medium text-emerald-500">Deployed Successfully!</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input value={deploymentUrl} readOnly className="font-mono text-sm bg-background" />
                    <Button variant="outline" size="icon" onClick={copyUrl}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" asChild>
                    <a href={deploymentUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Live Site
                    </a>
                  </Button>
                  {projectUrl && (
                    <Button variant="outline" asChild>
                      <a href={projectUrl} target="_blank" rel="noopener noreferrer">
                        Dashboard
                      </a>
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Deploying/Polling State */}
            {(deployState === "deploying" || deployState === "polling") && (
              <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                <p className="font-medium">
                  {deployState === "deploying" ? "Starting deployment..." : "Building your app..."}
                </p>
                <p className="text-sm text-muted-foreground mt-1">This usually takes 1-3 minutes</p>
              </div>
            )}

            {/* Error State */}
            {deployState === "error" && error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <span className="font-medium text-destructive">Deployment Failed</span>
                </div>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" className="mt-3 bg-transparent" onClick={resetModal}>
                  Try Again
                </Button>
              </div>
            )}

            {/* Token Input & Deploy Button */}
            {deployState !== "success" && deployState !== "polling" && deployState !== "deploying" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="vercel-token">Vercel Token</Label>
                  <div className="flex gap-2">
                    <Input
                      id="vercel-token"
                      type="password"
                      placeholder="Enter your Vercel token"
                      value={vercelToken}
                      onChange={(e) => {
                        setVercelToken(e.target.value)
                        setVercelUsername(null)
                      }}
                      className="font-mono"
                    />
                    {!vercelUsername && vercelToken && (
                      <Button variant="outline" onClick={handleValidateToken} disabled={deployState === "validating"}>
                        {deployState === "validating" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                      </Button>
                    )}
                  </div>
                  {vercelUsername && (
                    <p className="text-sm text-emerald-500 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Connected as {vercelUsername}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Get your token from{" "}
                    <a
                      href="https://vercel.com/account/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      vercel.com/account/tokens
                    </a>
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={handleDeploy}
                  disabled={!vercelToken || !vercelUsername || !githubRepo}
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  Deploy to Vercel
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
