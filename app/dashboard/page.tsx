import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserBuilds } from "@/lib/build-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, ExternalLink, Github, Clock, DollarSign, FileCode } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const builds = await getUserBuilds(user.id)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-primary">
            Ralph Builder
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Builds</h1>
            <p className="text-muted-foreground">Manage and access your generated applications</p>
          </div>
          <Link href="/">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Build
            </Button>
          </Link>
        </div>

        {builds.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileCode className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">No builds yet</h3>
              <p className="mb-4 text-center text-muted-foreground">Create your first AI-generated application</p>
              <Link href="/">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Start Building
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {builds.map((build) => (
              <Card key={build.id} className="border-border/50 bg-card/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{build.app_name}</CardTitle>
                    <Badge
                      variant={
                        build.status === "completed"
                          ? "default"
                          : build.status === "building"
                            ? "secondary"
                            : build.status === "failed"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {build.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{build.app_description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <FileCode className="h-4 w-4" />
                      <span>{build.files_count} files</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>${Number(build.actual_cost || build.estimated_cost).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(build.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {build.github_repo_url && (
                      <a href={build.github_repo_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <Github className="mr-2 h-4 w-4" />
                          GitHub
                        </Button>
                      </a>
                    )}
                    {build.vercel_deployment_url && (
                      <a href={build.vercel_deployment_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Live Site
                        </Button>
                      </a>
                    )}
                    <Link href={`/build/${build.id}`}>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
