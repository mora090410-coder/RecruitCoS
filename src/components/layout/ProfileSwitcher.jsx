import { useAuth } from '../../contexts/AuthContext'
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
    const { user, accessibleAthletes, activeAthlete, switchAthlete } = useAuth()

    if (!accessibleAthletes || accessibleAthletes.length === 0) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 px-3 hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                        {activeAthlete ? (
                            <Users className="w-4 h-4 text-brand-primary" />
                        ) : (
                            <User className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="text-sm font-medium">
                            {activeAthlete ? activeAthlete.full_name : 'My Profile'}
                        </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Switch Profile</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => switchAthlete(null)}
                    className={!activeAthlete ? 'bg-gray-100' : ''}
                >
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                </DropdownMenuItem>

                {accessibleAthletes.map((access) => (
                    <DropdownMenuItem
                        key={access.athlete.id}
                        onClick={() => switchAthlete(access.athlete.id)}
                        className={activeAthlete?.id === access.athlete.id ? 'bg-gray-100' : ''}
                    >
                        <Users className="w-4 h-4 mr-2" />
                        {access.athlete.full_name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
