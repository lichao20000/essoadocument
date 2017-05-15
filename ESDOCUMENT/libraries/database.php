<?php
final class AopDb
{
  private $_queries = array();
  private $_conn = null;
  private $_activeRec;
  private $_conf = null;
  private $_transDepth = 0;

  public function __construct()
  {
    $this->_resetSelect();
  }

  private function _resetSelect()
  {
    $this->_activeRec = array(
      'SELECT' => array(),
      'DISTINCT' => false,
      'FROM' => array(),
      'WHERE' => array(),
      'JOIN' => array(),
      'ORDERBY' => array(),
      'GROUPBY' => array(),
      'HAVING' => array(),
      'LIMIT' => null,
      'OFFSET' => null,
    );
  }

  public function connect($host = 'localhost', $user = null, $passwd = null, $name = null, $lazy = true)
  {
    if (is_array($host)) {
      $user = $host['user'];
      $passwd = $host['passwd'];
      $name = $host['name'];
      if (isset($host['lazy'])) {
        $lazy = $host['lazy'];
      }
      $host = $host['host'];
    }
    if (!isset($user) || !isset($passwd) || !isset($name)) {
      return;
    }
    $this->_conf = array(
      'host' => $host,
      'user' => $user,
      'passwd' => $passwd,
      'name' => $name,
    );
    if (!$lazy) {
      $this->_connect();
    }
  }

  private function _connect()
  {
    if (false === ($this->_conn = mysql_connect($this->_conf['host'], $this->_conf['user'], $this->_conf['passwd']))) {
      throw new AopDbException($this->error());
    }
    $this->dbSelect($this->_conf['name']);
    $this->execute('SET NAMES "UTF8"');
    unset($this->_conf);
  }

  public function disconnect()
  {
    if ($this->_conn) {
      mysql_close($this->_conn);
      $this->_conn = null;
    }
  }

  public function actived()
  {
    return (bool)$this->_conn;
  }

  public function dbSelect($name)
  {
    if (!$this->_conn) {
      $this->_conf['name'] = $name;
      return;
    }
    if (!mysql_select_db($name, $this->_conn)) {
      $error = $this->error();
      $this->disconnect();
      throw new AopDbException($error);
    }
  }

  public function escape($text)
  {
    if (!$this->_conn) {
      $this->_connect();
    }
    return mysql_real_escape_string($text, $this->_conn);
  }

  /**
   * @throws AopDbException
   * @return AopDbResult
   */
  public function query($sql)
  {
    if (!$this->_conn) {
      $this->_connect();
    }
    $this->_queries[] = $sql;
    $result = mysql_query($sql, $this->_conn);
    if (!$result) {
      throw new AopDbException($this->error(), $sql);
    } else {
      return new AopDbResult($result);
    }
  }

  public function execute($sql)
  {
    if (!$this->_conn) {
      $this->_connect();
    }
    $this->_queries[] = $sql;
    $result = mysql_unbuffered_query($sql, $this->_conn);
    if (!$result) {
      throw new AopDbException($this->error(), $sql);
    } else {
      return true;
    }
  }

  public function error()
  {
    if ($this->_conn) {
      return mysql_error($this->_conn);
    } else {
      return mysql_error();
    }
  }

  public function errno()
  {
    if ($this->_conn) {
      return mysql_errno($this->_conn);
    } else {
      return mysql_errno();
    }
  }

  public function getQueries()
  {
    return $this->_queries;
  }

  public function lastInsertId()
  {
    return mysql_insert_id($this->_conn);
  }

  public function affected()
  {
    return mysql_affected_rows($this->_conn);
  }

  public function insert($table, $set, $ignore = false)
  {
    $keys = array();
    $values = array();
    foreach ($set as $key => $value) {
      $keys[] = '`' . $this->escape($key) . '`';
      $field = true;
      if (is_array($value) && isset($value['value'])) {
        if (isset($value['escape']) && false === $value['escape']) {
          $field = false;
        }
        $value = $value['value'];
      }
      $value = $this->escape($value);
      if ($field) {
        $value = '"' . $value . '"';
      }
      $values[] = $value;
    }
    $this->execute('INSERT ' . ($ignore ? 'IGNORE ' : '') . 'INTO `' . $this->escape($table) . '` (' . implode(', ', $keys) . ') VALUES (' . implode(', ', $values) . ')');
  }

