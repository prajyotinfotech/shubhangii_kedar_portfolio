#!/usr/bin/env node

/**
 * Publish a blog post to Dev.to
 *
 * Usage:
 *   DEV_TO_API_KEY=your_key node blog/publish.js blog/posts/001-vercel-cdn-cache-bust.md
 *
 * Get your API key at: https://dev.to/settings/extensions
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

const API_KEY = process.env.DEV_TO_API_KEY
const postFile = process.argv[2]

if (!API_KEY) {
  console.error('Missing DEV_TO_API_KEY environment variable.')
  console.error('Get it at: https://dev.to/settings/extensions')
  process.exit(1)
}

if (!postFile) {
  console.error('Usage: node blog/publish.js blog/posts/your-post.md')
  process.exit(1)
}

const filePath = path.resolve(postFile)
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`)
  process.exit(1)
}

const raw = fs.readFileSync(filePath, 'utf8')

// Parse frontmatter
const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
if (!fmMatch) {
  console.error('Could not parse frontmatter. Make sure the file starts with ---')
  process.exit(1)
}

const frontmatter = fmMatch[1]
const body = fmMatch[2].trim()

const get = (key) => {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?`, 'm'))
  return match ? match[1].trim() : ''
}

const getArray = (key) => {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*\\[([^\\]]+)\\]`, 'm'))
  if (!match) return []
  return match[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, ''))
}

const title = get('title')
const description = get('description')
const tags = getArray('tags')
const cover_image = get('cover_image') || undefined
const canonical_url = get('canonical_url') || undefined
const series = get('series') || undefined
const published = frontmatter.includes('published: true')

if (!title) {
  console.error('Post is missing a title in frontmatter.')
  process.exit(1)
}

const payload = JSON.stringify({
  article: {
    title,
    body_markdown: body,
    published,
    description,
    tags,
    ...(cover_image && { cover_image }),
    ...(canonical_url && { canonical_url }),
    ...(series && { series }),
  }
})

console.log(`Publishing: "${title}"`)
console.log(`Tags: ${tags.join(', ')}`)
console.log(`Published: ${published}`)

const options = {
  hostname: 'dev.to',
  path: '/api/articles',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'api-key': API_KEY,
    'Content-Length': Buffer.byteLength(payload),
  }
}

const req = https.request(options, (res) => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => {
    const result = JSON.parse(data)
    if (res.statusCode === 201) {
      console.log('\nPublished successfully!')
      console.log(`URL: https://dev.to/${result.path}`)
      console.log(`ID:  ${result.id}`)
    } else {
      console.error(`\nFailed (${res.statusCode}):`, result.error || data)
      process.exit(1)
    }
  })
})

req.on('error', (e) => {
  console.error('Request error:', e.message)
  process.exit(1)
})

req.write(payload)
req.end()
