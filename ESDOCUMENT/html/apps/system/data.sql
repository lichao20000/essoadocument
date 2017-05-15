CREATE TABLE IF NOT EXISTS `layout` (
  `url` varchar(255) NOT NULL DEFAULT '',
  `uid` varchar(25) NOT NULL DEFAULT '',
  `app` varchar(32) NOT NULL DEFAULT '',
  `data` text NOT NULL,
  KEY `url` (`url`,`uid`),
  KEY `uid` (`uid`,`url`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;