  public function update($table, $set, $where = null)
  {
    $values = array();
    foreach ($set as $key => $value) {
      $field = true;
      if (is_array($value) && isset($value['value'])) {
        if (isset($value['escape']) && false === $value['escape']) {
          $field = false;
        }
        $value = $value['value'];
      }
      $value = $this->escape($value);
      if ($field) {
        $value = '"' . $value . '"';
      }
      $values[] = '`' . $this->escape($key) . '` = ' . $value;
    }
    if (isset($where) && is_array($where)) {
      foreach ($where as $key => $value) {
        $this->where($key, $value);
      }
    }
    $where = $this->_compileWhere('WHERE');
    $this->_activeRec['WHERE'] = array();
    $this->execute('UPDATE `' . $this->escape($table) . '` SET ' . implode(', ', $values) . $where);
  }

  public function delete($table, $where = null)
  {
    if (isset($where) && is_array($where)) {
      foreach ($where as $key => $value) {
        $this->where($key, $value);
      }
    }
    $where = $this->_compileWhere('WHERE');
    $this->_activeRec['WHERE'] = array();
    $this->execute('DELETE FROM `' . $this->escape($table) . '`' . $where);
  }

  public function select($select)
  {
    $select = explode(',', $select);
    foreach ($select as $field) {
      $this->_activeRec['SELECT'][] = trim($field);
    }
    return $this;
  }

  public function distinct()
  {
    $this->_activeRec['DISTINCT'] = true;
    return $this;
  }

  public function from($table)
  {
    if (!is_array($table)) {
      $table = array($table);
    }
    foreach ($table as $alias => $name) {
      if (!is_int($alias)) {
        $name .= ' AS ' . $alias;
      }
      $this->_activeRec['FROM'][] = $name;
    }
    return $this;
  }

  public function join($table, $cond, $type = 'inner')
  {
    static $types = array(
      'inner' => 'INNER JOIN',
      'left'  => 'LEFT JOIN',
      'right' => 'RIGHT JOIN',
      'full'  => 'FULL JOIN',
    );
    if (strpos($cond, '=')) {
      $cond = 'ON ' . $cond;
    } else {
      $cond = 'USING (' . $cond . ')';
    }

    if (!is_array($table)) {
      $table = array($table);
    }
    foreach ($table as $alias => $name) {
      if (!is_int($alias)) {
        $name .= ' AS ' . $alias;
      }
      $this->_activeRec['JOIN'][] = $types[$type] . ' ' . $name . ' ' . $cond;
    }
    return $this;
  }

  public function limit($limit, $offset = null)
  {
    $this->_activeRec['LIMIT'] = $limit;
    $this->_activeRec['OFFSET'] = $offset;
    return $this;
  }

  public function limitPage($limit, $page = 1)
  {
    $offset = $limit * ($page - 1);
    $this->limit($limit, $offset);
    return $this;
  }

  public function where($cond, $value, $type = 'and', $escape = true, $recKey = 'WHERE')
  {
    static $types = array(
      'and' => 'AND',
      'or'  => 'OR',
    );
    static $ops = array('>=', '<=', '<>', '!=', '=', '>', '<', 'IN', 'LIKE');
    $cond = trim($cond);
    if (false !== ($eqPos = strpos($cond, ' '))) {
      $field = trim(substr($cond, 0, $eqPos));
      $op = strtoupper(trim(substr($cond, $eqPos + 1)));
      if (!in_array($op, $ops)) {
        $op = '=';
      }
    } else {
      $field = $cond;
      $op = '=';
    }
    if ($op == 'IN') {
      if (is_array($value)) {
        foreach ($value as &$v) {
          $v = '"' . $this->escape($v) . '"';
        }
        $value = '(' . implode(', ', $value) . ')';
      } else {
        $op = '=';
        $value = '"' . $this->escape($value) . '"';
      }
    } else {
      if ($escape) {
        $value = '"' . $this->escape($value) . '"';
      }
    }
    $this->_activeRec[$recKey][] = array(
      'field' => $field,
      'op'    => $op,
      'type'  => $types[$type],
      'value' => $value,
    );
    return $this;
  }

  public function having($cond, $value, $type = 'and', $escape = true)
  {
    return $this->where($cond, $value, $type, $escape, 'HAVING');
  }

  public function orderby($order)
  {
    $order = explode(',', $order);
    foreach ($order as $field) {
      $this->_activeRec['ORDERBY'][] = trim($field);
    }
    return $this;
  }

  public function groupby($group)
  {
    $group = explode(',', $group);
    foreach ($group as $field) {
      $this->_activeRec['GROUPBY'][] = trim($field);
    }
    return $this;
  }

  public function get($table = null, $limit = null, $offset = null)
  {
    if (isset($table)) {
      $this->from($table);
    }
    if (isset($limit)) {
      $this->limit($limit, $offset);
    }
    $sql = $this->_compileSelect();
    $this->_resetSelect();
    return $this->query($sql);
  }

