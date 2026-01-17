"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import {
  Hammer,
  Terminal,
  AlertCircle,
  FileCode,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Github,
  Eye,
  ListTodo,
  RefreshCw,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { parseGeneratedCode, mergeGeneratedFiles, type GeneratedFile } from "@/lib/file-parser"
import { generateTodoFromPRD, type BuildContext, type IterationResult } from "@/lib/build-context"
import type { TestResult } from "@/lib/code-tester"
import { BuildProgressBar } from "@/components/step-progress"

export function BuildStep() {
  const {
    prd,
    costEstimate,
    buildLogs,
    buildProgress,
    addBuildLog,
    setBuildProgress,
    setGeneratedCode,
    setGeneratedFiles,
    setStep,
    paymentVerification,
    stripeSessionId,
    setBuildContext,
    updateTodoItem,
    addIterationResult,
    setCurrentTestResult,
    currentTestResult,
    setPreviewHTML,
    previewHTML,
    githubConfig,
    setLastGithubSync,
    todoList,
  } = useAppStore()

  const hasStarted = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFile, setCurrentFile] = useState<string>("")
  const [fileCount, setFileCount] = useState(0)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isPaymentValid, setIsPaymentValid] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showTodoList, setShowTodoList] = useState(false)
  const [currentIteration, setCurrentIteration] = useState(0)
  const [totalIterations, setTotalIterations] = useState(0)
  const [isTesting, setIsTesting] = useState(false)
  const [isSyncingGithub, setIsSyncingGithub] = useState(false)
  const [buildPhase, setBuildPhase] = useState<"verifying" | "building" | "testing" | "syncing" | "complete">(
    "verifying",
  )
  const [buildStartTime, setBuildStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (isPaymentValid && !buildStartTime) {
      setBuildStartTime(Date.now())
    }
  }, [isPaymentValid, buildStartTime])

  useEffect(() => {
    if (!buildStartTime || buildPhase === "complete") return

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - buildStartTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [buildStartTime, buildPhase])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins === 0) return `${secs}s`
    return `${mins}m ${secs}s`
  }

  const estimatedSecondsPerIteration = 50 // ~45s build + 5s test
  const estimatedTotalSeconds =
    (totalIterations || costEstimate?.estimates.iterations || 8) * estimatedSecondsPerIteration
  const estimatedRemainingSeconds = Math.max(estimatedTotalSeconds - elapsedTime, 0)

  // Payment verification effect
  useEffect(() => {
    const verifyPayment = async () => {
      if (paymentVerification?.verified) {
        setIsPaymentValid(true)
        setIsVerifying(false)
        return
      }

      if (!stripeSessionId) {
        setError("No payment session found. Please go back and complete payment.")
        setIsVerifying(false)
        return
      }

      try {
        const response = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: stripeSessionId }),
        })

        const data = await response.json()

        if (data.verified) {
          setIsPaymentValid(true)
        } else {
          setError("Payment not verified. Please complete payment first.")
        }
      } catch (err) {
        console.error("Payment verification error:", err)
        setError("Failed to verify payment. Please try again.")
      }

      setIsVerifying(false)
    }

    verifyPayment()
  }, [paymentVerification, stripeSessionId])

  // Main build loop
  useEffect(() => {
    if (hasStarted.current || !isPaymentValid || isVerifying) return
    hasStarted.current = true

    const runBuild = async () => {
      const iterations = costEstimate?.estimates.iterations || 8
      setTotalIterations(iterations)
      setBuildPhase("building")

      // Initialize build context with todo list
      const initialTodos = generateTodoFromPRD(prd, iterations)
      const initialContext: BuildContext = {
        prd,
        todoList: initialTodos,
        progress: {
          currentIteration: 0,
          totalIterations: iterations,
          phase: "setup",
          completedTasks: [],
          currentTask: "",
          filesGenerated: 0,
          linesOfCode: 0,
        },
        iterationHistory: [],
      }
      setBuildContext(initialContext)

      addBuildLog({
        iteration: 0,
        message: `Payment verified. Starting build with ${iterations} iterations...`,
        type: "success",
      })

      let accumulatedCode = ""
      let allFiles: GeneratedFile[] = []
      let currentContext = initialContext

      for (let i = 1; i <= iterations; i++) {
        setCurrentIteration(i)
        setBuildPhase("building")

        // Update current task in todo list
        const currentTodo = currentContext.todoList.find((t) => t.iteration === i)
        if (currentTodo) {
          updateTodoItem(currentTodo.id, { status: "in-progress" })
        }

        addBuildLog({
          iteration: i,
          message: `Iteration ${i}/${iterations}: ${currentTodo?.task || "Building..."}`,
          type: "info",
        })

        try {
          const response = await fetch("/api/build", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prd,
              iteration: i,
              totalIterations: iterations,
              previousFiles: allFiles.map((f) => ({ path: f.path })),
              sessionId: stripeSessionId,
              buildContext: currentContext,
            }),
          })

          if (!response.ok) {
            throw new Error(`Build iteration ${i} failed: ${response.status}`)
          }

          const reader = response.body?.getReader()
          if (!reader) throw new Error("No response stream")

          const decoder = new TextDecoder()
          let iterationCode = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            iterationCode += chunk

            // Extract current file being written
            const fileMatches = iterationCode.match(/=== FILE: ([^\s=]+)/g)
            if (fileMatches && fileMatches.length > 0) {
              const lastMatch = fileMatches[fileMatches.length - 1]
              const fileName = lastMatch.replace("=== FILE: ", "")
              setCurrentFile(fileName)
            }
          }

          // Parse generated files
          const newFiles = parseGeneratedCode(iterationCode)
          allFiles = mergeGeneratedFiles(allFiles, newFiles)
          setFileCount(allFiles.length)

          // Parse progress update from Claude's response
          const progressMatch = iterationCode.match(/=== PROGRESS UPDATE ===([\s\S]*?)=== END PROGRESS ===/)
          const iterationResult: IterationResult = {
            iteration: i,
            filesCreated: newFiles.map((f) => f.path),
            filesUpdated: [],
            summary: `Generated ${newFiles.length} files`,
            timestamp: new Date(),
          }

          if (progressMatch) {
            try {
              const progressData = JSON.parse(progressMatch[1].trim())
              iterationResult.summary = progressData.summary || iterationResult.summary

              // Update PRD with addendum if provided
              if (progressData.prdAddendum) {
                currentContext = {
                  ...currentContext,
                  prd:
                    currentContext.prd +
                    "\n\n## Implementation Notes (Iteration " +
                    i +
                    ")\n" +
                    progressData.prdAddendum,
                }
              }

              // Update todo items
              if (progressData.todoUpdates) {
                for (const update of progressData.todoUpdates) {
                  updateTodoItem(update.id, { status: update.status })
                }
              }
            } catch {
              // Progress parsing failed, continue anyway
            }
          }

          accumulatedCode += `\n// === ITERATION ${i} ===\n${iterationCode}`

          // Run tests on generated code
          setBuildPhase("testing")
          setIsTesting(true)
          addBuildLog({
            iteration: i,
            message: `Testing iteration ${i} code...`,
            type: "info",
          })

          try {
            const testResponse = await fetch("/api/test-code", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ files: allFiles }),
            })

            const testData = await testResponse.json()
            const testResult: TestResult = testData.testResult

            iterationResult.testResult = testResult
            setCurrentTestResult(testResult)
            setPreviewHTML(testData.previewHTML)

            if (testResult.passed) {
              addBuildLog({
                iteration: i,
                message: `Tests passed! ${testResult.warnings.length} warnings`,
                type: "success",
              })
            } else {
              addBuildLog({
                iteration: i,
                message: `Tests found ${testResult.errors.length} errors - will attempt to fix`,
                type: "warning",
              })
            }

            // Mark todo as completed or failed based on test
            if (currentTodo) {
              updateTodoItem(currentTodo.id, {
                status: testResult.passed ? "completed" : "failed",
                testResult,
              })
            }
          } catch (testErr) {
            console.error("Test error:", testErr)
          }
          setIsTesting(false)

          // Sync to GitHub if configured
          if (githubConfig?.connected) {
            setBuildPhase("syncing")
            setIsSyncingGithub(true)
            addBuildLog({
              iteration: i,
              message: `Syncing to GitHub...`,
              type: "info",
            })

            try {
              const syncResponse = await fetch("/api/sync-github", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  token: githubConfig.token,
                  owner: githubConfig.owner,
                  repo: githubConfig.repo,
                  files: allFiles,
                  message: `Ralph Builder - Iteration ${i}: ${iterationResult.summary}`,
                  iteration: i,
                }),
              })

              const syncData = await syncResponse.json()
              if (syncData.success) {
                setLastGithubSync({ commitSha: syncData.commitSha, timestamp: new Date() })
                addBuildLog({
                  iteration: i,
                  message: `GitHub sync complete: ${syncData.commitSha.slice(0, 7)}`,
                  type: "success",
                })
              }
            } catch (syncErr) {
              console.error("GitHub sync error:", syncErr)
              addBuildLog({
                iteration: i,
                message: `GitHub sync failed - continuing build`,
                type: "warning",
              })
            }
            setIsSyncingGithub(false)
          }

          addBuildLog({
            iteration: i,
            message: `Iteration ${i} complete - ${newFiles.length} files (${allFiles.length} total)`,
            type: "success",
          })
        } catch (err) {
          console.error(`Iteration ${i} error:`, err)
          addBuildLog({
            iteration: i,
            message: `Warning: Iteration ${i} had issues, continuing...`,
            type: "warning",
          })

          if (currentTodo) {
            updateTodoItem(currentTodo.id, { status: "failed" })
          }
        }

        setBuildProgress((i / iterations) * 100)
      }

      setGeneratedCode(accumulatedCode)
      setGeneratedFiles(allFiles)
      setBuildPhase("complete")

      addBuildLog({
        iteration: iterations + 1,
        message: `Build complete! Generated ${allFiles.length} files. Ready for download.`,
        type: "success",
      })

      setTimeout(() => setStep("download"), 1500)
    }

    runBuild().catch((err) => {
      console.error("Build failed:", err)
      setError("Build failed. Please try again.")
    })
  }, [
    prd,
    costEstimate,
    addBuildLog,
    setBuildProgress,
    setGeneratedCode,
    setGeneratedFiles,
    setStep,
    isPaymentValid,
    isVerifying,
    stripeSessionId,
    setBuildContext,
    updateTodoItem,
    addIterationResult,
    setCurrentTestResult,
    setPreviewHTML,
    githubConfig,
    setLastGithubSync,
  ])

  // Render loading state
  if (isVerifying) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6"
        >
          <ShieldCheck className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-3">Verifying Payment</h2>
        <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
      </motion.div>
    )
  }

  // Render payment error state
  if (!isPaymentValid && error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-6">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Payment Required</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => setStep("approve")}>Go to Payment</Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6"
        >
          <Hammer className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-3">Building Your App</h2>
        <p className="text-muted-foreground mb-4">Claude is autonomously generating your application code</p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-6 px-6 py-3 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Estimated Total</p>
              <p className="text-lg font-bold text-primary">{formatTime(estimatedTotalSeconds)}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-left">
            <p className="text-xs text-muted-foreground">Time Remaining</p>
            <p className="text-lg font-bold">
              {buildPhase === "complete" ? (
                <span className="text-green-500">Done!</span>
              ) : (
                formatTime(estimatedRemainingSeconds)
              )}
            </p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-left">
            <p className="text-xs text-muted-foreground">Elapsed</p>
            <p className="text-lg font-bold text-muted-foreground">{formatTime(elapsedTime)}</p>
          </div>
        </motion.div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main build panel */}
        <div className="lg:col-span-2 space-y-6">
          <BuildProgressBar
            currentIteration={currentIteration}
            totalIterations={totalIterations || costEstimate?.estimates.iterations || 8}
            phase={buildPhase}
            buildProgress={buildProgress}
          />

          {/* Current file indicator */}
          {currentFile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground text-center"
            >
              Writing: <span className="font-mono text-primary">{currentFile}</span>
            </motion.div>
          )}

          {/* Status indicators */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileCode className="h-4 w-4 text-primary" />
              <span>{fileCount} files</span>
            </div>
            {isTesting && (
              <div className="flex items-center gap-2 text-yellow-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Testing...</span>
              </div>
            )}
            {isSyncingGithub && (
              <div className="flex items-center gap-2 text-blue-500">
                <Github className="h-4 w-4 animate-pulse" />
                <span>Syncing...</span>
              </div>
            )}
            {currentTestResult && (
              <div
                className={`flex items-center gap-2 ${currentTestResult.passed ? "text-green-500" : "text-red-500"}`}
              >
                {currentTestResult.passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <span>{currentTestResult.passed ? "Tests pass" : `${currentTestResult.errors.length} errors`}</span>
              </div>
            )}
          </div>

          {/* Build log */}
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
              <Terminal className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Build Log</span>
            </div>
            <div className="h-64 overflow-y-auto space-y-2 font-mono text-sm">
              {buildLogs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-2 ${
                    log.type === "error"
                      ? "text-red-400"
                      : log.type === "warning"
                        ? "text-yellow-400"
                        : log.type === "success"
                          ? "text-green-400"
                          : "text-muted-foreground"
                  }`}
                >
                  <span className="text-primary">[{log.iteration}]</span>
                  <span>{log.message}</span>
                </motion.div>
              ))}
              {buildProgress < 100 && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  className="text-primary"
                >
                  |
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTodoList(!showTodoList)}
              className="justify-start"
            >
              <ListTodo className="h-4 w-4 mr-2" />
              {showTodoList ? "Hide" : "Show"} Todo List
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              disabled={!previewHTML}
              className="justify-start"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? "Hide" : "Show"} Preview
            </Button>
          </div>

          {/* Todo List */}
          {showTodoList && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-4 rounded-xl bg-card border border-border"
            >
              <h3 className="text-sm font-medium mb-3">Build Tasks</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {todoList.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 text-xs p-2 rounded-lg ${
                      item.status === "completed"
                        ? "bg-green-500/10 text-green-400"
                        : item.status === "in-progress"
                          ? "bg-primary/10 text-primary"
                          : item.status === "failed"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {item.status === "completed" ? (
                      <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                    ) : item.status === "in-progress" ? (
                      <RefreshCw className="h-3 w-3 flex-shrink-0 animate-spin" />
                    ) : item.status === "failed" ? (
                      <XCircle className="h-3 w-3 flex-shrink-0" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-current flex-shrink-0" />
                    )}
                    <span className="truncate">{item.task}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Preview */}
          {showPreview && previewHTML && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-xl border border-border overflow-hidden"
            >
              <div className="p-2 bg-card border-b border-border text-xs font-medium">Preview</div>
              <iframe
                srcDoc={previewHTML}
                className="w-full h-64 bg-white"
                sandbox="allow-scripts"
                title="Code Preview"
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
