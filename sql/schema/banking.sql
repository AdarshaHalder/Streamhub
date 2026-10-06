-- Scenario 1 schema: accounts and money transfers between them.
CREATE TABLE accounts (
  account_id   TEXT PRIMARY KEY,
  holder_name  TEXT NOT NULL
);

CREATE TABLE transactions (
  txn_id        INTEGER PRIMARY KEY,
  from_account  TEXT    NOT NULL REFERENCES accounts(account_id),
  to_account    TEXT    NOT NULL REFERENCES accounts(account_id),
  amount        NUMERIC NOT NULL CHECK (amount > 0),
  txn_time      TEXT    NOT NULL,            -- ISO-8601 'YYYY-MM-DD HH:MM:SS' (UTC)
  CHECK (from_account <> to_account)
);

-- Supports the self-join on (sender, receiver, time).
CREATE INDEX idx_txn_pair_time ON transactions (from_account, to_account, txn_time);