  private function _compileWhere($recKey = 'WHERE')
  {
    $sql = '';
    if ($recKey == 'WHERE' || $recKey == 'HAVING') {
      $rec = $this->_activeRec;
      if (isset($rec[$recKey][0])) {
        $sql .= ' ' . $recKey;
        foreach ($rec[$recKey] as $num => $cond) {
          if ($num > 0){
            $sql .= ' ' . $cond['type'];
          }
          if (false === strpos($cond['field'], '.')) {
            $sql .= ' `' . $cond['field'] . '`';
          } else {
            $sql .= ' ' . $cond['field'];
          }
          $sql .=  ' ' . $cond['op'] . ' ' . $cond['value'];
        }
      }
    }
    return $sql;
  }

  private function _compileSelect()
  {
    $sql = 'SELECT';
    $rec = $this->_activeRec;
    if ($rec['DISTINCT']) {
      $sql .= ' DISTINCT';
    }
    if (isset($rec['SELECT'][0])) {
      $sql .= ' ' . implode(', ', $rec['SELECT']);
    } else {
      $sql .= ' *';
    }
    if (isset($rec['FROM'][0])) {
      $sql .= ' FROM ' . implode(', ', $rec['FROM']);
    }
    if (isset($rec['JOIN'][0])) {
      $sql .= ' ' . implode(' ', $rec['JOIN']);
    }
    $sql .= $this->_compileWhere('WHERE');
    if (isset($rec['GROUPBY'][0])) {
      $sql .= ' GROUP BY ' . implode(', ', $rec['GROUPBY']);
    }
    if (isset($rec['ORDERBY'][0])) {
      $sql .= ' ORDER BY ' . implode(', ', $rec['ORDERBY']);
    }
    $sql .= $this->_compileWhere('HAVING');
    if (isset($rec['LIMIT'])) {
      $sql .= ' LIMIT ' . (isset($rec['OFFSET']) && $rec['OFFSET'] > 0 ? ($rec['OFFSET'] . ', ') : '') . $rec['LIMIT'];
    }
    return $sql;
  }

  public function transBegin()
  {
    ++$this->_transDepth;
    if ($this->_transDepth == 1) {
      $this->execute('SET AUTOCOMMIT=0');
      $this->execute('START TRANSACTION');
    }
    return true;
  }

  public function transCommit()
  {
    if ($this->_transDepth == 1) {
      $this->execute('COMMIT');
      $this->execute('SET AUTOCOMMIT=1');
    }
    --$this->_transDepth;
    return true;
  }

  public function transRollback()
  {
    if ($this->_transDepth > 1) {
      $this->execute('ROLLBACK');
      $this->execute('SET AUTOCOMMIT=1');
    }
    $this->_transDepth = 0;
    return true;
  }
}

final class AopDbResult
{
  private $_result;

  public function __construct($result)
  {
    $this->_result = $result;
  }

  public function all($object = true)
  {
    $result = array();
    if ($object) {
      while ($data = mysql_fetch_object($this->_result)) {
        $result[] = $data;
      }
    } else {
      while ($data = mysql_fetch_assoc($this->_result)) {
        $result[] = $data;
      }
    }
    unset($data);
    return $result;
  }

  public function allWithKey($key, $object = true)
  {
    $result = array();
    if ($object) {
      while ($data = mysql_fetch_object($this->_result)) {
        $result[$data->$key] = $data;
      }
    } else {
      while ($data = mysql_fetch_assoc($this->_result)) {
        $result[$data[$key]] = $data;
      }
    }
    unset($data);
    return $result;
  }

  public function column($index = 0)
  {
    $result = array();
    $type = is_int($index) ? MYSQL_NUM : MYSQL_ASSOC;
    while ($data = mysql_fetch_array($this->_result, $type)) {
      $result[] = $data[$index];
    }
    unset($data);
    return $result;
  }

  public function columnWithKey($key, $index = 0)
  {
    $result = array();
    while ($data = mysql_fetch_array($this->_result)) {
      $result[$data[$key]] = $data[$index];
    }
    unset($data);
    return $result;
  }

  public function row($object = true)
  {
    return $object ? mysql_fetch_object($this->_result) : mysql_fetch_assoc($this->_result);
  }

  public function one($index = 0)
  {
    $data = mysql_fetch_array($this->_result);
    return false === $data ? false : $data[$index];
  }
}

final class AopDbException extends AopException
{
  private $_sql;

  public function __construct($message, $sql = '')
  {
    parent::__construct($message, parent::E_ERROR, 503);
    $this->_sql = $sql;
    if (ENV == 'WEB') {
      header('HTTP/1.1 503 Service Unavailable');
    }
  }

  public function getQuery()
  {
    return $this->_sql;
  }
}