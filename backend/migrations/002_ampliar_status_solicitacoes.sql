BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE solicitacoes ALTER COLUMN status TYPE varchar(32);
COMMIT;
