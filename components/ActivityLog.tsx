import React from 'react';
import { TerminalIcon } from './Icons';

interface ActivityLogProps {
    logs: string[];
    onClearLogs: () => void;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ logs, onClearLogs }) => {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <TerminalIcon />
                    <h3 className="text-sm font-bold">Activity Log</h3>
                </div>
                <button onClick={onClearLogs} className="text-xs font-semibold opacity-70 hover:opacity-100 transition-opacity" aria-label="Clear logs">Clear</button>
            </div>
            <div className="bg-[var(--nb-surface-alt)] border border-[var(--nb-border)] rounded-lg p-3 h-24 overflow-y-auto text-xs font-mono opacity-80 space-y-1">
                {logs.length > 0 ? logs.map((log, index) => (<p key={index} className="whitespace-pre-wrap break-words">{log}</p>)) : <p>Logs will appear here...</p>}
            </div>
        </div>
    );
};
