import type { LucideIcon, LucideProps } from "lucide-react";

export function createIconComponent(
  Icon: LucideIcon,
  defaultClassName: string,
) {
  function IconComponent({
    className = defaultClassName,
    "aria-hidden": ariaHidden = true,
    ...props
  }: LucideProps) {
    return <Icon aria-hidden={ariaHidden} className={className} {...props} />;
  }

  return IconComponent;
}
