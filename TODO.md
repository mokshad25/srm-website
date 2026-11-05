# TODO

Everything hidden, unconfirmed or different from the references.

## Needs your attention
- `notes.md` still isn't supplied, so all facts come from the text of the Claude Design export.
- **Hero photo still soft.** `campus-aerial.jpg` is 1200 x 370, stretched about 2.4x at 1440 x 900. Supply a real SRM campus photo at least 2400 px wide under the same filename, then update `width` and `height` in `src/data/photos.json`. Most other SRM photos are under 750 px wide too.
- **Stock photos aren't SRM.** 19 Unsplash images fill the gaps, which goes against the original brief's "never stock" rule, at your request on 5 Nov. A note beside those sections says they're illustrative. Replace them with real photos before this is published as SRM's site.

- **Ask SRM covers only the pages in `backend/.../scripts/ingest_urls.tsv`.** No official fees page was found, so fee questions rely on the admission brochure and may come back unverified. Every page is tagged 2026-27 as briefed, though most don't state a year.
- **Placement figures aren't readable.** SRM publishes them as images on the placement statistics page, so "What are the placement figures?" returns the unverified state until a text source exists.
- **Ask SRM runs on Groq's free tier for now.** It allows 8,000 tokens a minute and 200,000 a day per model, roughly 2 questions a minute and 50 to 70 a day. Past that, visitors see the "isn't available" state. The site currently uses `openai/gpt-oss-20b`, because testing used up the daily allowance for `openai/gpt-oss-120b`. A paid tier or an OpenAI key is needed before real traffic.
- **"Verified" dates mean the last ingestion.** They show when a page was last fetched, not that someone checked its facts.
- **Fee questions and MBBS application questions come back unverified.** The admission brochure is refused here because its host resolves to a private address, and no official fees page was found.
- **Ask SRM needs a deployed API.** Set `VITE_API_BASE` at build time and add the site's origin to the backend's `CORS_ORIGINS`.

## Photo map
Each photo appears once per page. `npm run build` fails on a repeat. Slots starting `campus.` are map cards.

| Slot | File | Source |
|---|---|---|
| `home.hero` | `campus-aerial.jpg` | SRM |
| `home.discover-1` | `tech-park-steps.jpg` | SRM |
| `home.discover-2` | `medical-student.jpg` | SRM |
| `home.discover-3` | `classroom.jpg` | SRM |
| `home.discover-4` | `stock-science.jpg` | Stock |
| `home.discover-5` | `main-gate.jpg` | SRM |
| `home.discover-6` | `stock-research.jpg` | Stock |
| `home.life-hostels` | `stock-hostel.jpg` | Stock |
| `home.life-sports` | `stock-sports.jpg` | Stock |
| `home.life-clubs` | `law-students.jpg` | SRM |
| `home.life-festivals` | `stock-festival.jpg` | Stock |
| `home.life-dining` | `stock-dining.jpg` | Stock |
| `home.life-library` | `stock-library.jpg` | Stock |
| `home.life-communities` | `students-steps.jpg` | SRM |
| `engineering.hero` | `tech-park-steps.jpg` | SRM |
| `engineering.disc-1` | `stock-computing.jpg` | Stock |
| `engineering.disc-2` | `stock-mechanical.jpg` | Stock |
| `engineering.disc-3` | `stock-aerospace.jpg` | Stock |
| `engineering.disc-4` | `stock-electronics.jpg` | Stock |
| `engineering.disc-5` | `tech-park-tower.jpg` | SRM |
| `engineering.disc-6` | `stock-biomedical.jpg` | Stock |
| `medicine.hero` | `medical-student.jpg` | SRM |
| `medicine.about` | `campus-aerial.jpg` | SRM |
| `medicine.school-1` | `stock-surgery.jpg` | Stock |
| `medicine.school-2` | `stock-dentistry.jpg` | Stock |
| `medicine.school-3` | `stock-pharmacy.jpg` | Stock |
| `medicine.school-4` | `stock-physio.jpg` | Stock |
| `medicine.school-5` | `stock-therapy.jpg` | Stock |
| `medicine.school-6` | `stock-nursing.jpg` | Stock |
| `medicine.school-7` | `stock-health.jpg` | Stock |
| `learn.hero` | `main-gate.jpg` | SRM |
| `learn.learn` | `classroom.jpg` | SRM |
| `learn.leap` | `tech-park-steps.jpg` | SRM |
| `learn.lead` | `convocation.jpg` | SRM |
| `campus.tech` | `tech-park-tower.jpg` | SRM |

## Stock sources
All are free to use under the Unsplash License, with no attribution required. Paid Unsplash+ images were excluded.

