import { useAuth } from '../../contexts/AuthContext'
import { useProfile } from '../../hooks/useProfile'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { ChevronDown, User, Users } from 'lucide-react'

export default function ProfileSwitcher() {
    const { user } = useAuth()
    const { accessibleAthletes, activeAthlete, switchAthlete } = useProfile()

    if (!accessibleAthletes || accessibleAthletes.length === 0) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 px-3 hover:bg-[rgba(139,38,53,0.05)]">
                    <div className="flex items-center gap-2">
                        {activeAthlete ? (
                            <Users className="h-4 w-4 text-[var(--rc-cardinal)]" />
                        ) : (
                            <User className="h-4 w-4 text-[var(--rc-muted)]" />
                        )}
                        <span className="text-sm font-medium">
                            {activeAthlete ? activeAthlete.full_name : 'My Profile'}
                        </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-[var(--rc-muted)]" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-[var(--rc-border)] bg-[var(--rc-surface)] text-[var(--rc-ink)]">
                <DropdownMenuLabel>Switch Profile</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => switchAthlete(null)}
                    className={!activeAthlete ? 'bg-[rgba(139,38,53,0.06)]' : ''}
                >
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                </DropdownMenuItem>

                {accessibleAthletes.map((access) => (
                    <DropdownMenuItem
                        key={access.athlete.id}
                        onClick={() => switchAthlete(access.athlete.id)}
                        className={activeAthlete?.id === access.athlete.id ? 'bg-[rgba(139,38,53,0.06)]' : ''}
                    >
                        <Users className="w-4 h-4 mr-2" />
                        {access.athlete.full_name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
