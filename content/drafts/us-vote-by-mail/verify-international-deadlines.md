# Verification: international postal voting (R5) and receipt deadlines / counting speed (R3)

Checked 2026-10-26. Candidates: D63, D61, D62, D64, D5, D44, D23, D22, D43. None of these figures were in the voter-ID quote file (`voterid-sources.md` has no matching IDEA, French, German, Swiss, NCSL Table 11/16 or MIT count-speed entries), so everything below was fetched fresh.

## D63. International IDEA, in-country postal voting — **corrected** (counts now extracted; denominator added)

- **Counts, Aug 2025 fact sheet:** 11 countries allow in-country postal voting for all voters and 21 for some voters, 32 in total. The text layer of the PDF lists them, so no image transcription was needed.
  > As of 2025, 32 countries offer mail-in (postal) voting in different shapes and forms. Countries that offer postal voting commonly do this as an alternative to, not as a replacement of, voting in polling stations for national elections.
  — Global postal voting: Special Voting Arrangements data, International IDEA, 2025-08-28 (PDF created; "Postal data last updated as of 20 August 2025"), https://www.idea.int/sites/default/files/2025-09/2025-International-IDEA-Special-Voting-Arrangements-postal-voting-data.pdf [fetched 2026-10-26]
  - **All voters (11):** Canada, Germany, Iceland, Korea (Republic of), Liechtenstein, Luxembourg, New Zealand, Poland, Switzerland, United Kingdom, United States.
  - **Some voters, "based on country-specific criteria" (21):** Australia, Austria, Bangladesh, Bhutan, Fiji, France, Greece, India, Ireland, Japan, Lithuania, Malaysia, Marshall Islands, Micronesia (Federated States of), Netherlands, Pakistan, Palau, Papua New Guinea, Slovenia, Spain, Zimbabwe.
  > Postal data last updated as of 20 August 2025.
  — same PDF.
- **Denominator: 204 countries.** The fact sheet's map says "Countries covered 32", but that counts only the countries that allow postal voting. The tool as a whole codes 204 countries:
  > International IDEA's comparative SVA data provides insight into postal, early, mobile and proxy voting for in-country voting in 204 countries.
  — Special Voting Arrangements (overview), International IDEA, page built on the Nov 2023 handbook; infographics use March 2021 data, https://www.idea.int/data-tools/tools/special-voting-arrangements [fetched 2026-10-26]
  - That gives 32 of 204 (about 16%) allowing any in-country postal voting, and 11 of 204 (about 5%) allowing it for all voters. These ratios are my arithmetic; IDEA does not print them. The 172 remaining countries have no in-country postal voting under IDEA's coding (by subtraction; IDEA prints no "none" list).
- **OECD comparator, which the source itself supplies (2021 data):**
  > 27% of OECD countries allow in-country postal voting for all voters, while only one country (Liechtenstein) in non-OECD group does the same. In-country postal voting is available for some voters in 24% of OECD countries, while this figure is only 9% in non-OECD countries.
  — same overview page [fetched 2026-10-26]
- **Where the named countries sit (2025):** all voters: US, UK, Germany, Switzerland, Canada. Some voters: France, Australia.
- **On the US:**
  > In two-thirds of the states in the US, any qualified voter can utilize postal voting, while one-third of states require an excuse.
  — same overview page (2021 data; now out of date for the US).
- **Notes:**
  - **2021 and 2025 lists differ.** The 2021 regional text lists Angola and Greenland among "some voters". Neither is in the 2025 list, which adds France and Greece. Both editions have 11 "all voters" countries.
  - **The pie chart disagrees with the list.** The Looker Studio pie embedded in the 2025 PDF shows 37.5% all / 62.5% some, which would be 12 and 20 out of 32. The printed lists give 11 and 21. Cite the lists.
  - **The database page uses 2021 data:** "The infographics on this page are based on data from March 2021."
  - **No machine-readable export found.** The SVA pages embed Google Looker Studio reports (`datastudio.google.com/embed/reporting/...`) and link no CSV.
  - **The candidate file's warning was right.** "France under all voters" is wrong: IDEA puts France under "some voters".
  - **For `mail-exception`:** "as it is in most democracies" holds in IDEA's own framing. Universal postal voting is available in 11 of 204 countries, and in about 27% of OECD members.
- **Postal voting from abroad (separate IDEA dataset, secondary):** the Voting from Abroad Database, question "Voting method", tallies Postal by continent as Africa 2 of 54, Americas 7 of 42, Asia 9 of 48, Europe 29 of 48, Oceania 8 of 16, Other 3 of 10. That sums to 58 of 218 countries researched (my sum). France: "Personal, Proxy, e-voting", with no postal option.
  > Europe 29 (60.4%) 5 (10.4%) …
  — Voting from Abroad Database, question 9377, International IDEA, https://www.idea.int/data-tools/data/question?question_id=9377&database_theme=326 [fetched 2026-10-26]

