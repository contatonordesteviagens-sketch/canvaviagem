interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
};
