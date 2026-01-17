"use server"

interface VercelProject {
  id: string
  name: string
  accountId: string
  link?: {
    repoId: string
    type: string
    org: string
    repo: string
  }
}

interface VercelDeployment {
  id: string
  url: string
  state: string
  readyState: string
  createdAt: number
  buildingAt?: number
  ready?: number
}

interface DeployResult {
  success: boolean
  deploymentId?: string
  deploymentUrl?: string
  projectUrl?: string
  error?: string
}

interface DeployStatusResult {
  status: "BUILDING" | "INITIALIZING" | "READY" | "ERROR" | "CANCELED" | "QUEUED"
  url?: string
  error?: string
}

const VERCEL_API = "https://api.vercel.com"

// Create a Vercel project linked to a GitHub repo and trigger deployment
export async function deployToVercel({
  vercelToken,
  githubRepo, // format: "owner/repo"
  projectName,
}: {
  vercelToken: string
  githubRepo: string
  projectName: string
}): Promise<DeployResult> {
  try {
    const [org, repo] = githubRepo.split("/")

    if (!org || !repo) {
      return { success: false, error: "Invalid GitHub repo format. Use 'owner/repo'" }
    }

    // Step 1: Create or get project
    let project: VercelProject | null = null

    // Try to find existing project first
    const projectsRes = await fetch(`${VERCEL_API}/v9/projects?search=${projectName}`, {
      headers: { Authorization: `Bearer ${vercelToken}` },
    })

    if (projectsRes.ok) {
      const projectsData = await projectsRes.json()
      project = projectsData.projects?.find((p: VercelProject) => p.name === projectName)
    }

    // Create project if it doesn't exist
    if (!project) {
      const createRes = await fetch(`${VERCEL_API}/v9/projects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName,
          framework: "nextjs",
          gitRepository: {
            type: "github",
            repo: githubRepo,
          },
        }),
      })

      if (!createRes.ok) {
        const error = await createRes.json()
        return {
          success: false,
          error: error.error?.message || "Failed to create Vercel project",
        }
      }

      project = await createRes.json()
    }

    // Step 2: Trigger deployment
    const deployRes = await fetch(`${VERCEL_API}/v13/deployments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        target: "production",
        gitSource: {
          type: "github",
          org,
          repo,
          ref: "main",
        },
        projectSettings: {
          framework: "nextjs",
        },
      }),
    })

    if (!deployRes.ok) {
      const error = await deployRes.json()
      return {
        success: false,
        error: error.error?.message || "Failed to trigger deployment",
      }
    }

    const deployment: VercelDeployment = await deployRes.json()

    return {
      success: true,
      deploymentId: deployment.id,
      deploymentUrl: `https://${deployment.url}`,
      projectUrl: `https://vercel.com/${project?.accountId || "~"}/${projectName}`,
    }
  } catch (err) {
    console.error("Vercel deployment error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to deploy to Vercel",
    }
  }
}

// Check deployment status
export async function getDeploymentStatus({
  vercelToken,
  deploymentId,
}: {
  vercelToken: string
  deploymentId: string
}): Promise<DeployStatusResult> {
  try {
    const res = await fetch(`${VERCEL_API}/v13/deployments/${deploymentId}`, {
      headers: { Authorization: `Bearer ${vercelToken}` },
    })

    if (!res.ok) {
      return { status: "ERROR", error: "Failed to fetch deployment status" }
    }

    const deployment = await res.json()

    return {
      status: deployment.readyState as DeployStatusResult["status"],
      url: deployment.url ? `https://${deployment.url}` : undefined,
    }
  } catch (err) {
    return {
      status: "ERROR",
      error: err instanceof Error ? err.message : "Failed to check status",
    }
  }
}

// Validate Vercel token
export async function validateVercelToken(token: string): Promise<{
  valid: boolean
  username?: string
  error?: string
}> {
  try {
    const res = await fetch(`${VERCEL_API}/v2/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      return { valid: false, error: "Invalid or expired token" }
    }

    const data = await res.json()
    return { valid: true, username: data.user?.username || data.user?.name }
  } catch {
    return { valid: false, error: "Failed to validate token" }
  }
}
