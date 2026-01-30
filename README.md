# Athena MCP Server for ChatGPT

A Model Context Protocol (MCP) server that enables ChatGPT to query AWS Athena data.

## Features

- **Deep Research Mode**: `search` and `fetch` tools for ChatGPT's research capabilities
- **Chat Mode**: Direct SQL query execution with Developer Mode
- **Metadata Tools**: Browse databases, tables, and schemas

## Tech Stack

- **Runtime**: Bun
- **Linting/Formatting**: Biome
- **AWS SDK**: @aws-sdk/client-athena v3
- **MCP SDK**: @modelcontextprotocol/sdk

## Prerequisites

- Bun 1.3+
- AWS Account with Athena access
- AWS credentials configured

## Installation

```bash
bun install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:

- `ATHENA_OUTPUT_LOCATION` - S3 bucket for query results (e.g., `s3://your-bucket/athena-results/`)

Optional variables:

- `AWS_REGION` - AWS region (default: `eu-west-1`)
- `ATHENA_WORKGROUP` - Athena workgroup (default: `primary`)
- `ATHENA_DATABASE` - Default database (default: `default`)
- `PORT` - Server port (default: `3000`)

## Usage

### Development

```bash
bun run dev
```

### Production

```bash
bun run build
bun run start
```

### Linting & Formatting

```bash
bun run lint      # Check for issues
bun run format    # Format code
bun run check     # Check and fix all issues
```

## Deployment with Coolify

1. Create a new service in Coolify
2. Select "Docker Compose" as build type
3. Set environment variables in Coolify:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `ATHENA_OUTPUT_LOCATION`
   - (optional) `AWS_REGION`, `ATHENA_WORKGROUP`, `ATHENA_DATABASE`
4. Deploy

The service will be available at your Coolify domain on port 3000.

## Connecting to ChatGPT

1. Deploy the server (Coolify or other hosting)
2. In ChatGPT, go to **Settings > Connectors**
3. Click **Add custom connector**
4. Enter your server URL with `/mcp` endpoint (e.g., `https://your-domain.com/mcp`)
5. Enable **Developer Mode** for Chat mode access

## Available Tools

| Tool             | Description                              | Mode          |
| ---------------- | ---------------------------------------- | ------------- |
| `search`         | Search past queries or execute new SQL   | Deep Research |
| `fetch`          | Retrieve full results by query ID        | Deep Research |
| `query`          | Execute SQL and get immediate results    | Chat          |
| `list_databases` | List all Athena databases                | Chat          |
| `list_tables`    | List tables in a database                | Chat          |
| `describe_table` | Get table schema                         | Chat          |

## API Endpoints

- `POST /mcp` - MCP protocol endpoint
- `GET /mcp` - SSE stream endpoint
- `DELETE /mcp` - Session cleanup
- `GET /health` - Health check

## Architecture

```
src/
├── config/          # Environment configuration
├── services/        # AWS Athena service layer
├── tools/           # MCP tool implementations
├── types/           # TypeScript type definitions
├── server.ts        # MCP server setup
└── index.ts         # Express HTTP server
```

## License

MIT
