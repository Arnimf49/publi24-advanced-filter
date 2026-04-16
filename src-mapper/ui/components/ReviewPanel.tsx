import {
  Alert,
  Button,
  Chip,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { ClassificationProposal, CurrentRunState } from '../types';
import { TokenStats } from './TokenStats';

const getProposalLabel = (current: CurrentRunState['proposal']): string => {
  if (!current) {
    return '';
  }

  const escortSuffix =
    current.kind === 'escort' && current.contactAccess === 'contact_gated'
      ? ' · CONTACT GATED'
      : current.kind === 'escort' && current.contactAccess === 'shared_venue_phone'
        ? ' · SHARED VENUE PHONE'
        : '';
  return `${current.kind.toUpperCase()}${current.country ? ` · ${current.country.toUpperCase()}` : ''}${escortSuffix}`;
};

const getSubmitterLabel = (submitter: ClassificationProposal['submitter']): string => {
  switch (submitter) {
    case 'triage_bad': return 'triage · bad';
    case 'triage_good': return 'triage · good';
    case 'triage_access_gate': return 'triage · gate';
    case 'main_agent': return 'main agent';
    default: return 'unknown';
  }
};

const getConfidenceTone = (confidence: number): 'high' | 'medium' | 'low' => {
  if (confidence >= 80) {
    return 'high';
  }

  if (confidence >= 60) {
    return 'medium';
  }

  return 'low';
};

type ReviewPanelProps = {
  busy: boolean;
  countries: string[];
  current: CurrentRunState;
  manualCountry: string;
  manualVerdict: 'escort' | 'bad' | '';
  onAccept: () => void;
  onRetry: () => void;
  onSkip: () => void;
  onManualCountryChange: (value: string) => void;
  onManualVerdictChange: (value: 'escort' | 'bad' | '') => void;
  onOverrideSave: () => void;
  skipLabel?: string;
};

const ReviewPanel = ({
  busy,
  countries,
  current,
  manualCountry,
  manualVerdict,
  onAccept,
  onRetry,
  onSkip,
  onManualCountryChange,
  onManualVerdictChange,
  onOverrideSave,
  skipLabel = 'Skip',
}: ReviewPanelProps): JSX.Element => {
  const proposal = current.proposal;
  if (!proposal) {
    return (
      <Typography variant="body2" color="text.secondary">
        Waiting for the AI proposal.
      </Typography>
    );
  }

  const proposalLabel = getProposalLabel(proposal);
  const confidenceTone = getConfidenceTone(proposal.confidence);

  const overrideEnabled = manualVerdict === 'bad' || (manualVerdict === 'escort' && Boolean(manualCountry));

  return (
    <Stack spacing={2} className="reviewContent">
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap className="reviewStatusRow">
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip
            label={proposalLabel}
            className="reviewStatusChip"
            color={proposal.kind === 'escort' ? 'success' : proposal.kind === 'bad' ? 'error' : 'warning'}
          />
          <Chip
            label={`Confidence ${proposal.confidence}`}
            className={`reviewConfidenceChip reviewConfidenceChip--${confidenceTone}`}
          />
          {proposal.submitter && (
            <Chip
              label={getSubmitterLabel(proposal.submitter)}
              variant="outlined"
              className="reviewSubmitterChip"
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap className="reviewButtonRow">
          <Button
            variant="outlined"
            size="small"
            onClick={onRetry}
            disabled={busy}
          >
            Retry
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onSkip}
            disabled={busy}
          >
            {skipLabel}
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={onAccept}
            disabled={busy || proposal.kind === 'review'}
          >
            Accept
          </Button>
        </Stack>
      </Stack>

      <Alert severity={proposal.kind === 'review' ? 'warning' : 'info'} className="reviewAlert">
        <Stack spacing={0.75}>
          {proposal.kind === 'escort' && proposal.phoneNumbers.length > 0 && (
            <Typography variant="body2" className="reviewVerdictText">
              Phones found: {proposal.phoneNumbers.join(', ')}
            </Typography>
          )}
          {proposal.kind === 'escort' && proposal.contactAccess === 'contact_gated' && (
            <Typography variant="body2" className="reviewVerdictText">
              Contact access: gated (login / subscription / captcha / verification)
            </Typography>
          )}
          {proposal.kind === 'escort' && proposal.contactAccess === 'shared_venue_phone' && (
            <Typography variant="body2" className="reviewVerdictText">
              Contact access: shared venue phone
            </Typography>
          )}
          <Typography variant="body1" className="reviewVerdictText">
            {proposal.reasoning}
          </Typography>
        </Stack>
      </Alert>

      <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            displayEmpty
            value={manualVerdict}
            onChange={(event) => onManualVerdictChange(event.target.value as 'escort' | 'bad' | '')}
            renderValue={(value) => (value as string) === '' ? <em style={{ opacity: 0.5 }}>Type</em> : (value === 'escort' ? 'Escort' : 'Bad')}
            sx={{ height: 32 }}
          >
            <MenuItem value="escort">Escort</MenuItem>
            <MenuItem value="bad">Bad</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 110 }} disabled={manualVerdict !== 'escort'}>
          <Select
            displayEmpty
            value={manualVerdict === 'escort' ? manualCountry : ''}
            onChange={(event) => onManualCountryChange(event.target.value)}
            renderValue={(value) => value === '' ? <em style={{ opacity: 0.5 }}>Country</em> : (value === 'general' ? 'general' : value.toUpperCase())}
            sx={{ height: 32 }}
          >
            {countries.map((country) => (
              <MenuItem key={country} value={country}>
                {country === 'general' ? 'general' : country.toUpperCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={onOverrideSave}
          disabled={busy || !overrideEnabled}
          sx={{ height: 32 }}
        >
          Override
        </Button>
      </Stack>

      <TokenStats events={current.events} durationMs={proposal.durationMs} className="eventLogFooter" />
    </Stack>
  );
};

export const reviewPanel = {
  ReviewPanel,
};
