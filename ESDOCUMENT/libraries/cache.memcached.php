<?php
final class cache
{
  const EXTENSION_MEMCACHE = 0;
  const EXTENSION_MEMCACHED = 1;

  private static $_extension = null;

  /**
   * @return Memcache
   */
  private static function _getInstance()
  {
    static $memcache = null;
    if (!isset($memcache)) {
      $host = AopConfig::get('cache.memcached.host', '127.0.0.1');
      $port = AopConfig::get('cache.memcached.port', '11211');
      if (extension_loaded('memcached')) {
        $memcache = new Memcached();
//        $memcache->setOption(Memcached::OPT_COMPRESSION, false);
        $memcache->addServer($host, $port) or die('Memcached server not found.');
        self::$_extension = self::EXTENSION_MEMCACHED;
      } else if (extension_loaded('memcache')) {
        $memcache = new Memcache();
        $memcache->pconnect($host, $port) or die('Memcached server not found.');
        self::$_extension = self::EXTENSION_MEMCACHE;
      } else {
        die('Memcache or Memcached extension not loaded.');
      }
    }
    return $memcache;
  }

  public static function get($cacheId)
  {
    $memcache = self::_getInstance();
    if (false === ($result = $memcache->get($cacheId))) {
      return false;
    }
    $cache = new stdClass();
    $cache->data = $result;
    return $cache;
  }

  public static function set($cacheId, $data, $lifetime = null)
  {
    $lifetime = isset($lifetime) ? intval($lifetime) : AopConfig::get('cache.lifetime', 180);
    $memcache = self::_getInstance();
    if (self::$_extension == self::EXTENSION_MEMCACHED) {
      $memcache->set($cacheId, $data, $lifetime);
    } else if (self::$_extension == self::EXTENSION_MEMCACHE) {
      $memcache->set($cacheId, $data, 0, $lifetime);
    }
  }

  public static function remove($cacheId)
  {
    $memcache = self::_getInstance();
    $memcache->delete($cacheId);
  }

  public static function clear()
  {
    $memcache = self::_getInstance();
    $memcache->flush();
  }
}
