# Domain Mapping Utility

This utility now runs as an **AI-assisted mapper**:
1. A TypeScript Express server owns the queue and JSON save logic
2. Playwright opens one domain at a time in a visible browser window
3. OpenAI makes navigation and classification decisions from the page summary
4. The UI streams each step live and lets you accept, override, or skip the result

## Usage

Start both the server and UI with a single command:

```bash
OPENAI_API_KEY=your_key_here npm run domain-mapper
```

This will:
- Start the Express API server on `http://localhost:3001`
- Start the Vite dev server with the UI on `http://localhost:3000`

Open `http://localhost:3000` and press **Start**.

Optional environment variables:
- `DOMAIN_MAPPER_MODEL` (default: `gpt-4o-mini`)
- `DOMAIN_MAPPER_MAX_HOPS` (default: `4`)
- `DOMAIN_MAPPER_CONFIDENCE_THRESHOLD` (default: `70`)
- `DOMAIN_MAPPER_HEADLESS` (`true` or `false`, default: `false`)
