import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { mapperClient } from '../mapperClient';
import type { ClassificationProposal, StashListItem } from '../types';

type StashPanelProps = {
  stashedCount: number;
  onOpen: (domain: string) => void;
};

const proposalColor = (kind: ClassificationProposal['kind']): 'success' | 'error' | 'warning' =>
  kind === 'escort' ? 'success' : kind === 'bad' ? 'error' : 'warning';

const relativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) {
    return 'just now';
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.floor(hours / 24)}d ago`;
};

const StashPanel = ({ stashedCount, onOpen }: StashPanelProps): JSX.Element => {
  const [list, setList] = useState<StashListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevCount = useRef(stashedCount);

  const loadList = async (): Promise<void> => {
    try {
      setLoading(true);
      const items = await mapperClient.fetchStashList();
      setList(items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadList();
  }, []);

  useEffect(() => {
    if (stashedCount !== prevCount.current) {
      prevCount.current = stashedCount;
      void loadList();
    }
  }, [stashedCount]);

  return (
    <Box className="stashPanel">
      <Box className="stashPanelHeader">
        <Typography variant="subtitle2" color="text.secondary">
          Stash
        </Typography>
        {loading && <CircularProgress size={12} />}
      </Box>

      <Divider />

      {error && (
        <Typography variant="caption" color="error" sx={{ px: 1.5, pt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}

      <Box className="stashList">
        {list.length === 0 && !loading && (
          <Typography variant="caption" color="text.secondary" sx={{ px: 1.5, pt: 1.5, display: 'block' }}>
            No stashed runs.
          </Typography>
        )}

        {list.map((item) => (
          <Box
            key={item.domain}
            className="stashItem"
            onClick={() => onOpen(item.domain)}
          >
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0, fontWeight: 500 }}>
                {item.domain}
              </Typography>
              <Chip
                label={item.proposal.kind.toUpperCase()}
                color={proposalColor(item.proposal.kind)}
                size="small"
                sx={{ flexShrink: 0, height: 18, fontSize: '0.65rem' }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {relativeTime(item.stashedAt)} · {item.proposal.confidence}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export const stashPanel = {
  StashPanel,
};


