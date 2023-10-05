// Usage:
// 
//   $ git diff --name-only HEAD~1 | node ./scripts/post-api-from-paths
//
//   $ cat << EOF | node ./scripts/post-api-from-paths
//   > api/openapi.yaml
//   > api/components.yaml
//   > EOF
//
// If placing in `./scripts/postman-api-from-paths`, make sure to:
// npm install --prefix ./scripts/postman-api-from-paths

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd, env, exit, stdin } from 'node:process';
import { parse } from 'ini';

const rootDir = env.POSTMAN_API_ROOT || join(cwd(), '.postman');

let indexFile;
try {
  indexFile = readFileSync(join(rootDir, 'api'), 'utf8');
} catch (err) {
  if (err.code === 'ENOENT') {
    console.error(`No Postman \`api\` file found at: ${rootDir}`);
    console.error('Note: Try setting the `POSTMAN_API_ROOT` environment variable to the directory containing the Postman API files.');
    exit(1);
  }
  throw err;
}

const index = parse(indexFile);

const entries = index?.apis?.map((apiSubRecord) => {
  try {
    const apiId = JSON.parse(apiSubRecord)?.apiId;
    const apiPath = join(rootDir, `api_${apiId}`);
    const apiRecord = parse(readFileSync(apiPath, 'utf8'));
    return [
      apiId,
      apiRecord.config.relations.apiDefinition.files.map((fileRecord) => {
        const file = JSON.parse(fileRecord);
        return file.path;
      })
    ];
  } catch (err) {
    console.warn(err);
    return false;
  }
}).filter(Boolean).reduce((acc, [apiId, paths]) => {
  for (const path of paths) {
    if (!acc[path]) {
      acc[path] = [];
    }
    acc[path].push(apiId);
  }

  return acc;
}, {});

stdin.setEncoding('utf8');
stdin.resume();

const chunks = [];
for await (const chunk of stdin) {
  chunks.push(chunk);
}

const paths = chunks.join('').split('\n');
const apiIds = paths.reduce((acc, path) => {
  const apiIds = entries[path];
  if (apiIds) {
    acc.push(...apiIds);
  }
  return acc;
}, []);
const uniqueIds = [...new Set(apiIds)];

for (const id of uniqueIds) {
  console.log(id);
}
