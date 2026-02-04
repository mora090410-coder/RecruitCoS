import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getAthletePhase } from '../lib/constants'
import { useAuth } from '../contexts/AuthContext'
import { generateSocialPosts } from '../lib/gemini'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card'
import { Mic, Check, Twitter, Calendar } from 'lucide-react'

import CoachSelector from '../components/CoachSelector'

// Tone Options
const TONES = [
    {
        id: 'humble',
        title: 'Humble',
        description: 'Grateful, team-first, hard worker.',
        prompt: 'Write in a humble, grateful tone. Focus on team success and hard work. Mention teammates and coaches.',
        icon: '🙏'
    },
    {
        id: 'professional',
        title: 'Professional',
        description: 'Polite, articulate, business-like.',
        prompt: 'Write in a professional, articulate tone. Be concise and respectful. Focus on facts and achievements.',
        icon: '💼'
    },
    {
        id: 'gritty',
        title: 'Gritty',
        description: 'Relentless, chip on shoulder.',
        prompt: 'Write in a gritty, determined tone. Focus on the grind, overcoming adversity, and outworking everyone. Use fire emojis.',
        icon: '😤'
    }
]

export default function EventLogger() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [generatedPosts, setGeneratedPosts] = useState(null)
    const [selectedCoaches, setSelectedCoaches] = useState([])
    const [eventId, setEventId] = useState(null)
    const [athlete, setAthlete] = useState(null)
    const [showVoiceModal, setShowVoiceModal] = useState(false)
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(null)

    // Throttling State
    const lastGenerationTime = useRef(0);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        event_type: 'game'
    })

    // Check Voice Profile on Mount
    useEffect(() => {
        async function checkProfile() {
            if (!user) return

            try {
                const { data: athleteData, error } = await supabase
                    .from('athletes')
                    .select('*') // Get full athlete object for recommendations
                    .eq('user_id', user.id)
                    .single()

                if (athleteData) {
                    setAthlete(athleteData)
                    if (!athleteData.voice_profile) {
                        setShowVoiceModal(true)
                    }
                }
            } catch (err) {
                if (import.meta.env.DEV) console.error("Error checking profile:", err)
            } finally {
                setPageLoading(false)
            }
        }

        checkProfile()
    }, [user])

    const handleVoiceSelection = async (prompt) => {
        try {
            const { error } = await supabase
                .from('athletes')
                .update({ voice_profile: prompt })
                .eq('id', athlete.id)

            if (error) throw error

            // Update local state
            setAthlete(prev => ({ ...prev, voice_profile: prompt }))
            setShowVoiceModal(false)
        } catch (err) {
            console.error("Error updating voice:", err)
            alert("Failed to save voice preference")
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Throttling Check (10 seconds)
        const now = Date.now();
        if (now - lastGenerationTime.current < 10000) {
            alert("Please wait a moment before generating again.");
            return;
        }
        lastGenerationTime.current = now;

        setLoading(true)

        // 1. Get/Create Athlete (Fallback if not loaded)
        let currentAthlete = athlete
        if (!currentAthlete) {
            let { data: fetchedAthlete } = await supabase.from('athletes').select('*').eq('user_id', user.id).single()

            if (!fetchedAthlete) {
                // Create fallback if needed
                const { data: newAthlete, error: createError } = await supabase
                    .from('athletes')
                    .insert([{ user_id: user.id, name: user.email.split('@')[0], grad_year: 2026 }])
                    .select()
                    .single()

                if (createError) {
                    console.error('Error creating athlete:', createError)
                    alert(`Error creating profile: ${createError.message}`)
                    setLoading(false)
                    return
                }
                fetchedAthlete = newAthlete
            }
            currentAthlete = fetchedAthlete
            setAthlete(fetchedAthlete)
        }

        // 2. Save Event
        const { data: eventData, error } = await supabase.from('events').insert([
            {
                athlete_id: currentAthlete.id,
                event_name: formData.title,
                performance: formData.description,
                event_date: formData.date,
                event_type: formData.event_type
            }
        ]).select().single()

        if (error) {
            console.error('Error logging event:', error)
            alert('Failed to log event: ' + error.message)
            setLoading(false)
            return;
        }

        setEventId(eventData.id)

        // 3. Generate Content
        try {
            const currentPhase = getAthletePhase(currentAthlete.grad_year);
            const aiResponse = await generateSocialPosts(formData, selectedCoaches, currentAthlete.voice_profile || "", currentPhase);
            setGeneratedPosts(aiResponse.options);
        } catch (aiError) {
            console.error("AI Gen Error", aiError);
            alert(`Event saved, but AI generation failed: ${aiError.message}`);
            navigate('/');
        }

        setLoading(false)
    }

    const handleSaveAndCopy = async () => {
        if (selectedOptionIndex === null) {
            alert("Please select a post option first")
            return
        }

        const selectedPost = generatedPosts[selectedOptionIndex]
        const optionLabel = ['A', 'B', 'C'][selectedOptionIndex]

        try {
            // 1. Copy to clipboard
            await navigator.clipboard.writeText(selectedPost.content)

            // 2. Save to Database
            const { error } = await supabase.from('posts').insert([
                {
                    athlete_id: athlete.id,
                    event_id: eventId,
                    post_text: selectedPost.content,
                    selected_option: optionLabel,
                    coach_tags: selectedCoaches.map(c => c.twitter_handle).filter(Boolean),
                    status: 'draft' // Mark as copied/draft
                }
            ])

            if (error) throw error

            alert("Copied to clipboard & saved to History!")
            navigate('/')

        } catch (error) {
            console.error("Error saving post:", error)
            alert(`Copied, but failed to save: ${error.message}`)
        }
    }

    // Voice Modal
    const VoiceModal = () => (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                        <Mic className="w-5 h-5" />
                        <span className="text-sm font-semibold uppercase tracking-wider">Voice Calibration</span>
                    </div>
                    <CardTitle className="text-xl">How should your posts sound?</CardTitle>
                    <p className="text-zinc-400 text-sm">Select a tone for your AI-generated content.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {TONES.map(tone => (
                        <div
                            key={tone.id}
                            onClick={() => handleVoiceSelection(tone.prompt)}
                            className="p-4 rounded-xl cursor-pointer border-2 border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl group-hover:scale-110 transition-transform">{tone.icon}</span>
                                <div>
                                    <h3 className="font-bold text-white group-hover:text-green-400 transition-colors">
                                        {tone.title}
                                    </h3>
                                    <p className="text-zinc-400 text-sm">{tone.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )

    if (pageLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>

    return (
        <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center gap-8 relative">

            {showVoiceModal && <VoiceModal />}

            {/* Form Section - Hide if we have results */}
            {!generatedPosts && (
                <Card className="w-full max-w-lg shadow-lg border-0">
                    <CardHeader className="bg-white border-b border-gray-100 rounded-t-xl">
                        <CardTitle className="flex items-center gap-2">
                            <span className="bg-brand-primary/10 p-2 rounded-lg text-brand-primary">
                                <Twitter size={20} />
                            </span>
                            Log New Event
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                            Log your stats, tag coaches, and let AI generate your post.
                        </p>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-5">

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Event Type</label>
                                    <select
                                        name="event_type"
                                        value={formData.event_type}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
                                    >
                                        <option value="game">Game</option>
                                        <option value="practice">Practice</option>
                                        <option value="showcase">Showcase</option>
                                        <option value="offer">Offer Received</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Date</label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            required
                                            className="pl-9"
                                        />
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Headline</label>
                                <Input
                                    name="title"
                                    placeholder="e.g., Hit 2 HRs vs. Rival"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Stats & Notes</label>
                                <textarea
                                    name="description"
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
                                    placeholder="Make sure to include specific stats (e.g. 3-4, 2 HRs) and the result (won 8-2)."
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="pt-2">
                                <CoachSelector
                                    athlete={athlete}
                                    selectedCoaches={selectedCoaches}
                                    onSelect={(coach) => {
                                        if (!selectedCoaches.find(c => c.id === coach.id)) {
                                            setSelectedCoaches([...selectedCoaches, coach])
                                        }
                                    }}
                                    onRemove={(id) => setSelectedCoaches(selectedCoaches.filter(c => c.id !== id))}
                                />
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/')}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90" disabled={loading}>
                                    {loading ? 'Generating...' : 'Generate Posts'}
                                </Button>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Results Section */}
            {generatedPosts && (
                <div className="w-full max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Choose Your Post</h2>
                        <p className="text-gray-500 max-w-lg mx-auto">Select the option that best fits your style. We've included coach tags automatically.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {generatedPosts.map((post, index) => (
                            <div
                                key={index}
                                onClick={() => setSelectedOptionIndex(index)}
                                className={`relative group cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${selectedOptionIndex === index
                                    ? 'ring-4 ring-brand-primary ring-offset-4 scale-105 z-10'
                                    : 'hover:shadow-xl'
                                    }`}
                            >
                                <Card className={`h-full border-2 ${selectedOptionIndex === index ? 'border-brand-primary bg-brand-primary/5' : 'border-transparent hover:border-gray-200'}`}>
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${selectedOptionIndex === index ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                Option {['A', 'B', 'C'][index]}
                                            </span>
                                            {selectedOptionIndex === index && (
                                                <div className="text-brand-primary bg-white rounded-full p-1 shadow-sm">
                                                    <Check size={16} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                        <CardTitle className="text-lg font-bold text-gray-900 mt-2">{post.style}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                                            {post.content}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-lg flex justify-center items-center gap-4 z-40 animate-in slide-in-from-bottom-full duration-500">
                        <Button variant="outline" size="lg" onClick={() => { setGeneratedPosts(null); setSelectedOptionIndex(null); }}>
                            Back to Edit
                        </Button>
                        <Button
                            size="lg"
                            onClick={handleSaveAndCopy}
                            disabled={selectedOptionIndex === null}
                            className="bg-brand-primary hover:bg-brand-primary/90 px-8 text-lg shadow-brand-primary/25 shadow-lg transition-all"
                        >
                            {selectedOptionIndex !== null ? 'Copy & Save Post' : 'Select an Option'}
                        </Button>
                    </div>
                    {/* Spacer for fixed bottom bar */}
                    <div className="h-20"></div>
                </div>
            )}

        </div>
    )
}
