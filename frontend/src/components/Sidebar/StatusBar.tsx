'use client';

export type StatusKind = 'info' | 'success' | 'error';

interface StatusBarProps {
  message: string;
  kind: StatusKind;
}

export default function StatusBar({ message, kind }: StatusBarProps) {
  return <div className={`status-bar ${kind}`}>{message}</div>;
}
