-- Rebrand: TechEdu -> Emtech Digital Academy.
--
-- The old name only ever appears as data in certificates.issuer (a stored
-- display string, default 'TechEdu'). Renaming it here is a data migration,
-- not a schema change — update the default for future rows, then backfill
-- existing ones that still say the old name.

alter table certificates alter column issuer set default 'Emtech Digital Academy';

update certificates set issuer = 'Emtech Digital Academy' where issuer = 'TechEdu';
