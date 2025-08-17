import { getSandbox, LogEvent, parseSSEStream } from "@cloudflare/sandbox";

function parseAIResponse(response: string) {
  const sections = {
    files: [] as Array<{ path: string; content: string }>,
  };

  // Parse file sections - handle duplicates and prefer complete versions
  const fileMap = new Map<string, { content: string; isComplete: boolean }>();

  const fileRegex = /<file path="([^"]+)">([\s\S]*?)(?:<\/file>|$)/g;
  let match;
  while ((match = fileRegex.exec(response)) !== null) {
    const filePath = match[1];
    const content = match[2].trim();
    const hasClosingTag = response
      .substring(match.index, match.index + match[0].length)
      .includes("</file>");

    // Check if this file already exists in our map
    const existing = fileMap.get(filePath);

    // Decide whether to keep this version
    let shouldReplace = false;
    if (!existing) {
      shouldReplace = true; // First occurrence
    } else if (!existing.isComplete && hasClosingTag) {
      shouldReplace = true; // Replace incomplete with complete
      console.log(
        `[parseAIResponse] Replacing incomplete ${filePath} with complete version`
      );
    } else if (
      existing.isComplete &&
      hasClosingTag &&
      content.length > existing.content.length
    ) {
      shouldReplace = true; // Replace with longer complete version
      console.log(
        `[parseAIResponse] Replacing ${filePath} with longer complete version`
      );
    } else if (
      !existing.isComplete &&
      !hasClosingTag &&
      content.length > existing.content.length
    ) {
      shouldReplace = true; // Both incomplete, keep longer one
    }

    if (shouldReplace) {
      // Additional validation: reject obviously broken content
      if (
        content.includes("...") &&
        !content.includes("...props") &&
        !content.includes("...rest")
      ) {
        console.warn(
          `[parseAIResponse] Warning: ${filePath} contains ellipsis, may be truncated`
        );
        // Still use it if it's the only version we have
        if (!existing) {
          fileMap.set(filePath, { content, isComplete: hasClosingTag });
        }
      } else {
        fileMap.set(filePath, { content, isComplete: hasClosingTag });
      }
    }
  }

  // Convert map to array for sections.files
  for (const [path, { content, isComplete }] of fileMap.entries()) {
    if (!isComplete) {
      console.log(
        `[parseAIResponse] Warning: File ${path} appears to be truncated (no closing tag)`
      );
    }

    sections.files.push({
      path,
      content,
    });
  }

  return sections;
}

const cloneRepoInSandbox = async (sandbox: ReturnType<typeof getSandbox>) => {
  let ls = await sandbox.exec("ls workspace");
  if (ls.stdout.includes("vite-react")) return;
  await sandbox.exec("git clone https://github.com/harshil1712/vite-react.git");
  await sandbox.exec("cd vite-react && npm install");
  ls = await sandbox.exec("ls");
  console.log(ls);
};

const writeAiCodeInSandbox = async (
  sandbox: ReturnType<typeof getSandbox>,
  aiGeneratedCode: string,
  hostname: string
) => {
  await cloneRepoInSandbox(sandbox);
  // Parse AI response
  const sections = parseAIResponse(aiGeneratedCode);

  // Write files to sandbox
  for (const file of sections.files) {
    await sandbox.writeFile(file.path, file.content);
    console.log(`[writeAiCodeInSandbox] Wrote file: ${file.path}`);
  }
  const cat = await sandbox.exec("cat src/App.tsx");

  await sandbox.killAllProcesses();

  // Start the development server
  const server = await sandbox.startProcess("npm run dev");

  // Expose port for preview
  const preview = await sandbox.exposePort(8080, { hostname });
  console.log("[PREVIEW] Server running at:", preview.url);
  // Monitor the server process
  const logStream = await sandbox.streamProcessLogs(server.id);

  for await (const log of parseSSEStream<LogEvent>(logStream)) {
    if (log.type === "stdout" && log.data.includes("ERROR")) {
      console.error("[ERROR]", log.data);
    }
    console.log("[LOG]", log.data);
  }
};

export { cloneRepoInSandbox, writeAiCodeInSandbox };
