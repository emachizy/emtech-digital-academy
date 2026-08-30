-- Rebrand continued (see 0007, 0008): a systematic scan of every text/jsonb
-- column turned up two more seeded rows still carrying the old name that
-- the earlier two migrations' targeted updates didn't cover.

update portfolio_profiles
set bio = replace(bio, 'TechEdu', 'Emtech Digital Academy')
where bio like '%TechEdu%';

update challenge_attempts
set response = replace(response, 'TechEdu', 'Emtech Digital Academy')
where response like '%TechEdu%';
