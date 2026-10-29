#!/bin/sh
# Opens every source the stage-3 research could not fetch automatically.
# For each tab, save the file named in the list below into
# ~/Downloads/steelview-sources/ (any filename is fine).
# Web pages with no download: press Cmd-P and choose "Save as PDF".
set -e
mkdir -p "$HOME/Downloads/steelview-sources"
while IFS='|' read -r what url; do
  case "$what" in ''|'#'*) continue ;; esac
  echo "-> $what"
  open "$url"
  sleep 1
done <<'LIST'
# --- UK immigration ---
OBR March 2026 forecast: the main PDF                 |https://obr.uk/efo/economic-and-fiscal-outlook-march-2026/
OBR Fiscal risks Sep 2024: "Chart and table data" xlsx (search result)|https://www.google.com/search?q=OBR+Fiscal+risks+and+sustainability+September+2024+chart+data
OBR box on government investment: Cmd-P, Save as PDF  |https://obr.uk/box/international-comparisons-of-government-investment/
NHS workforce statistics: latest "staff by nationality" file|https://digital.nhs.uk/data-and-information/publications/statistical/nhs-workforce-statistics
GP workforce: latest bulletin page, Cmd-P             |https://digital.nhs.uk/data-and-information/publications/statistical/general-and-personal-medical-services
Commons Library CBP-7783 (NHS staff from overseas): PDF|https://commonslibrary.parliament.uk/research-briefings/cbp-7783/
OECD International Migration Outlook 2025: statistical annex (search result)|https://www.google.com/search?q=OECD+International+Migration+Outlook+2025+statistical+annex
OECD Health at a Glance 2025: migration of doctors and nurses chapter, Cmd-P|https://www.oecd.org/en/publications/2025/11/health-at-a-glance-2025_a894f72e/full-report/international-migration-of-nurses_9f4ba769.html
HESA finance: table 7 (income by source) csv          |https://www.hesa.ac.uk/data-and-analysis/finances
Skills for Care 2026 report: full PDF                 |https://www.skillsforcare.org.uk/Adult-Social-Care-Workforce-Data/Workforce-intelligence/publications/national-information/The-state-of-the-adult-social-care-sector-and-workforce-in-England.aspx
CPS "Here to stay": PDF                               |https://cps.org.uk/wp-content/uploads/2025/09/Here-to-stay.pdf
Reform UK April 2026 Boriswave cost report (search result): PDF|https://www.google.com/search?q=Reform+UK+Boriswave+cost+report+April+2026+622bn
Royal Society visa costs 2025: PDF                    |https://royalsociety.org/-/media/policy/publications/2025/summary-of-visa-costs-analysis-2025.pdf
MI5 latest threat update (Director General speech): Cmd-P|https://www.mi5.gov.uk/news
# --- UK asylum ---
Commons Library CBP-10376: PDF                        |https://commonslibrary.parliament.uk/research-briefings/cbp-10376/
Commons Library CBP-8062: PDF                         |https://commonslibrary.parliament.uk/research-briefings/cbp-8062/
Commons Library CBP-10940: PDF                        |https://commonslibrary.parliament.uk/research-briefings/cbp-10940/
Australian Parliament: boat arrivals and turnbacks: Cmd-P|https://www.aph.gov.au/About_Parliament/Parliamentary_Departments/Parliamentary_Library/pubs/rp/rp1617/Quick_Guides/BoatTurnbacks
Council of Europe Chisinau Declaration (15 May 2026): text, Cmd-P (search result)|https://www.google.com/search?q=Council+of+Europe+Chisinau+Declaration+15+May+2026+text
LIST
echo
echo "Done. Save each file into: $HOME/Downloads/steelview-sources/"
echo "Then tell Claude 'downloads are in'."
