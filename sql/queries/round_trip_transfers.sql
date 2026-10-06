-- Scenario 1: round-trip transfers.
-- A sends to B (t1), then B sends a similar amount back to A (t2) within 24 hours.
--   * "similar"  = |t2.amount − t1.amount| ≤ 10% of the original amount (inclusive).
--                  Written as  |diff| * 10 <= original  to avoid floating-point
--                  error from multiplying by 0.10.
--   * "within 24h" = t2 strictly after t1 and no more than 24h later (inclusive).
--                  Ties on timestamp are broken by txn_id so a pair is never
--                  reported twice in both directions.
SELECT
  t1.txn_id                                                AS outbound_txn_id,
  t1.from_account                                          AS account_a,
  t1.to_account                                            AS account_b,
  t1.amount                                                AS sent_amount,
  t1.txn_time                                              AS sent_at,
  t2.txn_id                                                AS return_txn_id,
  t2.amount                                                AS returned_amount,
  t2.txn_time                                              AS returned_at,
  ROUND(ABS(t2.amount - t1.amount) * 100.0 / t1.amount, 2) AS amount_diff_pct,
  ROUND((julianday(t2.txn_time) - julianday(t1.txn_time)) * 24, 2) AS hours_between
FROM transactions AS t1
JOIN transactions AS t2
  ON  t2.from_account = t1.to_account
  AND t2.to_account   = t1.from_account
  AND (t2.txn_time > t1.txn_time OR (t2.txn_time = t1.txn_time AND t2.txn_id > t1.txn_id))
  AND t2.txn_time <= datetime(t1.txn_time, '+24 hours')
  AND ABS(t2.amount - t1.amount) * 10 <= t1.amount
ORDER BY t1.txn_time, t2.txn_time;
