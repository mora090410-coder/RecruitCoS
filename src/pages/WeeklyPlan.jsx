import DashboardLayout from '../components/DashboardLayout';
import WeeklyPlanCards from '../components/WeeklyPlanCards';
import { useProfile } from '../hooks/useProfile';

export default function WeeklyPlan() {
    const { profile } = useProfile();

    return (
        <DashboardLayout phase={profile?.phase}>
            <div className="max-w-6xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 font-serif">Weekly Plan</h1>
                    <p className="text-zinc-500 mt-1">
                        Focus your week on the highest leverage actions for recruiting progress.
                    </p>
                </div>
                <WeeklyPlanCards />
            </div>
        </DashboardLayout>
    );
}