| File | Licence | Source |
|---|---|---|
| `stock-hostel.jpg` | Unsplash License | https://unsplash.com/photos/black-metal-bunk-bed-WQJvWU_HZFo |
| `stock-sports.jpg` | Unsplash License | https://unsplash.com/photos/man-on-running-field-9HI8UJMSdZA |
| `stock-festival.jpg` | Unsplash License | https://unsplash.com/photos/five-dancers-in-colorful-traditional-indian-attire-on-steps-ImmubOS8GjY |
| `stock-dining.jpg` | Unsplash License | https://unsplash.com/photos/group-of-person-eating-on-restaurant-v8ViDmlOI9Q |
| `stock-library.jpg` | Unsplash License | https://unsplash.com/photos/library-interior-with-bookshelves-and-tables-n4y3eiQSIoc |
| `stock-science.jpg` | Unsplash License | https://unsplash.com/photos/three-clear-beakers-placed-on-tabletop-lQGJCMY5qcM |
| `stock-research.jpg` | Unsplash License | https://unsplash.com/photos/scientist-using-pipette-with-test-tubes-in-lab-RlOAwXt2fEA |
| `stock-computing.jpg` | Unsplash License | https://unsplash.com/photos/monitor-showing-java-programming-OqtafYT5kTw |
| `stock-mechanical.jpg` | Unsplash License | https://unsplash.com/photos/gray-metal-industrial-machine-djdoRnnKLyo |
| `stock-aerospace.jpg` | Unsplash License | https://unsplash.com/photos/black-and-white-airliner-turbine-yqeXLR81Uj0 |
| `stock-electronics.jpg` | Unsplash License | https://unsplash.com/photos/macro-photography-of-black-circuit-board-FO7JIlwjOtU |
| `stock-biomedical.jpg` | Unsplash License | https://unsplash.com/photos/person-sitting-while-using-laptop-computer-and-green-stethoscope-near-NFvdKIhxYlU |
| `stock-surgery.jpg` | Unsplash License | https://unsplash.com/photos/surgeons-performing-surgery-in-operating-room-tMFeatBSS4s |
| `stock-dentistry.jpg` | Unsplash License | https://unsplash.com/photos/dental-exam-with-mirror-and-tool-8BkF0sTC6Uo |
| `stock-pharmacy.jpg` | Unsplash License | https://unsplash.com/photos/a-pile-of-pills-sitting-next-to-each-other-on-top-of-a-table-RS0-h_pyByk |
| `stock-physio.jpg` | Unsplash License | https://unsplash.com/photos/a-man-getting-his-leg-examined-by-a-doctor-pbUWW-CBoqY |
| `stock-therapy.jpg` | Unsplash License | https://unsplash.com/photos/caregiver-assisting-elderly-women-with-knitting-activity-D394dKgOjec |
| `stock-nursing.jpg` | Unsplash License | https://unsplash.com/photos/woman-in-white-button-up-shirt-and-blue-stethoscope-l0j0DHVWcIE |
| `stock-health.jpg` | Unsplash License | https://unsplash.com/photos/a-group-of-people-holding-hands-on-top-of-a-tree-DNkoNXQti3c |

## Adding or changing a photo
1. Copy it into `src/assets/photos/`.
2. Add it to `photos` in `src/data/photos.json` with `id`, `file`, `width`, `height`, `alt` and `source`. Stock also needs `licence` and `url`.
3. Point a slot at it under `slots`.

## Hidden blocks
| Page | Block | Why | To bring it back |
|---|---|---|---|
| Home | Student testimonials | No real quotes or videos found. The hover loop and video modal are built | Fill `testimonials.json` with `name`, `programme`, `quote`, `video` |
| Home | SRM around the world | No location list | Fill `locations.json` |
| Home | Student achievements, internships, career development text | Placeholders | Supply real content |
| Home | Mid Sweden University partnership | Its photo isn't in `photos/` | Supply the photo, then add to the page |
| Home | Most campus card photos | No real photo of those buildings, so the card draws the building from the map instead | Add `campus.<place id>` slots |
| Engineering | Student innovation gallery and its nav link and hero button | All 8 projects were marked for replacement | Supply verified projects |
| Engineering | Dean's portrait | Not supplied; the message itself is shown | Supply portrait |
| Engineering | Recruiter logos, internship text | Placeholders | Supply real content |
| Medicine | Student innovation gallery | All 7 projects were marked for replacement | Supply verified projects |
| Medicine | Dean and faculty | Name, message and faculty were placeholders | Supply real content |
| Medicine | Facilities and skills labs | Export says to confirm these exist | Confirm the facilities |
| Medicine | Student life and its Campus Life nav link | Tiles were unfilled in the export | Supply photos and captions |

