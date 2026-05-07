const PageHeader = ({ title, subtitle, actions }) => (
  <div className="section-title">
    <div>
      <h2>{title}</h2>
      {subtitle && <p className="text-muted" style={{ margin: '4px 0 0' }}>{subtitle}</p>}
    </div>
    {actions && <div className="flex gap-12">{actions}</div>}
  </div>
);

export default PageHeader;
