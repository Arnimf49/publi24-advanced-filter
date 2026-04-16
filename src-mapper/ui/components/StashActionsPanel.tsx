import {
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { ClassificationProposal, StashedRun } from '../types';

const getProposalLabel = (proposal: ClassificationProposal): string => {
  const suffix = proposal.country ? ` · ${proposal.country.toUpperCase()}` : '';
  return `${proposal.kind.toUpperCase()}${suffix}`;
};

type StashActionsPanelProps = {
  busy: boolean;
  countries: string[];
  run: StashedRun;
  overrideOpen: boolean;
  overrideVerdict: 'escort' | 'bad';
  overrideCountry: string;
  onAccept: () => void;
  onRetry: () => void;
  onDiscard: () => void;
  onToggleOverride: () => void;
  onOverrideSave: () => void;
  onOverrideVerdictChange: (value: 'escort' | 'bad') => void;
  onOverrideCountryChange: (value: string) => void;
};

const StashActionsPanel = ({
  busy,
  countries,
  run,
  overrideOpen,
  overrideVerdict,
  overrideCountry,
  onAccept,
  onRetry,
  onDiscard,
  onToggleOverride,
  onOverrideSave,
  onOverrideVerdictChange,
  onOverrideCountryChange,
}: StashActionsPanelProps): JSX.Element => {
  const proposal = run.proposal;
  const proposalColor = proposal.kind === 'escort' ? 'success' : proposal.kind === 'bad' ? 'error' : 'warning';

  return (
    <Stack spacing={2} className="reviewContent">
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap className="reviewStatusRow">
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip
            label={getProposalLabel(proposal)}
            className="reviewStatusChip"
            color={proposalColor}
          />
          <Chip
            label={`Confidence ${proposal.confidence}`}
            className={`reviewConfidenceChip reviewConfidenceChip--${proposal.confidence >= 80 ? 'high' : proposal.confidence >= 60 ? 'medium' : 'low'}`}
          />
          <Typography variant="caption" color="text.secondary">
            stashed · {new Date(run.stashedAt).toLocaleString()}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap className="reviewButtonRow">
          <Button variant="outlined" size="small" onClick={onToggleOverride} disabled={busy}>
            {overrideOpen ? 'Hide override' : 'Override'}
          </Button>
          <Button variant="outlined" size="small" onClick={onRetry} disabled={busy}>
            Retry
          </Button>
          <Button variant="outlined" size="small" color="warning" onClick={onDiscard} disabled={busy}>
            Discard
          </Button>
          {proposal.kind !== 'review' && (
            <Button variant="contained" size="small" onClick={onAccept} disabled={busy}>
              Accept
            </Button>
          )}
        </Stack>
      </Stack>

      <Typography variant="body1" className="reviewVerdictText" sx={{ px: 0.5 }}>
        {proposal.reasoning}
      </Typography>

      {overrideOpen && (
        <Paper variant="outlined" className="overrideBox">
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Manual override</Typography>

            <FormControl fullWidth size="small">
              <InputLabel id="stash-override-verdict-label">Verdict</InputLabel>
              <Select
                labelId="stash-override-verdict-label"
                value={overrideVerdict}
                label="Verdict"
                onChange={(e) => onOverrideVerdictChange(e.target.value as 'escort' | 'bad')}
              >
                <MenuItem value="escort">Escort</MenuItem>
                <MenuItem value="bad">Bad</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" disabled={overrideVerdict !== 'escort'}>
              <InputLabel id="stash-override-country-label">Country</InputLabel>
              <Select
                labelId="stash-override-country-label"
                value={overrideCountry}
                label="Country"
                onChange={(e) => onOverrideCountryChange(e.target.value)}
              >
                {countries.map((c) => (
                  <MenuItem key={c} value={c}>{c === 'general' ? 'general' : c.toUpperCase()}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="contained" color="secondary" onClick={onOverrideSave} disabled={busy}>
              Save override
            </Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};

export const stashActionsPanel = {
  StashActionsPanel,
};
