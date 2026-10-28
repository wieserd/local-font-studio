import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface SidebarSectionProps {
  id?: string;
  title: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  icon,
  badge,
  isOpen,
  onToggle,
  children,
  headerRight
}) => {
  return (
    <div style={{
      borderRadius: '6px',
      overflow: 'hidden',
      border: '1px solid var(--border)',
      flexShrink: 0
    }}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-surface)',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'background-color 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isOpen ? (
            <ChevronDown size={14} color="var(--accent)" />
          ) : (
            <ChevronRight size={14} color="var(--text-muted)" />
          )}
          {icon}
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: isOpen ? 'var(--text-main)' : 'var(--text-muted)'
          }}>
            {title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {headerRight}
          {badge && (
            typeof badge === 'string' || typeof badge === 'number' ? (
              <span className="badge badge-gray" style={{ fontSize: '9px' }}>
                {badge}
              </span>
            ) : (
              badge
            )
          )}
        </div>
      </div>

      {isOpen && (
        <div style={{
          padding: '10px',
          backgroundColor: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {children}
        </div>
      )}
    </div>
  );
};