## D61. France's 1975 abolition of postal voting — **verified** (the fraud wording is now confirmed; no Corsica reference)

- **The government's stated reason in 1988** (the text appears without accents on the Assemblée site):
  > Lors des debats qui ont precede le vote de la loi no 75-1329 du 31 decembre 1975, toutes les tendances politiques representees au Parlement ont unanimement condamne le vote par correspondance, qui etait l'occasion de fraudes graves denoncees apres chaque consultation. Le legislateur a reconnu que cette procedure de vote n'etait pas reellement perfectible, notamment dans la mesure ou elle n'implique a aucun moment la comparution personnelle de l'electeur devant une autorite independante, d'ou la possibilite d'y avoir recours pour faire voter des electeurs fictifs. C'est pourquoi la loi precitee a abroge le vote par correspondance, tout en etendant de facon concomitante le champ d'application du vote par procuration.

  Gloss: during the debates on the law of 31 Dec 1975, every political tendency in Parliament unanimously condemned postal voting, which had given rise to serious fraud denounced after every election. The legislator judged the procedure not genuinely fixable, because the voter never has to appear in person before an independent authority, which made it possible to cast votes for fictitious voters. The law therefore abolished postal voting and at the same time widened proxy voting.
  — Question écrite n° 1703 (M. Pierre-Rémy Houssin), réponse du ministère de l'Intérieur, Assemblée nationale, 9e législature; question published 1988-08-22 (the page gives no date for the answer), https://www.assemblee-nationale.fr/dyn/9/questions/QANR5L9QE1703 [fetched 2026-10-26]
