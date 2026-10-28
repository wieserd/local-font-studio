import React from 'react';

export interface StandardSidebarProps {
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  headerAction?: React.ReactNode;
  extraHeaderContent?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const StandardSidebar: React.FC<StandardSidebarProps> = ({
  title,
  subtitle,
  icon,
  onExpandAll,
  onCollapseAll,
  headerAction,
  extraHeaderContent,
  children,
  footer,
  style
}) => {
  return (
    <div
      style={{
        width: '320px',
        minWidth: '320px',
        maxWidth: '320px',
        flexShrink: 0,
        height: '100%',
        maxHeight: '100%',
        backgroundColor: 'var(--bg-sidebar)',
        borderLeft: '1px solid var(--border)',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '14px',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {/* Standard Sidebar Header */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {icon}
              <h3 style={{
                fontSize: '13px',
                fontWeight: 700,
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-main)'
              }}>
                {title}
              </h3>
            </div>
            {subtitle && (
              <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '2px' }}>
                {subtitle}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {headerAction}
            {(onExpandAll || onCollapseAll) && (
              <div style={{ display: 'flex', gap: '3px' }}>
                {onExpandAll && (
                  <button
                    className="btn-secondary"
                    onClick={onExpandAll}
                    style={{ padding: '2px 5px', fontSize: '9px' }}
                    title="Expand all categories"
                  >
                    Expand
                  </button>
                )}
                {onCollapseAll && (
                  <button
                    className="btn-secondary"
                    onClick={onCollapseAll}
                    style={{ padding: '2px 5px', fontSize: '9px' }}
                    title="Collapse all categories"
                  >
                    Collapse
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {extraHeaderContent}
      </div>

      {/* Accordion Categories Content Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {children}
      </div>

      {/* Optional Bottom Footer */}
      {footer && (
        <div style={{ flexShrink: 0, marginTop: 'auto', paddingTop: '4px' }}>
          {footer}
        </div>
      )}
    </div>
  );
};
