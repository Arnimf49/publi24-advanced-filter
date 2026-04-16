import { Box, Typography } from '@mui/material';
import type { AgentEvent } from '../types';

export const formatTokenCount = (n: number): string => {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(2)}M`;
  }

  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(2)}K`;
  }

  return String(n);
};

export const formatTokenUsage = (usage: { input: number; cachedInput: number; output: number }): string => {
  const parts = [`i${formatTokenCount(usage.input)}`];

  if (usage.cachedInput > 0) {
    parts.push(`c${formatTokenCount(usage.cachedInput)}`);
  }

  parts.push(`o${formatTokenCount(usage.output)}`);

  return parts.join(' | ');
};

export const formatDuration = (ms: number): string => {
  if (ms >= 60_000) {
    return `${(ms / 60_000).toFixed(1)}m`;
  }

  return `${(ms / 1_000).toFixed(1)}s`;
};

export const getTokenUsageSummary = (
  events: AgentEvent[],
  scope: 'all' | 'main',
): { input: number; cachedInput: number; output: number; total: number } =>
  events.reduce((accumulator, event) => {
    if (!event.tokenUsage) {
      return accumulator;
    }

    if (scope === 'main' && event.tokenUsage.scope === 'sub') {
      return accumulator;
    }

    return {
      input: accumulator.input + event.tokenUsage.input,
      cachedInput: accumulator.cachedInput + event.tokenUsage.cachedInput,
      output: accumulator.output + event.tokenUsage.output,
      total: accumulator.total + event.tokenUsage.total,
    };
  }, { input: 0, cachedInput: 0, output: 0, total: 0 });

export const getLatestMainContextSize = (events: AgentEvent[]): number => {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const tokenUsage = events[index]?.tokenUsage;
    if (!tokenUsage) {
      continue;
    }

    if (tokenUsage.scope === 'sub') {
      continue;
    }

    return tokenUsage.input;
  }

  return 0;
};

type TokenStatsProps = {
  events: AgentEvent[];
  durationMs?: number;
  className?: string;
};

export const TokenStats = ({ events, durationMs, className }: TokenStatsProps): JSX.Element | null => {
  const usage = getTokenUsageSummary(events, 'all');
  const ctxSize = getLatestMainContextSize(events);
  const hasTokens = usage.total > 0;

  if (!hasTokens && durationMs === undefined) {
    return null;
  }

  const leftParts: string[] = [];

  if (ctxSize > 0) {
    leftParts.push(`ctx ${formatTokenCount(ctxSize)}`);
  }

  if (durationMs !== undefined) {
    leftParts.push(formatDuration(durationMs));
  }

  return (
    <Box className={className}>
      <Typography variant="caption" color="text.secondary">
        {leftParts.join(' · ')}
      </Typography>
      {hasTokens && (
        <Typography variant="caption" color="text.secondary">
          {formatTokenUsage(usage)}
        </Typography>
      )}
    </Box>
  );
};

export const tokenStats = { TokenStats };