- **Abstention before and after 1975: all eight figures confirmed** (presidential 18.4 → 16.6; legislative 21.5 → 25.7; municipal 23.1 → 21.4; cantonal 39 → 33.6).
  > Le taux moyen des abstentions municipales generales etait de 23,1 p 100 avant l'intervention de la loi du 31 decembre 1975 ; il est de 21,4 p 100 pour les elections municipales generales qui ont eu lieu depuis lors. Pour les elections presidentielles, les taux homologues sont de 18,4 p 100 et de 16,6 p 100 ; pour les elections cantonales generales, de 39 p 100 et de 33,6 p 100 ; pour les elections legislatives generales, de 21,5 p 100 et de 25,7 p 100.

  Gloss: average abstention in municipal elections was 23.1% before the 1975 law and 21.4% since. The matching figures are 18.4% and 16.6% for presidential elections, 39% and 33.6% for cantonal elections, and 21.5% and 25.7% for legislative elections.
  — same source.
  - **Caveat in the source:** the ministry attributes the legislative rise solely to low turnout in June 1988 ("uniquement la consequence de la participation relativement faible enregistree lors des elections legislatives des 5 et 12 juin dernier"; gloss: solely the result of the relatively low turnout at last June's legislative elections), which came soon after the presidential election. The figures are period averages chosen by a government defending abolition, not a controlled comparison.
- **IDEA's wording confirmed. It comes from IDEA's external-voting handbook, so the context is voting from abroad:**
  > In 1975, France introduced personal voting and abolished postal voting because of the incidence of fraud (update was conducted in 2013).
  — IDEA Voting from Abroad answer (France), International IDEA, https://www.idea.int/answer/ans93791603472096 [fetched 2026-10-26]
- **Loi n° 75-1329.** Legifrance returned 403 (the JORF id I tried, JORFTEXT000000334185, is unconfirmed) and has no Wayback snapshot. The law's number and effect are confirmed by two official sources: the 1988 answer above, and the 2020 bill:
  > Le vote par correspondance a en effet été supprimé en France pour les élections politiques par la loi n° 75-1329 du 31 décembre 1975.

  Gloss: postal voting was abolished in France for political elections by law no. 75-1329 of 31 Dec 1975.
  — Proposition de loi n° 3039, Assemblée nationale, 2020-06-02, https://www.assemblee-nationale.fr/dyn/15/textes/l15b3039_proposition-loi.pdf [fetched 2026-10-26]
- **2020 restoration bill: correction, it was not merely "not adopted".** The Assemblée rejected it on 3 Feb 2022.
  > L’objet de cette proposition de loi est de rétablir un droit qui existait jusqu’au milieu des années 70 : le vote par correspondance.

  Gloss: the purpose of this bill is to restore a right that existed until the mid-1970s, postal voting.
  — PPL n° 3039 (Mignola, Barrot, MoDem group), same PDF. The exposé cites Germany ("28,6 % des votes" in 2017) and US all-mail states "sans fraudes majeures" (without major fraud).
  > Proposition de loi rejetée par l'Assemblée nationale, visant à rétablir le vote par correspondance le 3 février 2022, T.A. n° 783

  Gloss: bill to restore postal voting, rejected by the National Assembly on 3 Feb 2022 (adopted text no. 783).
  — Dossier législatif "Vote par correspondance", Assemblée nationale, https://www.assemblee-nationale.fr/dyn/15/dossiers/vote_par_correspondance [fetched 2026-10-26]
- **2023 Senate bill: narrower than the candidate file implies, and now lapsed.** It covered only the presidential election, through an organic law.
  > Proposition de loi organique visant à instaurer le vote par correspondance pour l’élection du Président de la République

  Gloss: organic bill to introduce postal voting for the presidential election.
  — Texte n° 116 (2023-2024), M. Éric Kerrouche, Sénat, filed 2023-11-15, https://www.senat.fr/leg/ppl23-116.html [fetched 2026-10-26]
  > Cette proposition de loi organique est caduque

  Gloss: this organic bill has lapsed.
  — Dossier législatif ppl23-116, Sénat, page updated 2026-10-16, https://www.senat.fr/dossier-legislatif/ppl23-116.html [fetched 2026-10-26]
- **Notes:**
  - **The stated reasons no longer conflict at the primary level.** The official 1988 reason is fraud: serious fraud after every election, and fictitious voters made possible because no voter ever appears in person. Wahlrecht.de's postal-worker account is secondary and unsupported here.
  - **No fetched source mentions Corsica.** Drop any Corsica claim.
  - **The 1988 answer also says France expanded proxy voting at the same time.** That matters for any "France simply removed remote voting" framing.
  - **IDEA's 2025 list puts France under "some voters" (D63).** Some in-country postal option now exists, so "France has no postal voting" should not be stated flatly. I did not identify which group is covered.

## D62. Britain's postal-vote fraud cases and reforms — **corrected** (the 2013 judgment is Woking, not Slough; the usage series was mislabelled)

- **Birmingham 2005: "banana republic" confirmed at the source text, in the judgment's Afterword.**
  > Anybody who has sat through the case I have just tried and listened to evidence of electoral fraud that would disgrace a banana republic would find this statement surprising. To assert that "The systems already in place to deal with the allegations of electoral fraud are clearly working" indicates a state not simply of complacency but of denial.
  — Election Petition Judgment, Bordesley Green & Aston Wards, Birmingham (Richard Mawrey QC), "Afterword"; unofficial full-text mirror at law.slough.info, Wayback snapshot 2016-03-04, https://web.archive.org/web/20160304132104/http://law.slough.info/law44/law44p072.php [fetched 2026-10-26]
  - The same Afterword:
    > All political parties welcomed and supported postal voting on demand. Until very recently, none has treated electoral fraud as representing a problem.
  - **Paragraph number not confirmed.** The mirror does not number the Afterword, so para 716 (from Wikipedia) is unconfirmed. Not checked on bailii or the National Archives, where the 2005 judgment does not appear to be published.
- **Correction: [2013] EWHC 2572 (QB) is not the Slough case.** It is *Ali v Bashir*, the Woking petition (Maybury and Sheerwater ward, May 2012 election), decided 2013-07-29. The Slough Election Case (Central ward, Slough) was heard in 2008. The outline's "Slough in 2013" should read "Slough in 2008" and, separately, "Woking in 2013". The paras 14–16 quotes are right, but they come from the Woking judgment describing Birmingham:
  > I identified some fourteen different ways in which the system could be successfully defrauded … In that judgment I held that in the two wards concerned (and in all probability in a number of other Birmingham wards) the Labour party candidates and their associates had falsified literally thousands of votes to secure election to the City Council. In the two wards challenged it seemed likely that as many as half the votes cast for the winning candidates had been the product of fraud.
  — *Ali v Bashir* [2013] EWHC 2572 (QB), paras 14–15, The National Archives (Find Case Law), 2013-07-29, https://caselaw.nationalarchives.gov.uk/ewhc/qb/2013/2572 [fetched 2026-10-26]
  > The problem was universal and had the potential to undermine the democratic process.
  — same, para 16.
  > In 2008 I heard the Slough Election Case. … the main fraud was a fifteenth, the use of false names on the electoral register for which I borrowed the Australian term ‘roll-stuffing’ … the successful candidate and his team had registered several hundred voters in the Central Ward who did not reside at the addresses stated and who, in many cases, were the figments of the candidate’s imagination.
  — same judgment (the Slough paragraph, around paras 20–21).
  - **Woking outcome:** the election was declared "avoided by such corrupt or illegal practices" and also avoided on the ground of general corruption (same judgment, conclusions).
- **Tower Hamlets 2015: para 64 confirmed, and the election was voided.**
  > By the 21st century, however, a combination of the extremely lax rules relating to the registration of electors and the introduction of postal voting on demand made personation once again viable. The ease of postal vote fraud and the difficulty of policing it led to such a great upsurge in personation that, in the Birmingham Case, the number of false votes was virtually half of all votes recorded as having been cast for the winning candidates.
  — *Erlam v Rahman* [2015] EWHC 1215 (QB), para 64, The National Archives, 2015-04-23, https://caselaw.nationalarchives.gov.uk/ewhc/qb/2015/1215 [fetched 2026-10-26]
  > Their effect is firstly that Mr Rahman’s election as Mayor on 22 May 2014 was void, that is to say, it is as if it had never taken place.
  — same judgment, conclusions.
- **Electoral Administration Act 2006, s.14: confirmed.** It is titled "Absent voting: personal identifiers".
  > contains the applicant's signature and date of birth and
  — Electoral Administration Act 2006, s.14, legislation.gov.uk, https://www.legislation.gov.uk/ukpga/2006/22/section/14 [fetched 2026-10-26]. Signature can be waived for disability or inability to read or write.
- **Elections Act 2022: confirmed.**
  - **The three-year lapse is in Schedule 3, brought into force by s.3 on 31 Oct 2023:**
    > the period ending with the third 31 January following the date on which the application is granted
    — Elections Act 2022, Sch.3, https://www.legislation.gov.uk/ukpga/2022/37/schedule/3 [fetched 2026-10-26]
  - **Campaigner handling (s.4):**
    > A person who is a political campaigner in respect of a relevant election commits an offence if the person handles a postal voting document that has been issued to another person for use in that election.
    — Elections Act 2022, s.4, https://www.legislation.gov.uk/ukpga/2022/37/section/4 [fetched 2026-10-26]
  - **Hand-in limit (s.5):** the Act sets "more than the prescribed number of electors" and leaves the number to regulations. The "own plus five" figure is still per Full Fact; I did not fetch the regulations.
- **Postal-vote share: corrected.** Full Fact's 15.3% (2010) and 18% (2017) do not match the official series of postal votes as a share of valid votes. They appear to be postal votes issued as a share of the electorate, though Full Fact labels them "voted by post". Use the Commons Library table:

  | Year | Postal votes as % of valid votes |
  |---|---|
  | 1997 | 2.3% |
  | 2001 | 5.0% |
  | 2005 | 12.7% |
  | 2010 | 18.8% |
  | 2015 | 20.5% |
  | 2017 | 21.7% |
  | 2019 | 21.0% |

  > 2010 6,996,006 5,818,853 5,596,865 80.0% 18.8% … 2017 8,412,060 7,155,315 6,986,581 83.1% 21.7% … 2019 8,034,718 6,866,494 6,717,670 83.6% 21.0%
  — UK Election Statistics: 1918-2023, A Long Century of Elections, CBP-7529, Table 4 "Postal Ballot Papers in UK Elections, 1945-2019", House of Commons Library, 2023-08-09, https://researchbriefings.files.parliament.uk/documents/CBP-7529/CBP-7529.pdf (direct 403; Wayback 2026-01-16) [fetched 2026-10-26]
  - The series runs 1945–2019. The 1945–1997 range is 1.6%–3.9%. No official 2024 figure was found.
  - **2019 issued and used:** the table gives 8,034,718 issued and 6,717,670 counted. Full Fact's "8.2 million issued, 6.7 million" is close but its issued figure is higher.
- **Recent fraud counts: confirmed at the Electoral Commission (archived).**
  > In the past 5 years, there is no evidence of large-scale electoral fraud. … Of the 1,462 cases of alleged electoral fraud reported to police between 2019 and 2023, 11 led to convictions and the police issued 4 cautions.
  — Electoral fraud data, Electoral Commission, Wayback 2024-12-22, https://www.electoralcommission.org.uk/research-reports-and-data/electoral-fraud-data [fetched 2026-10-26]
  > A total of 9 cases of alleged personation fraud were recorded by police forces in 2023.
  — 2023 electoral fraud data, Electoral Commission, Wayback 2024-12-11, https://www.electoralcommission.org.uk/research-reports-and-data/electoral-fraud-data/2023-electoral-fraud-data [fetched 2026-10-26]. Its table shows "Postal 6 — No further action: 5, Locally resolved: 1".
- **Blocked:**
  - commonslibrary.parliament.uk returned 403. Its archived 2014 insight "Postal voting in the UK" confirms 18.8% for 2010.
  - The Electoral Commission 2024 general election report returned 403 directly and 404 on Wayback.
  - Legifrance returned 403.

## D64. Germany and Switzerland — **verified** for Germany (official file); **Switzerland stays journalism-sourced**, with a fraud case added

- **German postal share: the full official series is confirmed.** The candidate file's figures all match. The source column is "Anteil Wählende mit Briefwahlschein an den Wählenden insgesamt" (gloss: share of voters who voted with a postal-ballot certificate, out of all voters).
  > Bund ;2021;22.075.042 ;47,3 … Bund ;2025;18.497.796 ;37,0
  — Wahlberechtigte mit Wahlschein, Wählende mit einfachem und Briefwahlschein seit 1957 (btw_ab57_wahlschein.csv), Die Bundeswahlleiterin, Wiesbaden 2025, https://bundeswahlleiterin.de/dam/jcr/21e4d643-194f-4317-b31e-70846d095ec0/btw_ab57_wahlschein.csv (linked from https://bundeswahlleiterin.de/bundestagswahlen/2025/ergebnisse/weitere-ergebnisse.html) [fetched 2026-10-26]

  | Year | % | Year | % | Year | % |
  |---|---|---|---|---|---|
  | 1957 | 4.9 | 1976 | 10.7 | 1998 | 16.0 |
  | 1961 | 5.8 | 1980 | 13.0 | 2002 | 18.0 |
  | 1965 | 7.3 | 1983 | 10.5 | 2005 | 18.7 |
  | 1969 | 7.1 | 1987 | 11.1 | 2009 | 21.4 |
  | 1972 | 7.2 | 1990 | 9.4 | 2013 | 24.3 |
  | | | 1994 | 13.4 | 2017 | 28.6 |
  | | | | | 2021 | 47.3 (22.08m) |
  | | | | | 2025 | 37.0 (18.50m) |

  - 1957–1987 covers West Germany only. The companion file btw_ab57_brief_urne.csv gives the same percentages when recomputed from second-vote voters in postal districts, except that its 2021 postal count is 22,146,336.
- **No reason needed since 2008: confirmed.** The law changed on 17 Mar 2008 for the Bundestag, and the Bundeswahlordnung followed on 3 Dec 2008. The 2013 court describes the matching change to the European-election rules:
  > Damit bedarf die Erteilung eines Wahlscheines als Voraussetzung insbesondere der Briefwahl nicht mehr der Glaubhaftmachung von Gründen.

  Gloss: issuing a voting certificate, the precondition for postal voting in particular, therefore no longer requires reasons to be shown.
  — BVerfG, Beschluss 2 BvC 7/10, 2013-07-09, Rn. 10 (citing the BWahlG change "Art. 1 Nr. 6 des Gesetzes zur Änderung des Wahl- und Abgeordnetenrechts vom 17. März 2008 <BGBl I S. 394>"; gloss: Art. 1 no. 6 of the Act amending electoral and parliamentary law of 17 Mar 2008), https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/DE/2013/07/cs20130709_2bvc000710.html [fetched 2026-10-26]
- **BVerfG 2013 quotes: confirmed (Rn. 13).**
  > Bei der Briefwahl ist die öffentliche Kontrolle der Stimmabgabe zurückgenommen (vgl. BVerfGE 123, 39 <75>). Auch ist die Integrität der Wahl nicht gleichermaßen gewährleistet wie bei der Urnenwahl im Wahllokal (vgl. BVerfGE 59, 119 <127>). Die Zulassung der Briefwahl dient aber dem Ziel, eine möglichst umfassende Wahlbeteiligung zu erreichen und damit dem Grundsatz der Allgemeinheit der Wahl Rechnung zu tragen.

  Gloss: with postal voting, public control over how the vote is cast is reduced, and the integrity of the election is not guaranteed to the same degree as at the polling station. Postal voting is permitted, however, to achieve the widest possible participation, serving the principle of universal suffrage.
  — same, Rn. 13.
  > Dabei muss er jedoch dafür Sorge tragen, dass keiner der vor allem das Demokratieprinzip konkretisierenden Wahlrechtsgrundsätze unverhältnismäßig eingeschränkt wird oder in erheblichem Umfang leer zu laufen droht (vgl. BVerfGE 59, 119 <125>). Das ist derzeit jedoch offenkundig nicht der Fall.

  Gloss: the legislator must ensure that none of the electoral principles is disproportionately restricted or at risk of being substantially hollowed out. That is, however, plainly not the case at present.
  — same, Rn. 13.
- **Notes:**
  - **The case concerned the 2009 European Parliament election (EuWO), not a Bundestag election.**
  - **Useful for the viewpoints:** Rn. 16 records that the legislator saw a large rise in postal voting as potentially in conflict with the "verfassungsrechtlichen Leitbild der Urnenwahl" (the constitutional model of ballot-box voting). It expected no large rise, "Dass ein erheblicher Anstieg der Briefwahlbeteiligung durch den Wegfall der Glaubhaftmachung von Antragsgründen jedoch nicht zu befürchten ist" (gloss: that a significant rise in postal participation from dropping the reasons requirement was not to be feared). The official series then rose from 21.4% (2009) to 28.6% (2017) and 47.3% (2021).
- **Switzerland: share of votes cast by post (journalism; no federal statistic found).**
  > Cantons report that around 90% of citizens now vote by post, and some have reported figures up to 97% (Aargau, 2017).
  — How the world’s most frequent voters handle postal ballots, SWI swissinfo.ch, 2020-10-02, https://www.swissinfo.ch/eng/politics/how-the-world-s-most-frequent-voters-handle-postal-ballots/46070666 [fetched 2026-10-26]
  > It’s estimated that over 90% of voters in Switzerland cast their ballots via mail – a proportion which stands out globally, yet which hasn’t led to major political debates about security or fraud.
  — How does postal voting work in Switzerland?, SWI swissinfo.ch, 2026-09-17, https://www.swissinfo.ch/eng/swiss-democracy/how-does-postal-voting-work-in-switzerland/92073387 [fetched 2026-10-26]
  - The 2020 article also gives cantonal and city figures for Sept 2020: Bern city 93.3%, canton Zurich 92.6%, Ticino 93.5%, Basel City just under 96%. It notes fraud cases: "In Bern, 300 votes in the 2016 local elections were declared void after investigators discovered they all had the same handwriting", plus a 2019 Geneva electoral-office suspicion.
- **Swiss fraud case: Upper Valais 2017 (Brig-Glis, Naters, Visp).**
  > Anfang September verurteilte das Bezirksgericht in Brig den angeklagten Wahlfälscher zu zwölf Monaten Gefängnis bedingt mit drei Jahren Bewährung und einer Busse von 2000 Franken. … Der Schwindel flog auf, nachdem 269 Bürger den Gemeinden gemeldet hatten, keine Wahlunterlagen erhalten zu haben. … Die Justiz konnte dem Mann, der zum Zeitpunkt des Wahlbetrugs Mitglied der SVP war, die Fälschung von mindestens 193 Wahlzetteln nachweisen.

  Gloss: in early September the Brig district court sentenced the vote-forger to 12 months, suspended with three years' probation, and a CHF 2,000 fine. The fraud came to light after 269 citizens told their municipalities they had not received voting papers. The court could prove that the man, an SVP member at the time, forged at least 193 ballots.
  — Wallis leitet nach Wahlbetrug Administrativuntersuchung ein (SDA), SWI swissinfo.ch, 2018-09-20, https://www.swissinfo.ch/ger/wallis-leitet-nach-wahlbetrug-administrativuntersuchung-ein/44414482 [fetched 2026-10-26]
  > Laut Anklageschrift geht die Staatsanwaltschaft davon aus, dass der Angeklagte zwischen dem 16. Februar 2017 und dem 5. März 2017 in Brig-Glis und Naters mindestens 199 Wahlzettel gestohlen, ausgefüllt und dann auf den Gemeindeverwaltungen abgegeben hat. Effektiv gelangten rund 150 gefälschte Wahlzettel in die Urnen.

  Gloss: according to the indictment, between 16 Feb and 5 Mar 2017 the accused stole, filled in and handed in at least 199 ballots in Brig-Glis and Naters; about 150 forged ballots actually reached the ballot boxes.
  — Mutmasslicher Wahlfälscher steht vor Gericht, SRF, 2018-08-30, https://www.srf.ch/news/wahlbetrug-im-wallis-mutmasslicher-wahlfaelscher-steht-vor-gericht [fetched 2026-10-26]
  - swissinfo adds that the fraud may have shifted a cantonal-parliament seat from the CSP to the SVP.
- **Not reached:** a Swiss Federal Statistical Office or Federal Chancellery postal-share series. I found no official national figure; postal share is reported by cantons.

## D5. NCSL Table 11 — **verified**

- **Page date and headline counts confirmed:**
  > Thirty-five states require absentee/mail ballots returned by mail to be received on or before Election Day. Fifteen states, plus Guam, Puerto Rico, the Virgin Islands and Washington, D.C., will accept and count a mailed ballot if it is received after Election Day but postmarked on or before (sometimes only before) Election Day.
  — Table 11: Receipt and Postmark Deadlines for Absentee/Mail Ballots, NCSL, updated 2026-09-25, https://www.ncsl.org/elections-and-campaigns/table-11-receipt-and-postmark-deadlines-for-absentee-mail-ballots [fetched 2026-10-26]
- **The 15 states, from the table:** AK, CA, IL, KS, MD, MA, MS, NV, NJ, NY, OR, TX, VA, WA, WV. Kansas is counted among the 15 because of the injunction. The windows match the candidate file: TX day after; NV fourth day; CA seven days; NY seven days; AK 10 days; IL 14 days; WA "no later than the day before certification, which is 21 days after a general election". Not listed in the candidate file: MD 10 days, MA 3 days, MS 5 business days, NJ 144 hours, OR 7 days, VA third day, WV before the canvass (fifth day).
- **2025 changes confirmed:**
  - **North Dakota:**
    > (2025) changed the receipt deadline for absentee ballots to be received before the close of polls on Election Day.
  - **Ohio:**
    > (2025) changed the receipt deadline for most absentee ballots to the close of polls on Election Day. Previously, ballots could be received four days after the election as long as they were postmarked by Election Day. The bill maintains a carve-out for military and overseas voters’ ballots, which will still be accepted if received within the four-day post-election period.
  - **Utah:**
    > (2025) required ballots to be received by the election officer by 8 p.m. on Election Day.
  - **Kansas:**
    > In July 2026, a district court judge in Kansas issued a preliminary injunction on the law requiring absentee ballots to be received by the close of polls on Election Day. … Under the injunction, ballots can be counted if they are postmarked by Election Day and received within three days of an election.
  — all from the same page.
- **Notes:**
  - **Military and overseas ballots:** the page has a separate section, under which 11 states do not require a postmark for at least some military or overseas ballots. This supports reconciling NCSL's 15 with *Watson*'s "roughly 30 States".
  - **Watson:** the page notes "On June 29, 2026, the U.S. Supreme Court ruled in Watson v. RNC that federal law does not preempt state policies allowing for post-Election Day receipt".

## D44. Late-arriving ballots over time and in 2026 — **verified** (one detail corrected)

- **NCSL series confirmed. It adds a January 2020 row (35 states, and 15 states plus DC):**
  > November 2016 37 states and D.C. 13 states … January 2020 35 states 15 states and D.C. … November 2020 29 states 21 states and D.C. … November 2022 31 states 19 states and D.C. … November 2024 32 states 18 states and D.C. … November 2026 (expected) 35 states 15 states and D.C.
  — Evolution of Absentee/Mail Voting Laws, 2016–2026, NCSL, updated 2026-08-26, https://www.ncsl.org/elections-and-campaigns/evolution-of-absentee-mail-voting-laws-2016-2026 [fetched 2026-10-26]
  > As a result, the count of states requiring Election Day receipt for the November 2026 election is expected to be roughly the same as it was in November 2016, despite a dip in that count around the peak of the pandemic.
  — same.
  - **DC placement differs.** This page counts DC on the Election Day side in 2016 and on the post-Election Day side from 2020. It excludes military and overseas deadlines.
- **2026 late rejections confirmed; Wisconsin corrected.** Wisconsin's comparison is with the 2023 spring election, not 2024.
  > In Wisconsin … lateness accounted for about 5,000 rejected mail ballots in the spring primary this year, or 78% of all tossed ballots. During the last spring election, in 2023, the figure was roughly 2,300, or 47% of all tossed votes.
  > In Michigan’s primary earlier this month, more than 10,000 mail ballots were rejected for arriving after the state’s deadline of 8 p.m. on Election Day. That is nearly double the number of ballots rejected in 2024. In Washington, the number of late-arriving mail ballots increased from about 16,000 to more than 20,000 in the same period.
  > In Washington’s primary earlier this year, 75% of rejected mail ballots were tossed because they arrived too late.
  > In a statement, the Postal Service countered claims that the agency has become unreliable by noting that more than 95% of mail ballots have arrived on time in recent elections.
  — New York Times, reprinted by The Philadelphia Inquirer, 2026-08-31, https://www.inquirer.com/politics/more-late-mail-in-votes-rejected-trump-postal-service-slow-drop-box-20260831.html [fetched 2026-10-26]
  - **Wording:** the NYT says Washington's "late-arriving mail ballots" increased; it does not say "late rejections".
- **Not re-checked (lighter touch):** the California SOS unprocessed-ballots report and the *Watson* quote (both D24 or other agents' areas).

## D23. Nevada late arrivals — **verified** (statewide margins still unverified)

> About 9,500 Clark County mail ballots and 2,400 ballots in Washoe County were received post-Election Day out of the nearly 1.3 million ballots cast in both areas. Nevada law allows any mail ballot to be received up to four days after Election Day, as long as it is postmarked by Election Day.
— Was a large percentage of votes received after Election Day in Nevada in 2024?, The Nevada Independent (Gigafact), 2025-01-31, https://thenevadaindependent.com/article/was-a-large-percentage-of-votes-received-after-election-day-in-nevada-in-2024 [fetched 2026-10-26]
- **Headline:** "Less than 1 percent of the ballots cast in Nevada's two largest counties in the 2024 general election were received after Election Day."
- **Margins:** "Rosen ultimately won Clark and Washoe counties by margins far exceeding the number of ballots received post-Election Day." The source gives no number for this.
- **Still unverified:** the "about 2% of mail ballots" figure and the statewide margins (not fetched).

## D22. MIT count-speed article — **verified**

- **National pace, slowest states, and the 75% benchmark:**
  > Nationally, it took only about 2 hours to count a majority of the vote, and only about 3 hours to count 75% of it.
  > Figure 5 shows that every state had counted and reported more than 75% of votes cast for either presidential candidate within about 5 days. After California, the states that took the longest to reach that benchmark were Utah, Arizona, Alaska, Washington, Mississippi, and Maine.
  > Texas and Florida stand out as states that successfully counted an enormous number of votes (both well over ten million) within about a day, and required very few updates after that.
  — How long did it take to count the vote in 2024?, MIT Election Data + Science Lab, 2024-12-06, https://electionlab.mit.edu/articles/how-long-did-it-take-count-vote-2024 [fetched 2026-10-26]
- **Hours to count 95% of the two-party vote, 2020 → 2024 (Table 1):** AZ 73 → 147; GA 18 → 5; MI 17 → 9; NV 159 → 51; NC 3 → 6; PA 49 → 8; WI 8 → 9. All match the candidate file.
- **California:**
  > most large jumps due to California incrementally reporting about a third of its votes over the course of the month after Election Day
  — same.
- **Slow states named by the source:** "Washington, California, Nevada, Arizona, Utah, Colorado, and Alaska". It also names slow non-mail states: "Mississippi, Maine, Maryland, Massachusetts and Michigan were also slower to report".
- **Note:** the hour counts carry the source's own caveat that they "may be overstated by the duration of the media reporting process, plus up to half an hour". Data are Edison via CNN.

## D43. NCSL Table 16 and Stewart — **verified** (one wording fix)

- **Processing counts confirmed:**
  > Forty-four states, Washington, D.C., Puerto Rico and the Virgin Islands permit election officials to begin processing absentee/mail ballots prior to the election
  > Six states permit election officials to begin processing absentee/mail ballots on Election Day, but prior to the closing of the polls: Alabama, Mississippi, New Hampshire, Pennsylvania, West Virginia and Wisconsin.
  — Table 16: When Absentee/Mail Ballot Processing and Counting Can Begin, NCSL, updated 2026-09-15, https://www.ncsl.org/elections-and-campaigns/table-16-when-absentee-mail-ballot-processing-and-counting-can-begin [fetched 2026-10-26]
  - **The candidate file's "plus DC and PR" should also add the Virgin Islands.**
- **Scanning counts confirmed:**
  > The following 33 states, Washington, D.C. and Puerto Rico allow processed ballots to be scanned before Election Day in at least some circumstances … None of these states allow the results of scanned ballots to be viewed or released before the close of polls on Election Day.
  — same.
- **State rules confirmed:**
  - **PA:** "7 a.m. on Election Day."
  - **WI:** "After the polls open on Election Day."
  - **MI:** "Jurisdictions with at least 5,000 people may begin further processing eight days before Election Day".
  - **GA:** "the third Monday before Election Day".
  - **NC:** "beginning the fifth Tuesday before Election Day".
  - **AZ and FL:** "Upon receipt."
  - **NV:** "Signature verification conducted upon receipt."
- **Stewart's 63% vs 78% confirmed. Wording fix:** the phrase is "the gap between states had essentially disappeared", not "essentially disappeared by the 24-hour mark".
  > Within four hours of the polls closing, the average state with no pre-processing had reported 63% of its votes, compared to 78% that didn’t restrict pre-processing. At the twenty-four-hour point, the gap between states had essentially disappeared.
  — Looking back to 2020 for a Guide to How Fast the Votes Will Be Reported in 2024, Charles Stewart III, Election Updates (Caltech/MIT), 2024-10-30, https://electionupdates.caltech.edu/?p=7034 [fetched 2026-10-26]
  - **More from the same post:** "In 2020, seventeen states prohibited processing of mail ballots before Election Day. In 2024, that number declined to seven."

## Summary

- **Status counts:** verified 7 (D61, D64, D5, D44, D23, D22, D43); corrected 2 (D63, D62); unverifiable 0; dropped 0. D64's Swiss share stays journalism-sourced (swissinfo), and the Swiss fraud case is now sourced.
- **Biggest corrections:**
  1. **[2013] EWHC 2572 (QB) is the Woking case (*Ali v Bashir*), not Slough.** Slough was 2008. The outline's "Slough in 2013" is wrong.
  2. **UK postal share:** use the Commons Library series (2010 18.8%, 2017 21.7%, 2019 21.0% of valid votes), not Full Fact's 15.3% and 18%.
  3. **IDEA:** 11 countries allow postal voting for all voters and 21 for some, out of 204 coded. France and Australia are "some voters"; the US, UK, Germany, Switzerland and Canada are "all voters". The PDF's pie (37.5/62.5) contradicts its own lists.
  4. **France:** the 1988 ministerial answer confirms the fraud reasoning ("fraudes graves", "électeurs fictifs"). Corsica is unsupported. The 2020 bill was rejected on 3 Feb 2022. The 2023 Senate bill covered presidential elections only and has lapsed.
  5. **Tower Hamlets:** Rahman's election was declared void (confirmed).
  6. **NYT Wisconsin comparison:** it is against spring 2023, not 2024.
- **Blocked:**
  - Legifrance (403).
  - commonslibrary.parliament.uk and researchbriefings.files.parliament.uk directly (403; Wayback worked).
  - Electoral Commission directly (403); the 2024 GE report also failed on Wayback (404).
  - IDEA Looker Studio embeds (no export).
  - No official Swiss federal postal-share statistic found.
