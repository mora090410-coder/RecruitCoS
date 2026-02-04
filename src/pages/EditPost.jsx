import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { ChevronLeft, Loader2, Save } from 'lucide-react'

export default function EditPost() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [post, setPost] = useState(null)
    const [content, setContent] = useState('')

    useEffect(() => {
        const fetchPost = async () => {
            if (!id || !user) return

            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (error) throw error
                if (data.user_id !== user.id) throw new Error("Unauthorized")

                setPost(data)
                setContent(data.post_text || '')
            } catch (err) {
                console.error('Error fetching post:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchPost()
    }, [id, user])

    const handleSave = async () => {
        if (!content.trim()) return

        setSaving(true)
        try {
            const { error } = await supabase
                .from('posts')
                .update({ post_text: content })
                .eq('id', id)

            if (error) throw error

            navigate('/dashboard')
        } catch (err) {
            console.error('Error saving post:', err)
            setError(err.message)
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-4">
                <p className="text-red-400 mb-4">Error: {error}</p>
                <Button onClick={() => navigate('/dashboard')} variant="ghost">Return to Dashboard</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="text-zinc-400 hover:text-white pl-0"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back to Dashboard
                    </Button>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
                    <h1 className="text-2xl font-bold font-serif mb-6">Edit Post</h1>

                    <div className="space-y-4">
                        <textarea
                            className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-white resize-none focus:ring-2 focus:ring-green-500 outline-none"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your post content here..."
                        />

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/dashboard')}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving || !content.trim()}
                                className="bg-green-500 hover:bg-green-600 text-white min-w-[100px]"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
