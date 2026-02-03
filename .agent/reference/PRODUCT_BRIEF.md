# PRODUCT BRIEF: Recruiting Chief of Staff (MVP)

## EXECUTIVE SUMMARY

We are building an AI-powered platform that enables high school athletes to maintain an effective recruiting social media presence—even if they've never posted for recruiting before. This is NOT a time-saving tool for athletes already posting. This is a TRANSFORMATIONAL tool that unlocks recruiting opportunities for the 80% of athletes who SHOULD be posting but aren't because the barrier is too high.

---

## THE CORE INSIGHT

**Discovery:** Not all athletes post consistently for recruiting—not because they don't have time, but because they don't know they should, don't know what to say, don't know who to tag, and are afraid of looking stupid.

**Market Impact:**
- ~40,000 high school athletes post consistently for recruiting (20% of active recruits)
- ~160,000 high school athletes DON'T post but SHOULD BE (80% of active recruits)
- These 160,000 athletes are LOSING recruiting opportunities right now

**The Opportunity:** Lower the barrier so dramatically that athletes who've never posted can start posting like D1 recruits in 30 seconds.

---

## THE SOLUTION

### Product Name
**Recruiting Chief of Staff** (working name)

### Positioning Statement
"Get recruited. Even if you've never posted before."

### Value Proposition
Transform a 30-minute recruiting post into a 30-second "approve and send" action—while teaching athletes what great recruiting content looks like.

### The "Chief of Staff" Metaphor
The AI doesn't speak FOR the athlete (too risky, inauthentic). The AI does the 90% grunt work (research + drafting), and the athlete retains 100% control over the final 10% (edit + approve + post).

---

## PRODUCT ARCHITECTURE

### The Five-Step Flow

**STEP 1: EVENT LOGGING (Manual Input)**
Athlete logs a recent event/achievement.

**STEP 2: CONTENT GENERATION (AI-Powered)**
System generates 3 post options with different tones/approaches.

**STEP 3: COACH TARGETING (AI-Assisted Research)**
System identifies relevant coaches to tag.

**STEP 4: TIMING OPTIMIZATION (AI-Suggested)**
System recommends optimal posting time.

**STEP 5: APPROVAL & POSTING (Human Final Say)**
Athlete reviews complete post package.

---

## MVP FEATURE SCOPE

### CURRENT IMPLEMENTATION STATUS

✅ **Event Logging Form**: Fully implemented. Captures event details, date, and performance.
✅ **AI Content Generation**: Powered by **Google Gemini 2.0 Flash**. Generates 3 distinct post styles (Hype, Humble, Grind).
✅ **Coach Targeting**: Searchable database with 500+ coaches. Includes **Twitter handle integration** for automatic tagging.
✅ **Post Approval Flow**: "Save & Copy" functionality that saves posts to history and copies to clipboard.
✅ **Dashboard**: Redesigned "Content Feed" UI with Top Navigation and Recent Posts feed.
✅ **User Authentication**: **Supabase Auth** (Magic Link).
✅ **Manual Coach Database**: Pre-populated Supabase table.
construction **Mobile Responsiveness**: In Progress.
construction **Payment Integration**: Stripe (Planned).

---

## TECHNICAL STACK

### Frontend
- **Framework:** React + Vite
- **Styling:** Tailwind CSS + Lucide React
- **Hosting:** Vercel (Planned)

### Backend & Database
- **Platform:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Magic Link)
- **AI Engine:** Google Gemini API (gemini-2.0-flash)
- **Payment:** Stripe

### Database Schema (Implemented)

**subjects (athletes):**
- id, user_id, name, created_at

**events:**
- id, athlete_id, event_name, performance, event_date, event_type

**posts:**
- id, athlete_id, event_id, post_text, status (draft/posted), created_at

**coaches:**
- id, name, school, sport, twitter_handle

---

## TIMELINE & MILESTONES

### Completed
- Project Setup & Design
- Core Database Schema (Supabase)
- Auth Integration
- Coach Database Seeding
- Event Logging & AI Generation (Gemini)
- Coach Tagging Logic
- Dashboard UI Overhaul

### Next Steps (Phase 3)
- Mobile Responsiveness Polish
- Stripe Integration
- Public Launch
