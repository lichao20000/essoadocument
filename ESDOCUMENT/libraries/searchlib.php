<?php
final class SearchLib{
	static private $_response, $_filters, $numfound = 0, $_isSearched = FALSE;

	static public function handleRespoonse($response){
    if(isset($response->nvPairs)){
      return self::handleRespoonse($response->nvPairs);
    }
	  $key = null;
	  $data = new stdClass();
	  foreach($response as $k=>$v){
      if ($k % 2 === 0){
         $key = $v;
      }else{
        if(isset($v->nvPairs)){
          $data->$key = self::handleRespoonse($v);
        }else {
          if($key!=''){
            $data->$key = $key ==='response' ? json_decode($v) : $v;
          }
        }
      }
	  }
	  return $data;
	}

	static public function searchResponse($response, $hl_fl = array('content', 'label', 'ts_comments', 'teaser')){

	  $data = self::handleRespoonse($response->response);
	  $results = array();

		$total = $data->response->numFound;
    
		if ($total > 0) {
			foreach ($data->response->doc as $doc) {
				$extra = array();

				// Start with an empty snippets array.
				$snippets = array();
        
				// Find the nicest available snippet.
				
				foreach ($hl_fl as $hl_param) {
					if (isset($response->_highlighting) && isset($response->_highlighting->{$doc->id}) && isset($response->_highlighting->{$doc->id}->$hl_param)) {
						// Merge arrays preserving keys.
						foreach ($response->_highlighting->{$doc->id}->$hl_param as $values) {
							$snippets[$hl_param] = $values;
						}
					}
				}
				// If there's no snippet at this point, add the teaser.
				if (!$snippets) {
					if (isset($doc->teaser)) {
						//$snippets[] = truncate_utf8($doc->teaser, 256, TRUE);
						$snippets[] = $doc->teaser;
					}
				}
				if (!isset($doc->content)) {
					$doc->content = $snippets;
				}

				$fields = (array) $doc;
        //print_r($doc);exit;
				$result = array(
        'link' => url('', array('absolute' => TRUE)),
        'title' => htmlspecialchars_decode(isset($doc->label)?$doc->label:$doc->url, ENT_QUOTES),
        'score' => isset($doc->score)?$doc->score:0,
        'snippets' => $snippets,
        'fields' => $fields,
        'entity_type' => $doc->entity_type,
        'bundle' => isset($doc->bundle) ? $doc->bundle : '',
				);
				
				if(isset($snippets['label']) && $snippets['label']!=''){
				  $result['title'] =  $snippets['label'];
				}
				
				if(isset($snippets['content']) && $snippets['content']!=''){
				  $result['content'] =  $snippets['content'];
				}
				
				if(isset($snippets['teaser']) && $snippets['teaser']!=''){
				  $result['fields']['teaser'] =  $snippets['teaser'];
				}
				
				$results[] = $result;
			}
			self::$_response = $results;
			self::$_isSearched = TRUE;
			if (isset($data->facet_counts->facet_fields)) {
			  $filterfields = (array) $data->facet_counts->facet_fields;
			} else {
			  $filterfields = array();
			}
			self::$_filters = $filterfields;
			self::$numfound = $total;
			return $results;
		}
	}
	static public function isSearched(){
		return self::$_isSearched;
	}

	static public function getFilters(){
		return self::$_filters;
	}
	static public function getResponse(){
		return self::$_response;
	}
	static public function getTotal(){
		return self::$numfound;
	}
}