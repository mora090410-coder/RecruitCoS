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
const supabaseAnonKey = envConfig.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkCoaches() {
    const { data, error } = await supabase.from('coaches').select('*')
    if (error) console.error('Error:', error)
    else console.log('Coaches found:', data.length, data)
}

checkCoaches()
