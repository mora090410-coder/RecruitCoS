import * as React from "react"
import { cn } from "../../lib/utils"

const badgeVariants = {
    default: "rc-pill border-transparent",
    secondary: "border border-[var(--rc-border)] bg-[rgba(255,255,255,0.9)] text-[var(--rc-ink)]",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
    outline: "border border-[var(--rc-border)] text-[var(--rc-muted)] bg-white",
}

function Badge({
    className,
    variant = "default",
    ...props
}) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
                badgeVariants[variant] || badgeVariants.default,
                className
            )}
            {...props}
        />
    );
}

export { Badge, badgeVariants }
