
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envConfig = fs.readFileSync('.env', 'utf-8')
    .split('\n')
    .filter(line => line.trim() !== '')
    .reduce((acc, line) => {
        const [key, value] = line.split('=')
        acc[key] = value
        return acc
    }, {})

const supabaseUrl = envConfig.VITE_SUPABASE_URL
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const coaches = [
    { name: 'Patty Gasso', school: 'Oklahoma', division: 'D1', sport: 'Softball', position: 'Head Coach', twitter_handle: '@GassoPatty', region: 'Midwest' },
    { name: 'Tim Walton', school: 'Florida', division: 'D1', sport: 'Softball', position: 'Head Coach', twitter_handle: '@_TimWalton', region: 'Southeast' },
    { name: 'Mike Candrea', school: 'Arizona', division: 'D1', sport: 'Softball', position: 'Head Coach (Retired)', twitter_handle: '@CoachCandreaUA', region: 'West Coast' },
    { name: 'Example Coach D2', school: 'West Florida', division: 'D2', sport: 'Softball', position: 'Head Coach', twitter_handle: '@CoachD2', region: 'Southeast' },
    { name: 'Example Coach D3', school: 'Williams College', division: 'D3', sport: 'Softball', position: 'Head Coach', twitter_handle: '@CoachD3', region: 'Northeast' }
]

async function seed() {
    const { error } = await supabase.from('coaches').insert(coaches)
    if (error) console.error('Error seeding:', error)
    else console.log('Seeded coaches successfully')
}

seed()
