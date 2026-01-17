import { createClient } from "@/lib/supabase/server"
import { sendBuildReceipt } from "@/lib/email"
import type { GeneratedFile } from "@/lib/file-parser"

export interface BuildRecord {
  id: string
  user_id: string
  app_name: string
  app_description: string
  prd: string
  status: "pending" | "paid" | "building" | "completed" | "failed"
  complexity: string
  estimated_cost: number
  actual_cost: number
  stripe_session_id: string
  total_iterations: number
  completed_iterations: number
  files_count: number
  lines_of_code: number
  github_repo_url?: string
  vercel_deployment_url?: string
  created_at: string
  completed_at?: string
}

export async function createBuild(
  userId: string,
  appName: string,
  appDescription: string,
  prd: string,
  complexity: string,
  estimatedCost: number,
  estimatedTokens: number,
  totalIterations: number,
  stripeSessionId: string,
): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("builds")
    .insert({
      user_id: userId,
      app_name: appName,
      app_description: appDescription,
      prd,
      status: "paid",
      complexity,
      estimated_cost: estimatedCost,
      estimated_tokens: estimatedTokens,
      total_iterations: totalIterations,
      stripe_session_id: stripeSessionId,
    })
    .select("id")
    .single()

  if (error) throw error
  return data.id
}

export async function updateBuildProgress(
  buildId: string,
  iteration: number,
  phase: string,
  filesCount: number,
  linesOfCode: number,
): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from("builds")
    .update({
      completed_iterations: iteration,
      current_phase: phase,
      files_count: filesCount,
      lines_of_code: linesOfCode,
      status: "building",
      started_at: new Date().toISOString(),
    })
    .eq("id", buildId)
}

export async function saveBuildFiles(buildId: string, files: GeneratedFile[], iteration: number): Promise<void> {
  const supabase = await createClient()

  const fileRecords = files.map((f) => ({
    build_id: buildId,
    file_path: f.path,
    content: f.content,
    iteration,
  }))

  await supabase.from("build_files").insert(fileRecords)
}

export async function addBuildLog(
  buildId: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info",
  iteration?: number,
  tokensUsed?: number,
): Promise<void> {
  const supabase = await createClient()

  await supabase.from("build_logs").insert({
    build_id: buildId,
    iteration,
    message,
    type,
    tokens_used: tokensUsed,
  })
}

export async function completeBuild(
  buildId: string,
  files: GeneratedFile[],
  githubUrl?: string,
  vercelUrl?: string,
): Promise<void> {
  const supabase = await createClient()

  // Calculate total lines of code
  const linesOfCode = files.reduce((sum, f) => sum + f.content.split("\n").length, 0)

  // Get token usage totals
  const { data: tokenData } = await supabase
    .from("token_usage")
    .select("input_tokens, output_tokens, cost_usd")
    .eq("build_id", buildId)

  const actualCost = tokenData?.reduce((sum, t) => sum + Number(t.cost_usd), 0) || 0

  // Update build record
  await supabase
    .from("builds")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      files_count: files.length,
      lines_of_code: linesOfCode,
      actual_cost: actualCost,
      github_repo_url: githubUrl,
      vercel_deployment_url: vercelUrl,
    })
    .eq("id", buildId)

  // Get build and user data for email
  const { data: build } = await supabase
    .from("builds")
    .select("*, profiles(email, full_name)")
    .eq("id", buildId)
    .single()

  if (build?.profiles?.email) {
    const totalInput = tokenData?.reduce((sum, t) => sum + t.input_tokens, 0) || 0
    const totalOutput = tokenData?.reduce((sum, t) => sum + t.output_tokens, 0) || 0

    await sendBuildReceipt({
      userEmail: build.profiles.email,
      userName: build.profiles.full_name,
      appName: build.app_name,
      buildId,
      totalCost: actualCost,
      estimatedCost: Number(build.estimated_cost),
      tokensUsed: { input: totalInput, output: totalOutput },
      filesGenerated: files.length,
      linesOfCode,
      githubUrl,
      vercelUrl,
      completedAt: new Date(),
    })
  }
}

export async function getUserBuilds(userId: string): Promise<BuildRecord[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("builds")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getBuildById(buildId: string): Promise<BuildRecord | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("builds").select("*").eq("id", buildId).single()

  if (error) return null
  return data
}

export async function getBuildFiles(buildId: string): Promise<GeneratedFile[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("build_files")
    .select("file_path, content")
    .eq("build_id", buildId)
    .order("file_path")

  return (data || []).map((f) => ({
    path: f.file_path,
    content: f.content,
  }))
}
