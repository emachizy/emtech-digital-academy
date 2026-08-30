-- Rebrand continued: the old name was also baked into seeded content data
-- (not just the certificates.issuer default fixed in migration 0007).
--
-- lessons.content is JSONB with the old name inside a nested code sample
-- string ("Hello, TechEdu") — a plain text-level replace on its JSON
-- serialization is safe here since the substring is a fixed string with no
-- JSON-special characters, and re-casting back to jsonb re-validates it.

update profiles
set bio = replace(bio, 'TechEdu', 'Emtech Digital Academy')
where bio like '%TechEdu%';

update lessons
set content = replace(content::text, 'Hello, TechEdu', 'Hello, Emtech Digital Academy')::jsonb
where content::text like '%Hello, TechEdu%';

update practice_challenges
set starter = replace(starter, 'TechEdu', 'Emtech Digital Academy'),
    expected_output = 'ymedacA latigiD hcetmE'
where starter like '%TechEdu%';
