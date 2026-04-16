import { Accordion, AccordionDetails, AccordionSummary, Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import type { AgentEvent, CurrentRunState } from '../types';
import { diagnosticsModal } from './DiagnosticsModal';
import { formatTokenUsage, TokenStats } from './TokenStats';

const { DiagnosticsModal } = diagnosticsModal;

const eventToneClassByType = {
  ai: 'eventToneAi',
  status: 'eventToneInfo',
  tool: 'eventToneWarning',
  decision: 'eventToneSuccess',
  error: 'eventToneError',
} as const;

type EventLogPanelProps = {
  current: CurrentRunState | null;
};

type DisplayEvent = AgentEvent & {
  children: AgentEvent[];
};

const getDisplayedEvents = (current: CurrentRunState): DisplayEvent[] => {
  const eventsById = new Map<string, AgentEvent>();
  const childrenByParentId = new Map<string, AgentEvent[]>();

  for (const event of current.events) {
    eventsById.set(event.id, event);
  }

  for (const event of current.events) {
    if (event.parentId) {
      const siblings = childrenByParentId.get(event.parentId) ?? [];
      if (!siblings.some((s) => s.id === event.id)) {
        siblings.push(event);
        childrenByParentId.set(event.parentId, siblings);
      }
    }
  }

  const seen = new Set<string>();
  const result: DisplayEvent[] = [];

  for (const event of current.events) {
    if (event.parentId) {
      continue;
    }

    if (seen.has(event.id)) {
      const existing = result.find((e) => e.id === event.id);
      if (existing) {
        Object.assign(existing, event);
      }
      continue;
    }

    seen.add(event.id);
    result.push({ ...event, children: childrenByParentId.get(event.id) ?? [] });
  }

  return result;
};

const parseResultReasoning = (result: string | undefined): string | null => {
  if (!result) {
    return null;
  }

  try {
    const parsed = JSON.parse(result) as Record<string, unknown>;
    if (typeof parsed.reasoning === 'string' && parsed.reasoning.trim()) {
      return parsed.reasoning.trim();
    }
  } catch {
    return null;
  }

  return null;
};

const formatElapsed = (createdAt: string, completedAt?: string): string | null => {
  if (!completedAt) {
    return null;
  }

  const ms = new Date(completedAt).getTime() - new Date(createdAt).getTime();
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
};

const ResultsModal = ({ result, open, onClose }: { result: string | null; open: boolean; onClose: () => void }): JSX.Element => {
  if (!result) {
    return <></>;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Tool Results</Typography>
          <IconButton onClick={onClose} size="small">✕</IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <pre className="snapshotBlock">{result}</pre>
      </DialogContent>
    </Dialog>
  );
};

const ChildEventCard = ({
  child,
  onShowDiagnostics,
  onShowResult,
}: {
  child: AgentEvent;
  onShowDiagnostics: (d: AgentEvent['diagnostics']) => void;
  onShowResult: (r: string) => void;
}): JSX.Element => {
  const elapsed = formatElapsed(child.createdAt, child.completedAt);

  return (
    <Box className="eventCard" sx={{ backgroundColor: 'action.hover' }}>
      <Box className={`eventTone ${getEventToneClass(child)}`} />
      <Box className="eventMeta">
        <Box className="eventMetaLeft">
          {child.state === 'running' && <CircularProgress size={10} thickness={6} color="inherit" />}
          <Typography variant="caption" color="text.secondary">
            {child.type === 'tool' ? child.message : child.type.toUpperCase()}
          </Typography>
        </Box>
        <Box className="eventMetaRight">
          {elapsed && (
            <Typography variant="caption" color="text.secondary">
              {elapsed}
            </Typography>
          )}
          {child.tokenUsage && (
            <Typography variant="caption" color="text.secondary">
              {formatTokenUsage(child.tokenUsage)}
            </Typography>
          )}
        </Box>
      </Box>
      {child.request && (
        <Typography variant="caption" color="text.secondary" className="eventMessage">
          {child.request}
        </Typography>
      )}
      {child.type === 'ai' && (
        <Typography variant="body2" className="eventMessage">
          {child.message}
        </Typography>
      )}
      {child.state !== 'running' && (child.diagnostics || child.result) && (
        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
          {child.diagnostics && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onShowDiagnostics(child.diagnostics)}
              sx={{ fontSize: '0.75rem', padding: '2px 8px', minWidth: 'auto' }}
            >
              Diagnostics
            </Button>
          )}
          {child.result && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onShowResult(child.result ?? '')}
              sx={{ fontSize: '0.75rem', padding: '2px 8px', minWidth: 'auto' }}
            >
              Results
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

const SUB_AGENT_TOOLS = new Set(['AI TOOL - analyze_page', 'AI TOOL - get_actionable_elements']);

const getEventToneClass = (event: DisplayEvent | AgentEvent): string => {
  if (event.type === 'tool' && event.state === 'failed') {
    return 'eventToneError';
  }

  if (event.type === 'tool' && typeof event.message === 'string' && event.message.startsWith('AI TOOL -')) {
    return 'eventToneAiTool';
  }

  return eventToneClassByType[event.type];
};

const parseErrorMessage = (result: string | undefined): string | null => {
  if (!result) {
    return null;
  }

  try {
    const parsed = JSON.parse(result) as Record<string, unknown>;
    if (parsed.ok === false && typeof parsed.message === 'string') {
      return parsed.message;
    }
  } catch {
    return null;
  }

  return null;
};

const EventCard = ({
  event,
  onShowDiagnostics,
  onShowResult,
}: {
  event: DisplayEvent;
  onShowDiagnostics: (d: AgentEvent['diagnostics']) => void;
  onShowResult: (r: string) => void;
}): JSX.Element => {
  const reasoning = event.type === 'tool' ? parseResultReasoning(event.result) : (event.type === 'decision' ? parseResultReasoning(event.result) : null);
  const errorMessage = event.type === 'tool' && event.state === 'failed' ? parseErrorMessage(event.result) : null;
  const hasChildren = event.children.length > 0;
  const isSubAgentTool = event.type === 'tool' && SUB_AGENT_TOOLS.has(event.message);
  const showAccordion = hasChildren || (isSubAgentTool && event.state === 'running');
  const elapsed = formatElapsed(event.createdAt, event.completedAt);

  return (
    <Box className="eventCard">
      <Box className={`eventTone ${getEventToneClass(event)}`} />
      <Box className="eventMeta">
        <Box className="eventMetaLeft">
          {event.state === 'running' && <CircularProgress size={12} thickness={6} color="inherit" />}
          <Typography variant="caption" color="text.secondary">
            {event.type === 'tool' ? event.message : event.type.toUpperCase()}
          </Typography>
        </Box>
        <Box className="eventMetaRight">
          {elapsed && (
            <Typography variant="caption" color="text.secondary">
              {elapsed}
            </Typography>
          )}
          {event.tokenUsage && (
            <Typography variant="caption" color="text.secondary">
              {formatTokenUsage(event.tokenUsage)}
            </Typography>
          )}
        </Box>
      </Box>
      {event.request && (
        <Typography variant="caption" color="text.secondary" className="eventMessage">
          {event.request}
        </Typography>
      )}
      {event.reasoning && (
        <>
          <Typography variant="caption" color="text.secondary" className="eventMessage" sx={{ fontWeight: 600, mt: 0.5 }}>
            Reason
          </Typography>
          <Typography variant="body2" className="eventMessage">
            {event.reasoning}
          </Typography>
        </>
      )}
      {(errorMessage || reasoning) && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5, pl: '8px' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Result summary
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {event.state !== 'running' && event.diagnostics && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onShowDiagnostics(event.diagnostics)}
                  sx={{ fontSize: '0.75rem', padding: '2px 8px', minWidth: 'auto' }}
                >
                  Diagnostics
                </Button>
              )}
              {event.state !== 'running' && event.result && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onShowResult(event.result ?? '')}
                  sx={{ fontSize: '0.75rem', padding: '2px 8px', minWidth: 'auto' }}
                >
                  Results
                </Button>
              )}
            </Box>
          </Box>
          {errorMessage && (
            <Typography variant="body2" className="eventMessage" color="error.main">
              {errorMessage}
            </Typography>
          )}
          {reasoning && (
            <Typography variant="body2" className="eventMessage" sx={{ whiteSpace: 'pre-line' }}>
              {reasoning}
            </Typography>
          )}
        </>
      )}
      {event.state !== 'running' && !errorMessage && !reasoning && (event.diagnostics || event.result) && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 0.5, pl: '8px' }}>
          {event.diagnostics && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onShowDiagnostics(event.diagnostics)}
              sx={{ fontSize: '0.75rem', padding: '2px 8px', minWidth: 'auto' }}
            >
              Diagnostics
            </Button>
          )}
          {event.result && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onShowResult(event.result ?? '')}
              sx={{ fontSize: '0.75rem', padding: '2px 8px', minWidth: 'auto' }}
            >
              Results
            </Button>
          )}
        </Box>
      )}
      {event.type === 'ai' && event.response && (
        <Typography variant="body2" className="eventMessage" sx={{ fontStyle: 'italic' }}>
          {event.response}
        </Typography>
      )}
      {event.type !== 'tool' && (
        <Typography variant="body2" className="eventMessage">
          {event.message}
        </Typography>
      )}
      {event.type === 'tool' && event.state === 'failed' && !errorMessage && (
        <Typography variant="body2" className="eventMessage" color="error.main">
          {event.message}
        </Typography>
      )}
      {showAccordion && (
        <Accordion defaultExpanded={false} sx={{ mt: 1 }}>
          <AccordionSummary expandIcon={<Typography variant="caption">▼</Typography>}>
            <Typography variant="caption">
              {hasChildren ? `Sub-agent (${event.children.length})` : 'Sub-agent'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {hasChildren ? (
              <Stack spacing={0.75}>
                {event.children.map((child) => (
                  <ChildEventCard
                    key={child.id}
                    child={child}
                    onShowDiagnostics={onShowDiagnostics}
                    onShowResult={onShowResult}
                  />
                ))}
              </Stack>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={12} thickness={6} />
                <Typography variant="caption" color="text.secondary">Running…</Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

const EventLogPanel = ({ current }: EventLogPanelProps): JSX.Element => {
  const endRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedEventDiagnostics, setSelectedEventDiagnostics] = useState<AgentEvent['diagnostics'] | null>(null);
  const [selectedEventResult, setSelectedEventResult] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom <= 600) {
      endRef.current?.scrollIntoView({ block: 'end' });
    }
  }, [current?.events]);

  if (!current) {
    return (
      <Typography variant="body2" color="text.secondary">
        Waiting for the next domain.
      </Typography>
    );
  }

  const displayedEvents = getDisplayedEvents(current);
  const allEvents = current.events;

  const firstEventTime = allEvents[0]?.createdAt;
  const lastEventTime = allEvents.length > 0
    ? (allEvents[allEvents.length - 1]?.completedAt ?? allEvents[allEvents.length - 1]?.createdAt)
    : undefined;
  const totalDurationMs = firstEventTime && lastEventTime
    ? new Date(lastEventTime).getTime() - new Date(firstEventTime).getTime()
    : undefined;

  return (
    <Box className="eventLogPanel">
      <Stack spacing={1.25} className="eventLog" ref={containerRef}>
        {displayedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onShowDiagnostics={(d) => setSelectedEventDiagnostics(d ?? null)}
            onShowResult={(r) => setSelectedEventResult(r)}
          />
        ))}
        <Box ref={endRef} />
      </Stack>
      <TokenStats events={allEvents} durationMs={totalDurationMs} className="eventLogFooter" />
      <DiagnosticsModal
        diagnostics={selectedEventDiagnostics || null}
        open={!!selectedEventDiagnostics}
        onClose={() => setSelectedEventDiagnostics(null)}
      />
      <ResultsModal
        result={selectedEventResult}
        open={!!selectedEventResult}
        onClose={() => setSelectedEventResult(null)}
      />
    </Box>
  );
};

export const eventLogPanel = {
  EventLogPanel,
};
