import * as React from "react"
import { cn } from "../../lib/utils"

const DropdownMenu = ({ children }) => {
    const [open, setOpen] = React.useState(false)
    const containerRef = React.useRef(null)

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="relative inline-block text-left" ref={containerRef}>
            {React.Children.map(children, child => {
                if (child.type === DropdownMenuTrigger) {
                    return React.cloneElement(child, { onClick: () => setOpen(!open) })
                }
                if (child.type === DropdownMenuContent) {
                    return open ? child : null
                }
                return child
            })}
        </div>
    )
}

const DropdownMenuTrigger = ({ children, asChild, onClick }) => {
    if (asChild) {
        return React.cloneElement(children, { onClick })
    }
    return <button onClick={onClick}>{children}</button>
}

const DropdownMenuContent = ({ children, align = "end", className }) => {
    const alignClass = align === "end" ? "right-0" : "left-0"
    return (
        <div className={cn(
            "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-md animate-in fade-in-80",
            alignClass,
            className
        )}>
            {children}
        </div>
    )
}

const DropdownMenuItem = ({ children, onClick, className }) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                className
            )}
        >
            {children}
        </div>
    )
}

const DropdownMenuLabel = ({ children, className }) => (
    <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>
        {children}
    </div>
)

const DropdownMenuSeparator = ({ className }) => (
    <div className={cn("-mx-1 my-1 h-px bg-gray-100", className)} />
)

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
}
