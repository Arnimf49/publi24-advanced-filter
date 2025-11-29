import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  Alert,
  Autocomplete,
  TextField,
} from '@mui/material';

const API_BASE = 'http://localhost:3001';

function App() {
  const [domain, setDomain] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const fetchNextDomain = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/api/domains`);
      const data = await response.json();

      if (data.done) {
        setDone(true);
        setDomain(null);
        setRemaining(0);
      } else {
        setDomain(data.domain);
        setRemaining(data.remaining);
        setCountries(data.countries);
        setSelectedCountry(data.suggestedCountry || '');
        setDone(false);
      }
    } catch (err) {
      setError('Failed to fetch domain. Make sure the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextDomain();
  }, []);

  const handleBadDomain = async () => {
    if (!domain) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/map-bad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchNextDomain();
      }
    } catch (err) {
      setError('Failed to mark domain as bad.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEscortDomain = async () => {
    if (!domain || !selectedCountry) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/map-escort`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, country: selectedCountry }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchNextDomain();
      }
    } catch (err) {
      setError('Failed to mark domain as escort site.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAIPrompt = async () => {
    if (!domain) return;

    const prompt = `Analyze https://${domain} and provide the following information, short and no comments:
- is escort listing: YES / NO
- top 2 visitors: (for this provide country code and estimated percentage)
- language:`;

    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  if (done) {
    return (
      <Box className="container">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            ✅ All Done!
          </Typography>
          <Typography variant="body1">
            All domains have been classified.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="container">
      <Box className="top-section">
        <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ flex: 1, textAlign: 'right', pr: 2 }}>
              <Typography variant="h6" gutterBottom>
                Domain: {domain ? (
                  <strong>
                    <a
                      href={`https://${domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'inherit', textDecoration: 'underline' }}
                    >
                      {domain}
                    </a>
                  </strong>
                ) : 'Loading...'}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Remaining: {remaining}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                color="error"
                onClick={handleBadDomain}
                disabled={loading || !domain}
              >
                Bad Domain
              </Button>

              <Autocomplete
                value={selectedCountry}
                onChange={(event, newValue) => setSelectedCountry(newValue || '')}
                options={countries}
                getOptionLabel={(option) => option === 'general' ? 'General (Global)' : option.toUpperCase()}
                sx={{ minWidth: 200 }}
                disabled={loading}
                size="small"
                renderInput={(params) => <TextField {...params} label="Country" size="small" />}
              />

              <Button
                variant="contained"
                color="success"
                onClick={handleEscortDomain}
                disabled={loading || !domain || !selectedCountry}
              >
                Escort Domain
              </Button>

              <Button
                variant="outlined"
                color="info"
                onClick={handleCopyAIPrompt}
                disabled={loading || !domain}
                size="small"
              >
                {copiedPrompt ? '✓ Copied' : 'AI Prompt'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Box className="bottom-section">
        {domain && (
          <iframe
            src={`https://${domain}`}
            title="Domain Preview"
            className="domain-iframe"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-storage-access-by-user-activation"
          />
        )}
      </Box>
    </Box>
  );
}

export default App;
