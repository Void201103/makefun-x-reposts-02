// makefun-x-reposts-02 entry (Node 22, standard library only).
//
// The entry itself is the X posts named in POSTS.json: posts of our own on X,
// each quoting or replying directly to a different one of make.fun's newest
// posts on x.com/makefunai, with make.fun (or @makefunai) and our play code
// in each post's own words. The house reads their reposts, quotes and likes
// from X and scores them; nothing this program writes about the posts counts.
//
// So this program does one small job: read POSTS.json from the repository
// root, check it has the shape the gate expects (an object with a "posts"
// list of 1 to 15 X post addresses), and copy it to the output directory,
// where the gate reads it. A file that does not parse, or is not that shape,
// stops the run with an error instead of handing the gate a broken file.
//
// Run it locally the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const POST_URL = /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[^/]+\/status\/\d+$/;

function fail(message: string): never {
  console.error(`POSTS.json: ${message}`);
  process.exit(1);
}

const source = join(BOT_DIR, 'POSTS.json');
let parsed: unknown;
try {
  parsed = JSON.parse(readFileSync(source, 'utf8'));
} catch (err) {
  fail(`could not be read or parsed: ${(err as Error).message}`);
}

const posts = (parsed as { posts?: unknown }).posts;
if (!Array.isArray(posts)) fail('must be an object with a "posts" list.');
if (posts.length < 1 || posts.length > 15) {
  fail(`must name 1 to 15 posts, got ${posts.length}.`);
}
for (const post of posts) {
  if (typeof post !== 'string' || !POST_URL.test(post.split(/[?#]/)[0])) {
    fail(`not an X post address: ${String(post)}`);
  }
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(source, join(OUTPUT_DIR, 'POSTS.json'));
} catch (err) {
  console.error(`POSTS.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
