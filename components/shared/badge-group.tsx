export const BadgeGroup = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-wrap gap-1 [&>p]:contents">{children}</div>
}
