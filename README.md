# postman-api-from-paths

Parse config files associated with Postman API git integration and find the API IDs for associated file paths.

## Installation

Either copy/paste files or use as a git submodule.

```bash
git submodule add https://github.com/kevinswiber/postman-api-from-paths scripts/postman-api-from-paths
```

If placing in `./scripts/postman-api-from-paths`, make sure to:

```bash
npm install --prefix ./scripts/postman-api-from-paths
```

## Usage

```bash
git diff --name-only HEAD~1 | node ./scripts/post-api-from-paths
```

```bash
cat << EOF | node ./scripts/post-api-from-paths
api/openapi.yaml
api/components.yaml
EOF
```

## License

MIT
