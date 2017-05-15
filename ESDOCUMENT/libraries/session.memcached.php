<?php
final class session
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
      $host = AopConfig::get('session.memcached.host', '127.0.0.1');
      $port = AopConfig::get('session.memcached.port', '11211');
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

  public static function start()
  {
    session_set_save_handler(
      'session::open',
      'session::close',
      'session::read',
      'session::write',
      'session::destroy',
      'session::gc'
    );
    session_start();
  }

  public static function open($save_path, $session_name)
  {
    return true;
  }

  public static function close()
  {
    return true;
  }

  public static function read($sid)
  {
    global $user;
    register_shutdown_function('session_write_close');
    if (!isset($_COOKIE[session_name()])) {
      $user = anonymousUser($sid);
      return '';
    }
    $memcache = self::_getInstance();
    if (false === ($user = $memcache->get($sid))) {
      $user = anonymousUser($sid);
      return '';
    } else {
      if (is_string($user)) {
        $user = unserialize($user);
      }
      $data = $user->data;
      unset($user->data);
      return $data;
    }
  }

  public static function write($sid, $data)
  {
    global $user;
    if (!isset($user) || !isset($user->id) || ($user->id == U_ANONYMOUS && empty($_COOKIE[session_name()]) && empty($data))) {
      return true;
    }
    $user->data = $data;
    $lifetime = AopConfig::get('session.lifetime', 3600);
    $memcache = self::_getInstance();
    if (self::$_extension == self::EXTENSION_MEMCACHED) {
      $memcache->set($sid, $user, $lifetime);
    } else if (self::$_extension == self::EXTENSION_MEMCACHE) {
      $memcache->set($sid, $user, 0, $lifetime);
    }
    return true;
  }

  public static function destroy($sid)
  {
    $memcache = self::_getInstance();
    $memcache->delete($sid);
    return true;
  }

  public static function gc($lifetime)
  {
    return true;
  }
}
