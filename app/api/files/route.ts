import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Formatter to turn raw bytes into readable file size units
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Scans recursively through directories to grab file details
function getFilesRecursively(dirPath: string, relativeRoot: string, fileList: any[] = []): any[] {
  if (!fs.existsSync(dirPath)) return fileList;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    // Ignore heavy build artifacts and hidden git folders to keep it fast
    if (["node_modules", ".next", ".git", "out"].includes(file)) return;

    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    const displayPath = path.relative(relativeRoot, fullPath).replace(/\\/g, "/");

    if (stat.isDirectory()) {
      getFilesRecursively(fullPath, relativeRoot, fileList);
    } else {
      let allocationType = "Static Resource";
      if (file.endsWith(".tsx") || file.endsWith(".ts")) allocationType = "Component Module";
      if (file.endsWith(".json")) allocationType = "System Config";
      if (file.endsWith(".css")) allocationType = "Style Cascade";

      fileList.push({
        name: file,
        type: allocationType,
        path: `/${displayPath}`,
        size: formatBytes(stat.size),
      });
    }
  });

  return fileList;
}

export async function GET() {
  try {
    const rootPath = process.cwd(); // Resolves to your main project folder root
    const appDir = path.join(rootPath, "app");
    
    // Scans your actual app directory paths
    const realProjectFiles = getFilesRecursively(appDir, rootPath, []);
    
    return NextResponse.json(realProjectFiles);
  } catch (error) {
    console.error("Failed to read workspace index:", error);
    return NextResponse.json({ error: "Failed to allocate system file tree" }, { status: 500 });
  }
}
