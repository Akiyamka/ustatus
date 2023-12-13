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

DROP TABLE IF EXISTS `groups`;

CREATE TABLE IF NOT EXISTS `groups` (
  `id` integer PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `description` text,
);

ALTER TABLE
  `history`
ADD
  `check_id` integer REFERENCES `checks` (`id`),
  `group_id` integer REFERENCES `groups` (`id`);

INSERT INTO
  `checks` (name, description, url, parameters)
VALUES
  (
    'Disaster.ninja test stage',
    'test-apps-ninja01.konturlabs.com',
    'https://test-apps-ninja01.konturlabs.com',
    NULL
  ),
  (
    'App config',
    '/apps/configuration',
    'https://test-apps-ninja01.konturlabs.com/active/api/apps/configuration?appId=',
    NULL
  ),
  (
    'Event feed',
    '/events/user_feeds',
    'https://test-apps-ninja01.konturlabs.com/active/api/events/user_feeds',
    NULL
  ),
  (
    'Layers API',
    '/layers/search/global',
    'https://test-apps-ninja01.konturlabs.com/active/api/layers/search/global',
    '{"headers": { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0","Accept": "*/*","Accept-Language": "en-US,en;q=0.5","Content-Type": "application/json","Sec-Fetch-Dest": "empty","Sec-Fetch-Mode": "cors","Sec-Fetch-Site": "same-origin","Pragma": "no-cache","Cache-Control": "no-cache"},"body": "{\"appId\":\"58851b50-9574-4aec-a3a6-425fa18dcb54\"}","method": "POST"}'
  ),
  (
    'Tiles API',
    '/tiles/bivariate/v1/1/1/0.mvt',
    'https://test-apps-ninja01.konturlabs.com/active/api/tiles/bivariate/v1/1/1/0.mvt?indicatorsClass=general',
    NULL
  ),
  (
    'Insights',
    '/polygon_details/v2',
    'https://test-apps-ninja01.konturlabs.com/active/api/polygon_details/v2',
    '{"headers":{"Accept-Language":"en-US,en;q=0.5","Content-Type":"application/json","Sec-Fetch-Mode":"cors","Sec-Fetch-Site":"same-origin","Pragma":"no-cache","Cache-Control":"no-cache"},"body":"{\"appId\":\"58851b50-9574-4aec-a3a6-425fa18dcb54\",\"features\":{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"properties\":{},\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[107.68641365450416,24.270596273473146],[107.98475363363711,23.99833503262884],[108.12423726024497,24.341218442510936],[107.68641365450416,24.270596273473146]]]}}],\"hash\":\"47396e06\"}}","method":"POST"}'
  );