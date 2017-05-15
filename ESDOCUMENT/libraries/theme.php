<?php
class AppTheme
{
  private static $_instance;

  private function __construct(){}

  public static function getInstance(){
    if (!self::$_instance instanceof self)
    {
      self::$_instance = new self();
    }
    return self::$_instance;
  }


  protected function generateAttributes($attributes)
  {
    foreach ($attributes as $attribute => &$data) {
      $data = implode(' ', (array) $data);
      $data = $attribute . '="' . $data . '"';
    }
    return $attributes ? ' ' . implode(' ', $attributes) : '';
  }

  protected function generateTableCell($cell, $header = FALSE) {
    $attributes = '';

    if (is_array($cell)) {
      $data = isset($cell['data']) ? $cell['data'] : '';
      // Cell's data property can be a string or a renderable array.
      if (is_array($data)) {
        $data = drupal_render($data);
      }
      $header |= isset($cell['header']);
      unset($cell['data']);
      unset($cell['header']);
      $attributes = $this->generateAttributes($cell);
    }
    else {
      $data = $cell;
    }

    if ($header) {
      $output = "<th$attributes>$data</th>";
    }
    else {
      $output = "<td$attributes>$data</td>";
    }

    return $output;
  }

  public function table($variables)
  {
    $header = $variables['header'];
    $rows = $variables['rows'];
    $empty = 'no data';
    $attributes = isset($variables['attributes']) ? $variables['attributes'] : array();

    $output = '<table' . $this->generateAttributes($attributes) . ">\n";

    if (isset($caption)) {
      $output .= '<caption>' . $caption . "</caption>\n";
    }

    // Add the 'empty' row message if available.
    if (!count($rows) && $empty) {
      $header_count = 0;
      foreach ($header as $header_cell) {
        if (is_array($header_cell)) {
          $header_count += isset($header_cell['colspan']) ? $header_cell['colspan'] : 1;
        }
        else {
          $header_count++;
        }
      }
      $rows[] = array(array('data' => $empty, 'colspan' => $header_count, 'class' => array('empty', 'message')));
    }

    // Format the table header:
    if (count($header)) {
      // HTML requires that the thead tag has tr tags in it followed by tbody
      // tags. Using ternary operator to check and see if we have any rows.
      $output .= (count($rows) ? ' <thead><tr>' : ' <tr>');
      foreach ($header as $cell) {
        $output .= $this->generateTableCell($cell, TRUE);
      }
      // Using ternary operator to close the tags based on whether or not there are rows
      $output .= (count($rows) ? " </tr></thead>\n" : "</tr>\n");
    }

    // Format the table rows:
    if (count($rows)) {
      $output .= "<tbody>\n";
      $flip = array('even' => 'odd', 'odd' => 'even');
      $class = 'even';
      foreach ($rows as $number => $row) {
        $attributes = array();

        // Check if we're dealing with a simple or complex row
        if (isset($row['data'])) {
          foreach ($row as $key => $value) {
            if ($key == 'data') {
              $cells = $value;
            }
            else {
              $attributes[$key] = $value;
            }
          }
        }
        else {
          $cells = $row;
        }
        if (count($cells)) {
          // Add odd/even class
          if (empty($row['no_striping'])) {
            $class = $flip[$class];
            $attributes['class'][] = $class;
          }

          // Build row
          $output .= ' <tr' . $this->generateAttributes($attributes) . '>';
          $i = 0;
          foreach ($cells as $cell) {

            $output .= $this->generateTableCell($cell);
          }
          $output .= " </tr>\n";
        }
      }
      $output .= "</tbody>\n";
    }

    $output .= "</table>\n";
    return $output;
  }
}
