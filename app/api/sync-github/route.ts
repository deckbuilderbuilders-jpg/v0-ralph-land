import { type NextRequest, NextResponse } from "next/server"
import { Octokit } from "@octokit/rest"

export async function POST(request: NextRequest) {
  try {
    const { token, owner, repo, files, message, iteration } = await request.json()

    if (!token || !owner || !repo || !files) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const octokit = new Octokit({ auth: token })

    // Get the default branch ref
    const { data: ref } = await octokit.git.getRef({
      owner,
      repo,
      ref: "heads/main",
    })

    const currentCommitSha = ref.object.sha

    // Get the current commit tree
    const { data: currentCommit } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: currentCommitSha,
    })

    // Create blobs for all files
    const blobs = await Promise.all(
      files.map(async (file: { path: string; content: string }) => {
        const { data } = await octokit.git.createBlob({
          owner,
          repo,
          content: Buffer.from(file.content).toString("base64"),
          encoding: "base64",
        })
        return { path: file.path, sha: data.sha }
      }),
    )

    // Create new tree
    const { data: newTree } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: currentCommit.tree.sha,
      tree: blobs.map((blob) => ({
        path: blob.path,
        mode: "100644" as const,
        type: "blob" as const,
        sha: blob.sha,
      })),
    })

    // Create commit
    const commitMessage = message || `Ralph Builder - Iteration ${iteration}`
    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: newTree.sha,
      parents: [currentCommitSha],
    })

    // Update ref
    await octokit.git.updateRef({
      owner,
      repo,
      ref: "heads/main",
      sha: newCommit.sha,
    })

    return NextResponse.json({
      success: true,
      commitSha: newCommit.sha,
      commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
    })
  } catch (error) {
    console.error("GitHub sync error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "GitHub sync failed",
      },
      { status: 500 },
    )
  }
}
