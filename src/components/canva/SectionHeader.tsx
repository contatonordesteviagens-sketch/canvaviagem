interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => {
  return (
    <div className="mb-4 md:mb-6">
      <h2 className="text-lg md:text-3xl font-bold md:font-extrabold text-foreground tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground mt-0.5 md:mt-1 text-xs md:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
};
