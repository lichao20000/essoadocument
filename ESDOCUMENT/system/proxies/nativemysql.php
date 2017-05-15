<?php
class ProxyNativemysql extends AgentProxyAbstract
{
  /**
   * @var AopDb
   */
  private $_db = null;

  private $_dbname = null;

  public function __construct(array $appInfo)
  {
    parent::__construct($appInfo);
    AopCore::loadLibrary('database');
    // TODO 配置项最终应该到服务端获取, 目前先读取配置项
    $conf = AopConfig::get('nativemysql');
    if ($conf) {
      $conf['name'] = $this->_dbname = $appInfo['appid'];
      $this->_db = new AopDb();
      $this->_db->connect($conf);
    }
  }

  public function query($sql)
  {
    $this->_db->dbSelect($this->_dbname);
    return $this->_db->query($sql);
  }

  public function execute($sql)
  {
    $this->_db->dbSelect($this->_dbname);
    return $this->_db->execute($sql);
  }

  public function fetchRow($sql)
  {
    $this->_db->dbSelect($this->_dbname);
    return $this->_db->query($sql)->row();
  }

  public function fetchField($sql)
  {
    $this->_db->dbSelect($this->_dbname);
    return $this->_db->query($sql)->one();
  }

  public function fetchCol($sql)
  {
    $this->_db->dbSelect($this->_dbname);
    return $this->_db->query($sql)->column();
  }

  public function fetchAll($sql)
  {
    $this->_db->dbSelect($this->_dbname);
    return $this->_db->query($sql)->all();
  }

  public function transBegin()
  {
    $this->_db->dbSelect($this->_dbname);
    return $this->_db->transBegin();
  }

  public function transCommit()
  {
    $this->_db->dbSelect($this->_dbname);
    return $this->_db->transCommit();
  }

  public function transRollback()
  {
    $this->_db->dbSelect($this->_dbname);
    return $this->_db->transRollback();
  }

  public function insert($sql)
  {
    $this->_db->dbSelect($this->_dbname);
    $this->execute($sql);
    return $this->_db->lastInsertId();
  }

  public function escape($string)
  {
    return mysql_escape_string($string);
  }
}