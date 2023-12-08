DROP TABLE IF EXISTS `history`;

CREATE TABLE IF NOT EXISTS `history` (
  `record_id` integer PRIMARY KEY,
  `status_code` integer,
  `comment` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS `checks`;

CREATE TABLE IF NOT EXISTS `checks` (
  `id` integer PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `description` text,
  `url` text NOT NULL,
  `parameters` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE
  `history`
ADD
  `check_id` integer REFERENCES `checks` (`id`);

INSERT INTO
  `checks` (name, description, url)
VALUES
  (
    'disaster.ninja page',
    'disaster.ninja page',
    'https://disaster.ninja'
  );

INSERT INTO
  `history` (check_id, status_code, comment)
VALUES
  ('1', '200', 'OK');

INSERT INTO
  `history` (check_id, status_code, comment)
VALUES
  ('1', '200', 'OK');

INSERT INTO
  `history` (check_id, status_code, comment)
VALUES
  ('1', '404', 'NOT FOUND');