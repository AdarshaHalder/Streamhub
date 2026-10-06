-- Seed data for Scenario 1. Each block is a deliberate positive or negative case.
INSERT INTO accounts (account_id, holder_name) VALUES
  ('ACC001', 'Asha Verma'),    ('ACC002', 'Bilal Khan'),
  ('ACC003', 'Chitra Nair'),   ('ACC004', 'Dev Malhotra'),
  ('ACC005', 'Esha Kapoor'),   ('ACC006', 'Farhan Ali'),
  ('ACC007', 'Gauri Joshi'),   ('ACC008', 'Harsh Vardhan'),
  ('ACC009', 'Ira Bose'),      ('ACC010', 'Jay Sen');

INSERT INTO transactions (txn_id, from_account, to_account, amount, txn_time) VALUES
  -- MATCH: 5% lower, returned after 9.5 hours
  (1,  'ACC001', 'ACC002', 10000.00, '2024-03-01 09:00:00'),
  (2,  'ACC002', 'ACC001',  9500.00, '2024-03-01 18:30:00'),
  -- MATCH (boundaries): exactly 10% lower, exactly 24 hours later — both inclusive
  (3,  'ACC003', 'ACC004', 50000.00, '2024-03-02 10:00:00'),
  (4,  'ACC004', 'ACC003', 45000.00, '2024-03-03 10:00:00'),
  -- NO MATCH: same amount but 24h + 1s later
  (5,  'ACC005', 'ACC006', 20000.00, '2024-03-04 08:00:00'),
  (6,  'ACC006', 'ACC005', 20000.00, '2024-03-05 08:00:01'),
  -- NO MATCH: 10.33% lower, within an hour
  (7,  'ACC007', 'ACC008', 30000.00, '2024-03-06 12:00:00'),
  (8,  'ACC008', 'ACC007', 26900.00, '2024-03-06 13:00:00'),
  -- NO MATCH: two transfers in the same direction are not a round trip
  (9,  'ACC001', 'ACC003', 15000.00, '2024-03-07 09:00:00'),
  (10, 'ACC001', 'ACC003', 15000.00, '2024-03-07 10:00:00'),
  -- NO MATCH: money moves on to a third party (A→B→C), not back to A
  (11, 'ACC002', 'ACC005',  8000.00, '2024-03-08 09:00:00'),
  (12, 'ACC005', 'ACC009',  8000.00, '2024-03-08 10:00:00'),
  -- MATCH: return is exactly 10% HIGHER — "similar" is symmetric
  (13, 'ACC009', 'ACC010', 12000.00, '2024-03-09 20:00:00'),
  (14, 'ACC010', 'ACC009', 13200.00, '2024-03-10 08:00:00'),
  -- MATCH (ordering): txn 16 happens first, so 16 is the outbound leg and 15 the return
  (15, 'ACC004', 'ACC006',  5000.00, '2024-03-11 10:00:00'),
  (16, 'ACC006', 'ACC004',  5000.00, '2024-03-11 09:00:00'),
  -- MATCH ×2: one outbound transfer, two qualifying returns — both pairs reported
  (17, 'ACC002', 'ACC001',  7000.00, '2024-03-12 09:00:00'),
  (18, 'ACC001', 'ACC002',  7200.00, '2024-03-12 15:00:00'),
  (19, 'ACC001', 'ACC002',  6800.00, '2024-03-12 20:00:00');
