DROP TABLE IF EXISTS `history`;

CREATE TABLE IF NOT EXISTS `history` (
  `record_id` integer PRIMARY KEY,
  `status_code` integer,
  `comment` text,
  `created_at` timestamp
);

CREATE TABLE IF NOT EXISTS `checks` (
  `id` integer PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `description` text,
  `url` text NOT NULL,
  `parameters` text,
  `created_at` timestamp
);

ALTER TABLE
  `history`
ADD
  `check_id` integer REFERENCES `checks` (`id`);

INSERT INTO
  `checks` (name, description, url)
VALUES
  (
    'disaster_ninja',
    'disaster.ninja page',
    'https://disaster.ninja'
  )