## Facts to confirm
- `news.json` holds real events from https://www.srmist.edu.in/events as listed on 5 Nov 2026, each linked. Categories are mine. Past events drop off by date, and the block hides when none remain, so it needs refilling.
- `recruiters.json` names come from SRM's Career Centre and recruiters pages, some from older seasons.
- 52,000+ students (home) vs 45,000+ (Medicine). Both shown as in the export.
- NIRF #12 2024 (home, footer, LEARN. LEAP. LEAD.) vs NIRF 2025 #11 University (Medicine). Each is labelled by year.
- Admissions 2026-27 (home, Medicine) vs Admissions 2027 (Engineering).
- **9 map places were added to reach 24:** Main Gate, Clock Tower, SRM Tech Park, Auditorium, Hospital, Swimming Pool, Campus Lake, Stadium, Bus Terminus. Confirm their names and that each exists. "Gate 4" as the main gate's label comes from the brief.
- Map walk times are derived from the illustrative layout, at 9 m per map unit and 75 m a minute, so they're approximate.
- The hero card shows each visitor's real count, so a first visit reads "0 of 24", not the brief's "7 of 24".
- Campus place names such as Engineering Block A are conceptual in the export, as are all positions. The map says the layout is illustrative.
- **Fees (`fees.json`).** Tuition comes from each programme's page on srmist.edu.in, read 5 Nov 2026: B.Tech CSE ₹4,75,000, B.Arch ₹2,75,000, BBA ₹2,00,000 (page is BBA Fintech), B.Sc Physics ₹75,000, M.Tech Data Science ₹1,90,000, MBA ₹6,20,000 (page is Financial Services with NSE), M.Sc Biotechnology ₹1,75,000, M.Arch ₹1,00,000. The pages don't state Indian or other category, so confirm these.
- Ph.D is ₹45,000: the PhD Chemistry page's ₹30,000 first and ₹15,000 later semester added together. Other disciplines may differ.
- MBBS has no published figure on its page, so it shows the NEET bulletin and is left out of the estimator.
- Hostel figures are the 2026-27 first-year boys' circular, including mess. Other SRM pages disagree, so check with the hostel office.
- Scholarship percentages are still from the export, not SRM, and the invented "other charges" row is removed.
- `programmes.json`: eligibility text comes from the export, which marked it as needing confirmation.
- Medicine clinical journey: the export says rotation details must be confirmed with the Dean's office. That note is removed from the page.
- The Download Prospectus link points to the 2025-26 PDF from the export.
- External links were copied from the export and have not been tested.

## Differences from the references
**Home vs your recording (33 seconds, ending at the faculty scroll):**
- Hero scroll is 180vh rather than 260vh, and zooms to 1.5x rather than 1.9x, to limit dead scroll and softness.
- Persona chips and the Trust strip are added, as your brief requires.
- The campus keeps numbered markers, a Jump to list and the explored count, which aren't in the recording.
- Wheel zoom on the map works only after clicking it, so it doesn't trap page scrolling. On phones, one finger pans sideways and scrolls the page up and down.
- The text-size control doesn't appear on Home.
- Below the recording, sections are restyled to match, but they follow the brief's tools and order rather than the export's.

**Home's exceptions to the quality bar, by your decision:** amber text accents, fluid sizes above 84 px, and the blue button. The photo-filled "SRM" is the one image-filled text. `npm run verify` skips the type-scale check on Home only. Contrast over the hero photo was checked by eye, as the audit can't read photos.

**Engineering and Medicine vs `screens/`:** these are viewport crops, so only those regions could be matched.
- Blue and amber text is now ink or off-white: nav, SRM wordmark, italic accents, stat numbers.
- Teal numbers on Medicine are ink. Teal stays on rules and tints.
- Headlines stop at 84 px and no longer use the caps + italic pattern.
- Cormorant Garamond headings and DM Sans body throughout.
- Hero images no longer rotate, as there's one real photo per hero.
- Engineering's header drops the search icon and the dropdown chevrons, which did nothing in the export.
- Removed blocks renumber the section labels.

**`npm run shot`:** runs with reduced motion, so the intro is skipped and tracks appear as grids. In a normal browser they animate.

**Ask SRM on the Home hero:** the scroll fade on the hero text now runs on desktop only. On phones the hero is taller than the screen, and fading it would hide the buttons below.

## Worth improving
- Map markers crowd on a phone. The Jump to list is the easiest way in at that size.
