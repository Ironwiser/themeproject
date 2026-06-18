type LandingEmberTabLabelProps = {
  label: string;
};

export function LandingEmberTabLabel({ label }: LandingEmberTabLabelProps) {
  return <span className="theme-tab-ember-label__text">{label}</span>;
}
