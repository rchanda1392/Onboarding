/**
 * Extracts text content from all MDX files and outputs a JSON bundle.
 * This bundle is used by the chat feature to provide context to the Gemini API.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, basename, dirname } from 'path';

const DOCS_DIR = join(process.cwd(), 'src', 'content', 'docs');
const OUTPUT_FILE = join(process.cwd(), 'public', 'content-bundle.json');

function stripFrontmatter(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n/);
  return match ? content.slice(match[0].length) : content;
}

function stripMdxComponents(content) {
  // Remove import statements
  content = content.replace(/^import\s+.*$/gm, '');
  // Remove JSX/MDX component tags (e.g., <Card>, <CardGrid>, </Card>)
  content = content.replace(/<\/?[A-Z][a-zA-Z]*[^>]*>/g, '');
  // Remove HTML entities
  content = content.replace(/&[a-z]+;/g, '');
  // Remove inline HTML tags
  content = content.replace(/<\/?[a-z][^>]*>/g, '');
  return content;
}

function extractSections(text) {
  const sections = [];
  const lines = text.split('\n');
  let currentHeading = 'Introduction';
  let currentText = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      if (currentText.length > 0) {
        const content = currentText.join('\n').trim();
        if (content) {
          sections.push({ heading: currentHeading, text: content });
        }
      }
      currentHeading = headingMatch[1];
      currentText = [];
    } else {
      currentText.push(line);
    }
  }

  // Push the last section
  if (currentText.length > 0) {
    const content = currentText.join('\n').trim();
    if (content) {
      sections.push({ heading: currentHeading, text: content });
    }
  }

  return sections;
}

function getTitleFromFrontmatter(content) {
  const match = content.match(/^---\n[\s\S]*?title:\s*["']?(.+?)["']?\s*\n/);
  return match ? match[1] : 'Untitled';
}

function findMdxFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...findMdxFiles(fullPath));
    } else if (entry.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Main
const mdxFiles = findMdxFiles(DOCS_DIR);
const bundle = [];

for (const filePath of mdxFiles) {
  const raw = readFileSync(filePath, 'utf-8');
  const title = getTitleFromFrontmatter(raw);
  const textContent = stripMdxComponents(stripFrontmatter(raw));
  const sections = extractSections(textContent);

  // Derive module name from directory
  const parentDir = basename(dirname(filePath));
  const module = parentDir === 'docs' ? 'dashboard' : parentDir;

  bundle.push({ module, title, sections });
}

writeFileSync(OUTPUT_FILE, JSON.stringify(bundle, null, 2));

const sizeKB = (Buffer.byteLength(JSON.stringify(bundle)) / 1024).toFixed(1);
console.log(`Content bundle generated: ${OUTPUT_FILE}`);
console.log(`  ${bundle.length} pages, ${bundle.reduce((n, p) => n + p.sections.length, 0)} sections, ${sizeKB} KB`);
