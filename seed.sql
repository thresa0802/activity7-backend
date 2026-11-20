-- Inserts the starting records only when the table is empty
INSERT INTO records (title, category, description, status)
SELECT * FROM (VALUES
  ('Wi-Fi not connecting', 'Network', 'The Wi-Fi in Lab 2 shows no internet access.', 'Pending'),
  ('Install Python', 'Software', 'Python is missing on the lab computers in Room B4.', 'In progress'),
  ('Broken keyboard', 'Hardware', 'Several keys on the keyboard at desk 5 do not work.', 'Pending'),
  ('Email login problem', 'Software', 'I cannot sign in to my student email account.', 'Completed'),
  ('Projector not showing', 'Hardware', 'The projector in Hall A shows a blue screen only.', 'In progress'),
  ('Slow internet in library', 'Network', 'The internet is very slow in the library after 2 PM.', 'Pending'),
  ('Antivirus update failed', 'Software', 'The antivirus on the office computer cannot update.', 'Completed'),
  ('Printer paper jam', 'Hardware', 'The printer in the admin office keeps jamming paper.', 'Pending')
) AS v(title, category, description, status)
WHERE NOT EXISTS (SELECT 1 FROM records);
