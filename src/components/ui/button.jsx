import React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(139, 38, 53, 0.2)] disabled:pointer-events-none disabled:opacity-50";

    const variants = {
        default: "rc-btn-primary",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline: "rc-btn-secondary",
        secondary: "border border-[var(--rc-border)] bg-[rgba(255,255,255,0.92)] text-[var(--rc-ink)] hover:bg-[rgba(139, 38, 53, 0.05)] shadow-sm",
        ghost: "text-[var(--rc-muted)] hover:bg-[rgba(139, 38, 53, 0.06)] hover:text-[var(--rc-cardinal)]",
        link: "text-[var(--rc-cardinal)] underline-offset-4 hover:underline",
    };

    const sizes = {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
    };

    const mergedClassName = cn(baseStyles, variants[variant], sizes[size], className);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            ...props,
            className: cn(mergedClassName, children.props.className),
        });
    }

    return (
        <button
            className={mergedClassName}
            ref={ref}
            {...props}
        >
            {children}
        </button>
    );
});
Button.displayName = "Button";

export { Button };
