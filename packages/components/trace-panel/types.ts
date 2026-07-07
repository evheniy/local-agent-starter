import type { ComponentProps, FC } from 'react';

/** Status for an application trace event. */
export type TraceEventStatus = 'pending' | 'running' | 'done' | 'error';

/** Application-level trace event shown by the TracePanel component. */
export type TraceEvent = {
  id: string;
  title: string;
  description?: string;
  status: TraceEventStatus;
  metadata?: Record<string, string | number | boolean>;
};

/** Props for the TracePanel component. */
export type TracePanelProps = {
  events?: TraceEvent[];
} & ComponentProps<'aside'>;

/** TracePanel component type. */
export type TracePanelType = FC<TracePanelProps>;

/** Display labels for every trace event status. */
export type TracePanelStatusLabelsType = Record<TraceEventStatus, string>;
