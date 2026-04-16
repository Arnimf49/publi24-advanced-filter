import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { mapperClient } from '../mapperClient';

type DiagnosticsModalProps = {
  diagnostics: {
    url: string;
    title: string;
    summary: string;
    sentContext?: string;
    accessibilityText: string;
    actionableElements: Array<{
      id: string;
      element?: string;
      role?: string;
      tagName?: string;
      name: string;
      contextHint?: string;
      href: string | null;
      actionabilityReasons?: string[];
      isLikelyEntryGate?: boolean;
    }>;
    rawHtml: string;
  } | null;
  open: boolean;
  onClose: () => void;
};

const DiagnosticsModal = ({ diagnostics, open, onClose }: DiagnosticsModalProps): JSX.Element => {
  const [copying, setCopying] = useState(false);
  const [opening, setOpening] = useState(false);

  if (!diagnostics) {
    return <></>;
  }

  const handleOpen = async (): Promise<void> => {
    setOpening(true);
    try {
      await mapperClient.navigateTo(diagnostics.url);
    } finally {
      setOpening(false);
    }
  };

  const handleCopy = async (): Promise<void> => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
    } finally {
      setCopying(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Event Diagnostics</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button variant="outlined" size="small" onClick={handleCopy} disabled={copying}>
              {copying ? 'Copying...' : 'Copy'}
            </Button>
            <IconButton onClick={onClose} size="small">
              ✕
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box
              component="table"
              sx={{
                width: '100%',
                borderCollapse: 'collapse',
                '& th': {
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  color: 'text.secondary',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  pb: 0.5,
                  pr: 2,
                  whiteSpace: 'nowrap',
                },
                '& td': {
                  fontSize: '0.875rem',
                  pt: 0.75,
                  pr: 2,
                  wordBreak: 'break-all',
                  verticalAlign: 'top',
                },
              }}
            >
              <thead>
                <tr>
                  <Box component="th">URL</Box>
                  <Box component="th">Title</Box>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Box component="td">
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <span>{diagnostics.url}</span>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={opening}
                        onClick={handleOpen}
                        sx={{ flexShrink: 0, minWidth: 'unset', py: 0, px: 1, fontSize: '0.7rem' }}
                      >
                        {opening ? '…' : 'Open'}
                      </Button>
                    </Box>
                  </Box>
                  <Box component="td">{diagnostics.title || '(none)'}</Box>
                </tr>
              </tbody>
            </Box>
          </Box>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<span>+</span>}>
              <Typography>Structured Text</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <pre className="snapshotBlock">
                {diagnostics.summary || '(empty)'}
              </pre>
            </AccordionDetails>
          </Accordion>

          {diagnostics.sentContext && (
            <Accordion>
              <AccordionSummary expandIcon={<span>+</span>}>
                <Typography>Sent to AI</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <pre className="snapshotBlock">
                  {diagnostics.sentContext}
                </pre>
              </AccordionDetails>
            </Accordion>
          )}

          <Accordion>
            <AccordionSummary expandIcon={<span>+</span>}>
              <Typography>Accessibility Text</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <pre className="snapshotBlock">
                {diagnostics.accessibilityText || '(empty)'}
              </pre>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<span>+</span>}>
              <Typography>Actionable Elements ({diagnostics.actionableElements.length})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <pre className="snapshotBlock">
                {JSON.stringify(diagnostics.actionableElements, null, 2)}
              </pre>
            </AccordionDetails>
          </Accordion>

          {diagnostics.rawHtml && (
            <Accordion>
              <AccordionSummary expandIcon={<span>+</span>}>
                <Typography>Raw HTML</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <pre className="snapshotBlock">
                  {diagnostics.rawHtml}
                </pre>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export const diagnosticsModal = {
  DiagnosticsModal,
};
