# Domain Mapping Utility

This utility helps classify unknown domains collected during tests into two categories:
1. **Bad Domains** - Spam, phone lookup sites, unrelated domains
2. **Escort Listing Sites** - Escort directory sites organized by country

## Usage

### Clean Unknown Domains

Before starting classification, clean up the unknown domains list:

```bash
npm run clean-unknown-domains
```

This will:
- Remove duplicate domains
- Remove domains already in bad-domains.json
- Remove domains already in escort-listing-domains.json
- Sort remaining domains alphabetically

### Start Classification Tool

Start both the server and UI with a single command:

```bash
npm run utils
```

This will:
- Start the Express API server on `http://localhost:3001`
- Start the Vite dev server with the UI on `http://localhost:3000`

Open `http://localhost:3000` in your browser to begin classifying domains.
