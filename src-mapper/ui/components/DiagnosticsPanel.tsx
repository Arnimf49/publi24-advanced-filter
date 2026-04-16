import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import type { CurrentRunState, DiagnosticsPayload } from '../types';

type DiagnosticsPanelProps = {
  copyInProgress: boolean;
  current: CurrentRunState;
  diagnostics: DiagnosticsPayload | null;
  diagnosticsError: string | null;
  diagnosticsLoading: boolean;
  onCopy: () => void;
};

const DiagnosticsPanel = ({
  copyInProgress,
  current,
  diagnostics,
  diagnosticsError,
  diagnosticsLoading,
  onCopy,
}: DiagnosticsPanelProps): JSX.Element => {
  return (
    <Stack spacing={2} className="reviewContent">
      <Box className="diagnosticsHeader">
        <Typography variant="body2" color="text.secondary">
          Current page diagnostics from Playwright.
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={onCopy}
          disabled={copyInProgress || diagnosticsLoading}
        >
          {copyInProgress ? 'Copying...' : 'Copy diagnostics'}
        </Button>
      </Box>

      {diagnosticsLoading && (
        <Typography variant="body2" color="text.secondary">
          Loading diagnostics...
        </Typography>
      )}

      {diagnosticsError && (
        <Alert severity="error">
          {diagnosticsError}
        </Alert>
      )}

      {!diagnostics && !diagnosticsLoading && !diagnosticsError && current.page && (
        <Typography variant="body2" color="text.secondary">
          Diagnostics will appear once the current page snapshot is available.
        </Typography>
      )}

      {diagnostics && (
        <>
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', wordBreak: 'break-all' }}>
              {diagnostics.url}
            </Typography>
            {diagnostics.title && (
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {diagnostics.title}
              </Typography>
            )}
          </Box>

          <Accordion>
            <AccordionSummary expandIcon={<span>+</span>}>
              <Typography>Structured Text</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <pre className="snapshotBlock">{diagnostics.structuredText || '(empty)'}</pre>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<span>+</span>}>
              <Typography>Actionable elements</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <pre className="snapshotBlock">
                {JSON.stringify(diagnostics.actionableElements, null, 2)}
              </pre>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<span>+</span>}>
              <Typography>Current HTML</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <pre className="snapshotBlock">{diagnostics.html}</pre>
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </Stack>
  );
};

export const diagnosticsPanel = {
  DiagnosticsPanel,
};
