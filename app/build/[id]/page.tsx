import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { getBuildById, getBuildFiles } from "@/lib/build-service"
import { getBuildTokenUsage } from "@/lib/token-tracker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Github, Download, FileCode, DollarSign, Cpu, Clock } from "lucide-react"

export default async function BuildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const build = await getBuildById(id)

  if (!build || build.user_id !== user.id) {
    notFound()
  }

  const files = await getBuildFiles(id)
  const tokenUsage = await getBuildTokenUsage(id)

  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    paid: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    building: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
    failed: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{build.app_name}</h1>
              <p className="mt-1 text-muted-foreground">{build.app_description}</p>
            </div>
            <Badge className={statusColors[build.status as keyof typeof statusColors]}>{build.status}</Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                Files Generated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{build.files_count}</p>
              <p className="text-sm text-muted-foreground">{build.lines_of_code.toLocaleString()} lines of code</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Cost
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${Number(build.actual_cost || build.estimated_cost).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Estimated: ${Number(build.estimated_cost).toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Tokens Used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{(tokenUsage.totalInput + tokenUsage.totalOutput).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">
                {tokenUsage.totalInput.toLocaleString()} in / {tokenUsage.totalOutput.toLocaleString()} out
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {build.completed_iterations}/{build.total_iterations}
              </p>
              <p className="text-sm text-muted-foreground">iterations completed</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex gap-4">
          {build.github_repo_url && (
            <a href={build.github_repo_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Button>
            </a>
          )}
          {build.vercel_deployment_url && (
            <a href={build.vercel_deployment_url} target="_blank" rel="noopener noreferrer">
              <Button>
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Live Site
              </Button>
            </a>
          )}
          {files.length > 0 && (
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download ZIP
            </Button>
          )}
        </div>

        {files.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Generated Files</CardTitle>
              <CardDescription>{files.length} files in this build</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                    <FileCode className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate font-mono text-xs">{file.path}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {build.prd && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Product Requirements Document</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap rounded-lg bg-muted/50 p-4 text-sm">{build.prd}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
