<?php
class AppForm {
  private $_appInfo;

  private static $_errorInfo;

  private $_redirectMessage = null ;

  private $_formElement;

  private $_formTheme;

  private $_formTools;

  private $_appInstance = null;

  private $_formHelper;

  public function __construct(AppAbstract $appInstance) {
    $this->_appInstance = $appInstance;
    $this->_appInfo = $appInstance->getAppInfo();
    $this->_formElement = new AppFormElement();
    $this->_formTheme = new AppFormTheme();
    $this->_formTools = new AppFormTools();
    $this->_formHelper = new AppFormHelper();
  }

  public function buildForm($formId) {
    $formState = array();
    //获取参数
    $args = func_get_args();
    array_shift($args);
    $formState['build_info']['args'] = $args;
    //设置form默认信息
    $formState += $this->defaultFormState();
    if (!isset($formState['input'])) {
      $formState['input'] = $formState['method'] == 'get' ? $_GET : $_POST;
    }
    //检索Form是否存在
    $form = $this->retrieveForm($formId, $formState);
    $this->prepareForm($formId, $form, $formState);
    //process form
    $this->processForm($formId, $form, $formState);
    return $this->render($form);
  }

  private function defaultFormState() {
    return array(
      'redirect' => NULL,
      'build_info' => array(
        'args' => array(),
        'files' => array(),
    ),
      'submitted' => FALSE,
      'executed' => FALSE,
      'programmed' => FALSE,
      'method' => 'post',
      'buttons' => array(),
    );
  }

  private function retrieveForm($formId, &$formState) {
    $form = array();
    $args = $formState['build_info']['args'];
    //$classname = 'App' . ucfirst($this->_appInfo['app_id']);
    $method = 'form_' . strtolower($formId);
    $object = $this->_appInstance;
    $args = array_merge(array($form, &$formState), $args);
    $form = call_user_func_array(array($object, $method), $args);
    $form['#form_id'] = $formId;
    $form['#error'] = "";
    return $form;
  }

  private function prepareForm($formId, &$form, &$formState) {
    global $user;

    $form['#type'] = 'form';
    $formState['programmed'] = isset($formState['programmed']) ? $formState['programmed'] : FALSE;

    // Fix the form method, if it is 'get' in $formState, but not in $form.
    if ($formState['method'] == 'get' && !isset($form['#method'])) {
      $form['#method'] = 'get';
    }

    // Generate a new #build_id for this form, if none has been set already. The
    // form_build_id is used as key to cache a particular build of the form. For
    // multi-step forms, this allows the user to go back to an earlier build, make
    // changes, and re-submit.
    // @see drupal_build_form()
    // @see drupal_rebuild_form()
    if (!isset($form['#build_id'])) {
      $form['#build_id'] = 'form-' . $this->_formTools->formHashBase64(uniqid(mt_rand(), TRUE) . mt_rand());
    }
    $form['form_build_id'] = array(
        '#type' => 'hidden',
        '#value' => $form['#build_id'],
        '#id' => $form['#build_id'],
        '#name' => 'form_build_id',
    );

    // Add a token, based on either #token or form_id, to any form displayed to
    // authenticated users. This ensures that any submitted form was actually
    // requested previously by the user and protects against cross site request
    // forgeries.
    // This does not apply to programmatically submitted forms. Furthermore, since
    // tokens are session-bound and forms displayed to anonymous users are very
    // likely cached, we cannot assign a token for them.
    // During installation, there is no $user yet.
    if (!empty($user->uid) && !$formState['programmed']) {
      // Form constructors may explicitly set #token to FALSE when cross site
      // request forgery is irrelevant to the form, such as search forms.
      if (isset($form['#token']) && $form['#token'] === FALSE) {
        unset($form['#token']);
      }
      // Otherwise, generate a public token based on the form id.
      else {
        $form['#token'] = $formId;
        $form['form_token'] = array(
            '#id' => $this->_formTools->createUniqueId('edit-' . $formId . '-form-token'),
            '#type' => 'token',
            '#default_value' => 'eip',
        );
      }
    }

    if (isset($formId)) {
      $form['form_id'] = array(
          '#type' => 'hidden',
          '#value' => $formId,
          '#id' => $this->_formTools->createUniqueId("edit-$formId"),
      );
    }
    if (!isset($form['#id'])) {
      $form['#id'] = $this->_formTools->createUniqueId($formId);
    }

    $form += $this->_formElement->elementInfo('form');
    $form += array('#tree' => FALSE, '#parents' => array());

    //$classname = 'App' . ucfirst($this->_appInfo['app_id']);
    $object = $this->_appInstance;
    $validateMethod = 'form_' . $formId . '_validate';
    if (!isset($form['#validate'])) {
      // Ensure that modules can rely on #validate being set.
      $form['#validate'] = array();
      // Check for a handler specific to $formId.
      if (method_exists($object, $validateMethod)) {
        $form['#validate'][] = $validateMethod;
      } else {
        //TODO 设置默认的validateMethod
      }

    }

    $submitMethod = 'form_' . $formId . '_submit';
    if (!isset($form['#submit'])) {
      // Ensure that modules can rely on #submit being set.
      $form['#submit'] = array();
      // Check for a handler specific to $formId.
      if (method_exists($object, $submitMethod)) {
        $form['#submit'][] = $submitMethod;
      } else {
        //TODO 设置默认的$submitMethod
      }
    }
  }

  /**
   *
   * 默认验证方式
   * @param unknown_type $formId
   * @param unknown_type $form
   * @param unknown_type $formState
   * @return return_type
   */
  private function AppFormValidate($formId, $form, $formState) {
    ;
  }

  private function processForm($formId, &$form, &$formState) {
    $formState['values'] = array();
    // form_builder() finishes building the form by calling element #process
    // functions and mapping user input, if any, to #value properties, and also
    // storing the values in $formState['values']. We need to retain the
    // unprocessed $form in case it needs to be cached.
    $unprocessed_form = $form;
    $form = $this->formBuilder($formId, $form, $formState);
    // Only process the input if we have a correct form submission.
    if ($formState['process_input']) {
      $this->AppFormValidate($formId, $form, $formState);
      //drupal_validate_form($form_id, $form, $form_state);

      $pass = $this->validateForm($formId, $form, $formState);
      if ($pass === true) {
        $this->submitForm($formId, $form, $formState);
      } else {
        echo $pass;
        exit;
      }
    }
  }

  private function formBuilder($formId, &$element, &$formState) {
    // Initialize as unprocessed.
    $element['#processed'] = FALSE;

    // Use element defaults. {
    if (isset($element['#type']) && empty($element['#defaults_loaded']) && ($info = $this->_formElement->elementInfo($element['#type']))) {
      // Overlay $info onto $element, retaining preexisting keys in $element.
      $element += $info;
      $element['#defaults_loaded'] = TRUE;
    }
    // Assign basic defaults common for all form elements.
    $element += array(
        '#required' => FALSE,
        '#attributes' => array(),
        '#title_display' => 'before',
    );

    // Special handling if we're on the top level form element.
    if (isset($element['#type']) && $element['#type'] == 'form') {
      /*       if (!empty($element['#https']) && variable_get('https', FALSE) &&
       !url_is_external($element['#action'])) {
      global $base_root;

      // Not an external URL so ensure that it is secure.
      $element['#action'] = str_replace('http://', 'https://', $base_root) . $element['#action'];
      } */

      // Store a reference to the complete form in $formState prior to building
      // the form. This allows advanced #process and #after_build callbacks to
      // perform changes elsewhere in the form.
      $formState['complete form'] = &$element;

      // Set a flag if we have a correct form submission. This is always TRUE for
      // programmed forms coming from drupal_form_submit(), or if the form_id coming
      // from the POST data is set and matches the current form_id.
      if ($formState['programmed'] || (!empty($formState['input']) && (isset($formState['input']['form_id']) && ($formState['input']['form_id'] == $formId)))) {
        $formState['process_input'] = TRUE;
      }
      else {
        $formState['process_input'] = FALSE;
      }
      //var_dump($formState['process_input']);
      // All form elements should have an #array_parents property.
      $element['#array_parents'] = array();
    }

    if (!isset($element['#id'])) {
      $element['#id'] = $this->_formTools->createUniqueId('edit-' . implode('-', $element['#parents']));
    }
    // Handle input elements.
    if (!empty($element['#input'])) {
      $this->handleInputElement($formId, $element, $formState);
      //_form_builder_handle_input_element($formId, $element, $formState);
    }
    // Allow for elements to expand to multiple elements, e.g., radios,
    // checkboxes and files.
    if (isset($element['#process']) && !$element['#processed']) {
      foreach ($element['#process'] as $process) {
        //执行一系列的process操作
        $element = $this->_formElement->$process($element, $formState, $formState['complete form']);
      }
      $element['#processed'] = TRUE;
    }

    // We start off assuming all form elements are in the correct order.
    $element['#sorted'] = TRUE;

    // Recurse through all child elements.
    $count = 0;
    foreach ($this->_formElement->elementChildren($element) as $key) {
      // Prior to checking properties of child elements, their default properties
      // need to be loaded.
      if (isset($element[$key]['#type']) && empty($element[$key]['#defaults_loaded']) && ($info = $this->_formElement->elementInfo($element[$key]['#type']))) {
        $element[$key] += $info;
        $element[$key]['#defaults_loaded'] = TRUE;
      }

      // Don't squash an existing tree value.
      if (!isset($element[$key]['#tree'])) {
        $element[$key]['#tree'] = $element['#tree'];
      }

      // Deny access to child elements if parent is denied.
      if (isset($element['#access']) && !$element['#access']) {
        $element[$key]['#access'] = FALSE;
      }

      // Make child elements inherit their parent's #disabled and #allow_focus
      // values unless they specify their own.
      foreach (array('#disabled', '#allow_focus') as $property) {
        if (isset($element[$property]) && !isset($element[$key][$property])) {
          $element[$key][$property] = $element[$property];
        }
      }

      // Don't squash existing parents value.
      if (!isset($element[$key]['#parents'])) {
        // Check to see if a tree of child elements is present. If so,
        // continue down the tree if required.
        $element[$key]['#parents'] = $element[$key]['#tree'] && $element['#tree'] ? array_merge($element['#parents'], array($key)) : array($key);
      }
      // Ensure #array_parents follows the actual form structure.
      $array_parents = $element['#array_parents'];
      $array_parents[] = $key;
      $element[$key]['#array_parents'] = $array_parents;

      // Assign a decimal placeholder weight to preserve original array order.
      if (!isset($element[$key]['#weight'])) {
        $element[$key]['#weight'] = $count/1000;
      }
      else {
        // If one of the child elements has a weight then we will need to sort
        // later.
        unset($element['#sorted']);
      }
      //$element[$key] = form_builder($formId, $element[$key], $formState);
      $element[$key] = $this->formBuilder($formId, $element[$key], $formState);
      $count++;
    }

    // If there is a file element, we need to flip a flag so later the
    // form encoding can be set.
    if (isset($element['#type']) && $element['#type'] == 'file') {
      $formState['has_file_element'] = TRUE;
    }

    // Final tasks for the form element after form_builder() has run for all other
    // elements.
    if (isset($element['#type']) && $element['#type'] == 'form') {
      // If there is a file element, we set the form encoding.
      if (isset($formState['has_file_element'])) {
        $element['#attributes']['enctype'] = 'multipart/form-data';
      }

      // If a form contains a single textfield, and the ENTER key is pressed
      // within it, Internet Explorer submits the form with no POST data
      // identifying any submit button. Other browsers submit POST data as though
      // the user clicked the first button. Therefore, to be as consistent as we
      // can be across browsers, if no 'triggering_element' has been identified
      // yet, default it to the first button.
      if (!$formState['programmed'] && !isset($formState['triggering_element']) && !empty($formState['buttons'])) {
        $formState['triggering_element'] = $formState['buttons'][0];
      }

      // If the triggering element specifies "button-level" validation and submit
      // handlers to run instead of the default form-level ones, then add those to
      // the form state.
      foreach (array('validate', 'submit') as $type) {
        if (isset($formState['triggering_element']['#' . $type])) {
          $formState[$type . '_handlers'] = $formState['triggering_element']['#' . $type];
        }
      }

      // If the triggering element executes submit handlers, then set the form
      // state key that's needed for those handlers to run.
      if (!empty($formState['triggering_element']['#executes_submit_callback'])) {
        $formState['submitted'] = TRUE;
      }

      // Special processing if the triggering element is a button.
      if (isset($formState['triggering_element']['#button_type'])) {
        // Because there are several ways in which the triggering element could
        // have been determined (including from input variables set by JavaScript
        // or fallback behavior implemented for IE), and because buttons often
        // have their #name property not derived from their #parents property, we
        // can't assume that input processing that's happened up until here has
        // resulted in $formState['values'][BUTTON_NAME] being set. But it's
        // common for forms to have several buttons named 'op' and switch on
        // $formState['values']['op'] during submit handler execution.
        $formState['values'][$formState['triggering_element']['#name']] = $formState['triggering_element']['#value'];

        // @todo Legacy support. Remove in Drupal 8.
        $formState['clicked_button'] = $formState['triggering_element'];
      }
    }
    return $element;
  }

  private function handleInputElement($form_id, &$element, &$formState) {
    if (!isset($element['#name'])) {
      $name = array_shift($element['#parents']);
      $element['#name'] = $name;
      if ($element['#type'] == 'file') {
        // To make it easier to handle $_FILES in file.inc, we place all
        // file fields in the 'files' array. Also, we do not support
        // nested file names.
        $element['#name'] = 'files[' . $element['#name'] . ']';
      }
      elseif (count($element['#parents'])) {
        $element['#name'] .= '[' . implode('][', $element['#parents']) . ']';
      }
      array_unshift($element['#parents'], $name);
    }

    // Setting #disabled to TRUE results in user input being ignored, regardless
    // of how the element is themed or whether JavaScript is used to change the
    // control's attributes. However, it's good UI to let the user know that input
    // is not wanted for the control. HTML supports two attributes for this:
    // http://www.w3.org/TR/html401/interact/forms.html#h-17.12. If a form wants
    // to start a control off with one of these attributes for UI purposes only,
    // but still allow input to be processed if it's sumitted, it can set the
    // desired attribute in #attributes directly rather than using #disabled.
    // However, developers should think carefully about the accessibility
    // implications of doing so: if the form expects input to be enterable under
    // some condition triggered by JavaScript, how would someone who has
    // JavaScript disabled trigger that condition? Instead, developers should
    // consider whether a multi-step form would be more appropriate (#disabled can
    // be changed from step to step). If one still decides to use JavaScript to
    // affect when a control is enabled, then it is best for accessibility for the
    // control to be enabled in the HTML, and disabled by JavaScript on document
    // ready.
    if (!empty($element['#disabled'])) {
      if (!empty($element['#allow_focus'])) {
        $element['#attributes']['readonly'] = 'readonly';
      }
      else {
        $element['#attributes']['disabled'] = 'disabled';
      }
    }

    // With JavaScript or other easy hacking, input can be submitted even for
    // elements with #access=FALSE or #disabled=TRUE. For security, these must
    // not be processed. Forms that set #disabled=TRUE on an element do not
    // expect input for the element, and even forms submitted with
    // drupal_form_submit() must not be able to get around this. Forms that set
    // #access=FALSE on an element usually allow access for some users, so forms
    // submitted with drupal_form_submit() may bypass access restriction and be
    // treated as high-privilege users instead.
    $process_input = empty($element['#disabled']) && ($formState['programmed'] || ($formState['process_input'] && (!isset($element['#access']) || $element['#access'])));

    // Set the element's #value property.
    if (!isset($element['#value']) && !array_key_exists('#value', $element)) {
      $value_callback = !empty($element['#value_callback']) ? $element['#value_callback'] : 'formType' . ucfirst($element['#type']) . 'Value';
      if ($process_input) {
        // Get the input for the current element. NULL values in the input need to
        // be explicitly distinguished from missing input. (see below)
        $input_exists = NULL;
        $input = $this->_formTools->getNestedValue($formState['input'], $element['#parents'], $input_exists);
        // For browser-submitted forms, the submitted values do not contain values
        // for certain elements (empty multiple select, unchecked checkbox).
        // During initial form processing, we add explicit NULL values for such
        // elements in $formState['input']. When rebuilding the form, we can
        // distinguish elements having NULL input from elements that were not part
        // of the initially submitted form and can therefore use default values
        // for the latter, if required. Programmatically submitted forms can
        // submit explicit NULL values when calling drupal_form_submit(), so we do
        // not modify $formState['input'] for them.
        if (!$input_exists && !$formState['programmed']) {
          // Add the necessary parent keys to $formState['input'] and sets the
          // element's input value to NULL.
          $this->_formTools->setNestedValue($formState['input'], $element['#parents'], NULL);
          $input_exists = TRUE;
        }
        // If we have input for the current element, assign it to the #value
        // property, optionally filtered through $value_callback.
        if ($input_exists) {
          /*         if (function_exists($value_callback)) {
           $element['#value'] = $value_callback($element, $input, $formState);
          } */
          if (!isset($element['#value']) && isset($input)) {
            $element['#value'] = $input;
          }
        }
        // Mark all posted values for validation.
        if (isset($element['#value']) || (!empty($element['#required']))) {
          $element['#needs_validation'] = TRUE;
        }
      }
      // Load defaults.
      if (!isset($element['#value'])) {
        // Call #type_value without a second argument to request default_value handling.
/*         if (function_exists($value_callback)) {
          $element['#value'] = $value_callback($element, FALSE, $formState);
        } */
        if (method_exists($this->_formHelper, $value_callback)) {
          $element['#value'] = $this->_formHelper->$value_callback($element, FALSE, $formState);
        }
        // Final catch. If we haven't set a value yet, use the explicit default value.
        // Avoid image buttons (which come with garbage value), so we only get value
        // for the button actually clicked.
        if (!isset($element['#value']) && empty($element['#has_garbage_value'])) {
          $element['#value'] = isset($element['#default_value']) ? $element['#default_value'] : '';
        }
      }
    }

    // Determine which element (if any) triggered the submission of the form and
    // keep track of all the clickable buttons in the form for
    // form_state_values_clean(). Enforce the same input processing restrictions
    // as above.
    if ($process_input) {
      // Detect if the element triggered the submission via Ajax.
      /*     if (_form_element_triggered_scripted_submission($element, $formState)) {
      $formState['triggering_element'] = $element;
      } */

      // If the form was submitted by the browser rather than via Ajax, then it
      // can only have been triggered by a button, and we need to determine which
      // button within the constraints of how browsers provide this information.
      //print_r($element); exit;
      if (isset($element['#button_type'])) {
        // All buttons in the form need to be tracked for
        // form_state_values_clean() and for the form_builder() code that handles
        // a form submission containing no button information in $_POST.
        $formState['buttons'][] = $element;
        if ($this->_formElement->formButtonWasClicked($element, $formState)) {
          $formState['triggering_element'] = $element;
        }
      }
    }

    // Set the element's value in $formState['values'], but only, if its key
    // does not exist yet (a #value_callback may have already populated it).
    if (!$this->_formTools->nestedKeyIsExists($formState['values'], $element['#parents'])) {
      $this->_formElement->formSetValue($element, $element['#value'], $formState);
    }
  }

  private function render(&$elements) {
    // Early-return nothing if user does not have access.
    if (empty($elements)) {
      return;
    }

    // Do not print elements twice.
    if (!empty($elements['#printed'])) {
      return;
    }

    // If the default values for this element have not been loaded yet, populate
    // them.
    if (isset($elements['#type']) && empty($elements['#defaults_loaded'])) {
      $elements += $this->_formElement->elementInfo($elements['#type']);
    }

    // Make any final changes to the element before it is rendered. This means
    // that the $element or the children can be altered or corrected before the
    // element is rendered into the final text.
    //TODO pre_render
    if (isset($elements['#pre_render'])) {
      foreach ($elements['#pre_render'] as $function) {
        if (method_exists($this->_formElement,$function)) {
          $elements = $this->_formElement->$function($elements);
        }
      }
    }

    // Allow #pre_render to abort rendering.
    if (!empty($elements['#printed'])) {
      return;
    }

    // Get the children of the element, sorted by weight.
    $children = $this->_formElement->elementChildren($elements, TRUE);

    // Initialize this element's #children, unless a #pre_render callback already
    // preset #children.
    if (!isset($elements['#children'])) {
      $elements['#children'] = '';
    }

    // Call the element's #theme function if it is set. Then any children of the
    // element have to be rendered there.
    if (isset($elements['#theme'])) {
      $method = 'theme' . ucfirst($elements['#theme']);
      $elements['#children'] = $this->_formTheme->$method($elements);
    }

    // If #theme was not set and the element has children, render them now.
    // This is the same process as drupal_render_children() but is inlined
    // for speed.
    if ($elements['#children'] == '') {
      foreach ($children as $key) {
        $elements['#children'] .= $this->render($elements[$key]);
      }
    }

    // Let the theme functions in #theme_wrappers add markup around the rendered
    // children.
    if (isset($elements['#theme_wrappers'])) {
      foreach ($elements['#theme_wrappers'] as $theme_wrapper) {
        $method = 'theme' . ucfirst($theme_wrapper);
        $elements['#children'] = $this->_formTheme->$method($elements);
      }
    }

    // Filter the outputted content and make any last changes before the
    // content is sent to the browser. The changes are made on $content
    // which allows the output'ed text to be filtered.
    if (isset($elements['#post_render'])) {
      foreach ($elements['#post_render'] as $function) {
        //TODO post_render
        /* if (function_exists($function)) {
        $elements['#children'] = $function($elements['#children'], $elements);
        } */
      }
    }

    $prefix = isset($elements['#prefix']) ? $elements['#prefix'] : '';
    $suffix = isset($elements['#suffix']) ? $elements['#suffix'] : '';
    $output = $prefix . $elements['#children'] . $suffix;

    $elements['#printed'] = TRUE;
    return $output;
  }

  /**
   *
   * 表单默认验证
   * @param unknown_type $elements
   * @param unknown_type $form_state
   * @param unknown_type $form_id
   * @return return_type
   */
  public function _formValidate(&$elements, &$form_state, $form_id = NULL) {
    ;
  }

  private function validateForm($formId, &$form, &$formState) {
    $method = 'form_' . $formId . '_validate';
    $object = $this->_appInstance;
    if (method_exists($object, $method)) {
      $object->$method($form, $formState);
    }
    //判断是否出错
    if (count(self::$_errorInfo) > 0) {
      return json_encode(array('status' => 'error', 'message' => self::$_errorInfo));
    }
    return true;
  }

  private function submitForm($formId, $form, $formState) {
    $method = 'form_' . $formId . '_submit';
    $object = $this->_appInstance;
    $result = $object->$method($form, $formState);
    if (count(self::$_errorInfo) > 0) {
      return json_encode(array('status' => 'error', 'message' => self::$_errorInfo));
    } else {
      $url = empty($formState['redirect_url']) ? $object->getUrl() : $formState['redirect_url'];
      if ($object instanceof AppConsoleAbstract) {
        $redirect = $object->redirect($url);
        $redirect['status'] = 'ok';
        echo json_encode($redirect);
        exit;
      } else {
        //echo json_encode(array('status' => 'ok', 'redirect_url' => url($url), 'message' => array('info' => $this->_redirectMessage)));
        gotoUrl($url);
        exit;
      }
      return json_encode(array('status' => 'ok', 'message' => array('info' => $this->_redirectMessage)));
    }
  }

  private function redirect($formState) {
    if (isset($formState['redirect'])) {
      //TODO 转化为完整地址
      $url = $formState['redirect'];
      header('Location: ' . $url);
    }
  }

  public function setError($key, $message) {
    self::$_errorInfo[$key] = $message;
  }

  public function getError($key) {
    return self::$_errorInfo[$key];
  }

  public function getAllError() {
    return self::$_errorInfo;
  }

  public function setMessage($message) {
    $this->_redirectMessage = $message;
  }
}

class AppFormElement {
  private $_formTools;

  public function __construct() {
    $this->_formTools = new AppFormTools();
  }

  public function elementInfo($type = null) {
    $types['form'] = array(
      '#method' => 'post',
      '#action' => $this->_formTools->getRequestUri(),
      '#theme_wrappers' => array('form'),
    );

    $types['fieldset'] = array(
      '#collapsible' => FALSE,
      '#collapsed' => FALSE,
      '#value' => NULL,
      '#process' => array('formProcessFieldset'),
      '#pre_render' => array('form_pre_render_fieldset'),
      '#theme_wrappers' => array('fieldset'),
    );


    // Input elements.
    $types['submit'] = array(
        '#input' => TRUE,
        '#name' => 'op',
        '#button_type' => 'submit',
        '#executes_submit_callback' => TRUE,
        '#limit_validation_errors' => FALSE,
        '#theme_wrappers' => array('button'),
    );

    $types['textfield'] = array(
        '#input' => TRUE,
        '#size' => 60,
        '#maxlength' => 128,
        '#autocomplete_path' => FALSE,
        '#theme' => 'textfield',
        '#theme_wrappers' => array('formElement'),
    );

    $types['textarea'] = array(
        '#input' => TRUE,
        '#cols' => 60,
        '#rows' => 5,
        '#resizable' => TRUE,
        '#theme' => 'textarea',
        '#theme_wrappers' => array('formElement'),
    );
    $types['radios'] = array(
        '#input' => TRUE,
        '#process' => array('formProcessRadios'),
        '#theme_wrappers' => array('radios'),
        '#pre_render' => array('formPreRenderConditionalFormElement'),
    );

    $types['radio'] = array(
        '#input' => TRUE,
        '#default_value' => NULL,
        '#theme' => 'radio',
        '#theme_wrappers' => array('formElement'),
        '#title_display' => 'after',
    );

    $types['checkboxes'] = array(
        '#input' => TRUE,
        '#process' => array('formProcessCheckboxes'),
        '#theme_wrappers' => array('checkboxes'),
        '#pre_render' => array('formPreRenderConditionalFormElement'),
    );

    $types['checkbox'] = array(
        '#input' => TRUE,
        '#return_value' => 1,
        '#theme' => 'checkbox',
        '#process' => array('formProcessCheckbox'),
        '#theme_wrappers' => array('formElement'),
        '#title_display' => 'after',
    );

    $types['select'] = array(
        '#input' => TRUE,
        '#multiple' => FALSE,
        '#process' => array('formProcessSelect'),
        '#theme' => 'select',
        '#theme_wrappers' => array('formElement'),
    );

    $types['file'] = array(
        '#input' => TRUE,
        '#size' => 60,
        '#theme' => 'file',
        '#theme_wrappers' => array('formElement'),
    );

    // Form structure.
    $types['hidden'] = array(
        '#input' => TRUE,
        '#theme' => 'hidden',
    );

    $types['actions'] = array(
        '#theme_wrappers' => array('container'),
        '#process' => array('form_process_actions'),
        '#weight' => 100,
    );

    $types['token'] = array(
        '#input' => TRUE,
        '#theme' => 'hidden',
    );

    if (isset($type)) {
      $types[$type]['#type'] = $type;
      return $types[$type];
    }
    return $types;
  }

  public function elementChildren(&$elements, $sort = FALSE) {
    // Do not attempt to sort elements which have already been sorted.
    $sort = isset($elements['#sorted']) ? !$elements['#sorted'] : $sort;

    // Filter out properties from the element, leaving only children.
    $children = array();
    $sortable = FALSE;
    foreach ($elements as $key => $value) {
      if ($key === '' || $key[0] !== '#') {
        $children[$key] = $value;
        if (is_array($value) && isset($value['#weight'])) {
          $sortable = TRUE;
        }
      }
    }
    // Sort the children if necessary.
    if ($sort && $sortable) {
      //TODO 如何转化？？？？？？？？？？？
      //uasort($children, 'element_sort');
      // Put the sorted children back into $elements in the correct order, to
      // preserve sorting if the same element is passed through
      // $this->_formElement->elementChildren() twice.
      foreach ($children as $key => $child) {
        unset($elements[$key]);
        $elements[$key] = $child;
      }
      $elements['#sorted'] = TRUE;
    }
    return array_keys($children);
  }

  public function SetElementAttributes(array &$element, array $map) {
    foreach ($map as $property => $attribute) {
      // If the key is numeric, the attribute name needs to be taken over.
      if (is_int($property)) {
        $property = '#' . $attribute;
      }
      // Do not overwrite already existing attributes.
      if (isset($element[$property]) && !isset($element['#attributes'][$attribute])) {
        $element['#attributes'][$attribute] = $element[$property];
      }
    }
  }

  public function formSetClass(&$element, $class = array()) {
    if (!empty($class)) {
      if (!isset($element['#attributes']['class'])) {
        $element['#attributes']['class'] = array();
      }
      $element['#attributes']['class'] = array_merge($element['#attributes']['class'], $class);
    }
    // This function is invoked from form element theme functions, but the
    // rendered form element may not necessarily have been processed by
    // form_builder().
    if (!empty($element['#required'])) {
      $element['#attributes']['class'][] = 'required';
    }
    /*     if (isset($element['#parents']) && form_get_error($element)) {
     $element['#attributes']['class'][] = 'error';
    } */
  }

  public function formSelectOptions($element, $choices = NULL) {
    if (!isset($choices)) {
      $choices = $element['#options'];
    }
    // array_key_exists() accommodates the rare event where $element['#value'] is NULL.
    // isset() fails in this situation.
    $value_valid = isset($element['#value']) || array_key_exists('#value', $element);
    $value_is_array = $value_valid && is_array($element['#value']);
    $options = '';
    foreach ($choices as $key => $choice) {
      if (is_array($choice)) {
        $options .= '<optgroup label="' . $key . '">';
        $options .= $this->formSelectOptions($element, $choice);
        $options .= '</optgroup>';
      }
      elseif (is_object($choice)) {
        $options .= $this->formSelectOptions($element, $choice->option);
      }
      else {
        $key = (string) $key;
        if ($value_valid && (!$value_is_array && (string) $element['#value'] === $key || ($value_is_array && in_array($key, $element['#value'])))) {
          $selected = ' selected="selected"';
        }
        else {
          $selected = '';
        }
        $options .= '<option value="' . $this->_formTools->checkPlain($key) . '"' . $selected . '>' . $this->_formTools->checkPlain($choice) . '</option>';
      }
    }
    return $options;
  }

  public function formPreRenderConditionalFormElement($element) {
    // Set the element's title attribute to show #title as a tooltip, if needed.
    if (isset($element['#title']) && $element['#title_display'] == 'attribute') {
      $element['#attributes']['title'] = $element['#title'];
      if (!empty($element['#required'])) {
        // Append an indication that this field is required.
        $element['#attributes']['title'] .= ' (' . 'Required' . ')';
      }
    }

    if (isset($element['#title']) || isset($element['#description'])) {
      $element['#theme_wrappers'][] = 'formElement';
    }
    return $element;
  }

  public function formProcessCheckbox($element, $formState) {
    $value = $element['#value'];
    $return_value = $element['#return_value'];
    // On form submission, the #value of an available and enabled checked
    // checkbox is #return_value, and the #value of an available and enabled
    // unchecked checkbox is integer 0. On not submitted forms, and for
    // checkboxes with #access=FALSE or #disabled=TRUE, the #value is
    // #default_value (integer 0 if #default_value is NULL). Most of the time,
    // a string comparison of #value and #return_value is sufficient for
    // determining the "checked" state, but a value of TRUE always means checked
    // (even if #return_value is 'foo'), and a value of FALSE or integer 0 always
    // means unchecked (even if #return_value is '' or '0').
    if ($value === TRUE || $value === FALSE || $value === 0) {
      $element['#checked'] = (bool) $value;
    }
    else {
      // Compare as strings, so that 15 is not considered equal to '15foo', but 1
      // is considered equal to '1'. This cast does not imply that either #value
      // or #return_value is expected to be a string.
      $element['#checked'] = ((string) $value === (string) $return_value);
    }
    return $element;
  }

  public function formProcessCheckboxes($element) {
    $value = is_array($element['#value']) ? $element['#value'] : array();
    $element['#tree'] = TRUE;
    if (count($element['#options']) > 0) {
      if (!isset($element['#default_value']) || $element['#default_value'] == 0) {
        $element['#default_value'] = array();
      }
      $weight = 0;
      foreach ($element['#options'] as $key => $choice) {
        // Integer 0 is not a valid #return_value, so use '0' instead.
        // @see form_type_checkbox_value().
        // @todo For Drupal 8, cast all integer keys to strings for consistency
        //   with form_process_radios().
        if ($key === 0) {
          $key = '0';
        }
        // Maintain order of options as defined in #options, in case the element
        // defines custom option sub-elements, but does not define all option
        // sub-elements.
        $weight += 0.001;

        $element += array($key => array());
        $element[$key] += array(
            '#type' => 'checkbox',
            '#title' => $choice,
            '#return_value' => $key,
            '#default_value' => isset($value[$key]) ? $key : NULL,
            '#attributes' => $element['#attributes'],
            '#ajax' => isset($element['#ajax']) ? $element['#ajax'] : NULL,
            '#weight' => $weight,
        );
      }
    }
    return $element;
  }

  public function formProcessRadios($element) {
    if (count($element['#options']) > 0) {
      $weight = 0;
      foreach ($element['#options'] as $key => $choice) {
        // Maintain order of options as defined in #options, in case the element
        // defines custom option sub-elements, but does not define all option
        // sub-elements.
        $weight += 0.001;

        $element += array($key => array());
        // Generate the parents as the autogenerator does, so we will have a
        // unique id for each radio button.
        $parents_for_id = array_merge($element['#parents'], array($key));
        $element[$key] += array(
            '#type' => 'radio',
            '#title' => $choice,
        // The key is sanitized in drupal_attributes() during output from the
        // theme function.
            '#return_value' => $key,
            '#default_value' => isset($element['#default_value']) ? $element['#default_value'] : NULL,
            '#attributes' => $element['#attributes'],
            '#parents' => $element['#parents'],
            '#id' => $this->_formTools->createUniqueId('edit-' . implode('-', $parents_for_id)),
            '#weight' => $weight,
        );
      }
    }
    return $element;
  }

  public function formProcessFieldset(&$element, &$form_state) {
    $parents = implode('][', $element['#parents']);

    // Each fieldset forms a new group. The #type 'vertical_tabs' basically only
    // injects a new fieldset.
    $form_state['groups'][$parents]['#group_exists'] = TRUE;
    $element['#groups'] = &$form_state['groups'];

    // Process vertical tabs group member fieldsets.
    if (isset($element['#group'])) {
      // Add this fieldset to the defined group (by reference).
      $group = $element['#group'];
      $form_state['groups'][$group][] = &$element;
    }

    // The .form-wrapper class is required for #states to treat fieldsets like
    // containers.
    if (!isset($element['#attributes']['class'])) {
      $element['#attributes']['class'] = array();
    }

    return $element;
  }

  public function formProcessSelect($element) {
    // #multiple select fields need a special #name.
    if ($element['#multiple']) {
      $element['#attributes']['multiple'] = 'multiple';
      $element['#attributes']['name'] = $element['#name'] . '[]';
    }
    // A non-#multiple select needs special handling to prevent user agents from
    // preselecting the first option without intention. #multiple select lists do
    // not get an empty option, as it would not make sense, user interface-wise.
    else {
      $required = $element['#required'];
      // If the element is required and there is no #default_value, then add an
      // empty option that will fail validation, so that the user is required to
      // make a choice. Also, if there's a value for #empty_value or
      // #empty_option, then add an option that represents emptiness.
      if (($required && !isset($element['#default_value'])) || isset($element['#empty_value']) || isset($element['#empty_option'])) {
        $element += array(
            '#empty_value' => '',
            '#empty_option' => $required ? '- Select -' : '- None -',
        );
        // The empty option is prepended to #options and purposively not merged
        // to prevent another option in #options mistakenly using the same value
        // as #empty_value.
        $empty_option = array($element['#empty_value'] => $element['#empty_option']);
        $element['#options'] = $empty_option + $element['#options'];
      }
    }
    return $element;
  }

  public function formButtonWasClicked($element, &$formState) {
    // First detect normal 'vanilla' button clicks. Traditionally, all
    // standard buttons on a form share the same name (usually 'op'),
    // and the specific return value is used to determine which was
    // clicked. This ONLY works as long as $form['#name'] puts the
    // value at the top level of the tree of $_POST data.
    if (isset($formState['input'][$element['#name']]) && $formState['input'][$element['#name']] == $element['#value']) {
      return TRUE;
    }
    // When image buttons are clicked, browsers do NOT pass the form element
    // value in $_POST. Instead they pass an integer representing the
    // coordinates of the click on the button image. This means that image
    // buttons MUST have unique $form['#name'] values, but the details of
    // their $_POST data should be ignored.
    elseif (!empty($element['#has_garbage_value']) && isset($element['#value']) && $element['#value'] !== '') {
      return TRUE;
    }
    return FALSE;
  }

  public function formSetValue($element, $value, &$formState) {
    $this->_formTools->setNestedValue($formState['values'], $element['#parents'], $value, TRUE);
  }


}

class AppFormTheme {

  private $_formElement;

  private $_formTools;

  public function __construct() {
    $this->_formElement = new AppFormElement();
    $this->_formTools = new AppFormTools();
  }

  /**
   *
   * 渲染form
   * @param unknown_type $variables
   * @return return_type
   */
  public function themeForm($variables) {
    //print_r($variables);exit;
    $element = $variables;
    if (isset($element['#action'])) {
      //$element['#attributes']['action'] = drupal_strip_dangerous_protocols($element['#action']);
      $element['#attributes']['action'] = $element['#action'];
    }
    $this->_formElement->SetElementAttributes($element, array('method', 'id'));
    if (empty($element['#attributes']['accept-charset'])) {
      $element['#attributes']['accept-charset'] = "UTF-8";
    }
    if (isset($element['#attributes']['class'])) {
      $divClass = is_array($element['#attributes']['class']) ? implode(' ', $element['#attributes']['class']) : $element['#attributes']['class'];
    } else {
      $divClass = 'globalForm';
    }
    //form标签默认样式设为eip-cu-form
    $element['#attributes']['class'] = 'eip-cu-form';
    // Anonymous DIV to satisfy XHTML compliance.
    return '<form' . $this->_formTools->generateAttributes($element['#attributes']) . '><div class="' . $divClass . '">' . $element['#children'] . '</div></form>';
  }

  public function themeFieldset($variables) {
    $element = $variables;
    //element_set_attributes($element, array('id'));
    //_form_set_class($element, array('form-wrapper'));
    $this->_formElement->SetElementAttributes($element, array('id'));
    $this->_formElement->formSetClass($element, array('form-wrapper'));

    $output = '<fieldset' . $this->_formTools->generateAttributes($element['#attributes']) . '>';
    if (!empty($element['#title'])) {
      // Always wrap fieldset legends in a SPAN for CSS positioning.
      $output .= '<legend><span class="fieldset-legend">' . $element['#title'] . '</span></legend>';
    }
    $output .= '<div class="fieldset-wrapper">';
    if (!empty($element['#description'])) {
      $output .= '<div class="fieldset-description">' . $element['#description'] . '</div>';
    }
    $output .= $element['#children'];
    if (isset($element['#value'])) {
      $output .= $element['#value'];
    }
    $output .= '</div>';
    $output .= "</fieldset>\n";
    return $output;
  }
  public function themeButton($variables) {
    $element = $variables;
    $element['#attributes']['type'] = 'submit';
    $this->_formElement->SetElementAttributes($element, array('id', 'name', 'value'));
    $element['#attributes']['class'][] = 'form-' . $element['#button_type'];
    $element['#attributes']['class'][] = 'formBut';
    if (!empty($element['#attributes']['disabled'])) {
      $element['#attributes']['class'][] = 'form-button-disabled';
    }
    return '<ul><li><input' . $this->_formTools->generateAttributes($element['#attributes']) . ' /></li></ul>';
    //return '\n<input' . $this->_formTools->generateAttributes($element['#attributes']) . ' />';
  }

  public function themeTextarea($variables) {
    $element = $variables;
    $this->_formElement->SetElementAttributes($element, array('id', 'name', 'cols', 'rows'));
    $this->_formElement->formSetClass($element, array('form-textarea'));

    $wrapper_attributes = array(
        'class' => array('form-textarea-wrapper'),
    );

    /*     $output = '<div' . $this->_formTools->generateAttributes($wrapper_attributes) . '>';
     $output .= '<textarea' . $this->_formTools->generateAttributes($element['#attributes']) . '>' . $this->_formTools->checkPlain($element['#value']) . '</textarea>';
    $output .= '</div>'; */
    $output = '<li' . $this->_formTools->generateAttributes($wrapper_attributes) . '>';
    $output .= '<textarea' . $this->_formTools->generateAttributes($element['#attributes']) . '>' . $this->_formTools->checkPlain($element['#value']) . '</textarea>';
    $output .= '</li>';

    return $output;
  }

  public function themeSubmit($variables) {
    return $this->themeButton($variables);
  }

  public function themeCheckbox($variables) {
    $element = $variables;

    $element['#attributes']['type'] = 'checkbox';
    $this->_formElement->SetElementAttributes($element, array('id', 'name', '#return_value' => 'value'));

    // Unchecked checkbox has #value of integer 0.
    if (!empty($element['#checked'])) {
      $element['#attributes']['checked'] = 'checked';
    }
    //获取li样式
    $attributesStyle = array( 'class' => isset($element['#attributes']['class']) ? $element['#attributes']['class'] : 'form-checkbox');
    //设置input样式为空
    $element['#attributes']['class'] = array();
    $this->_formElement->formSetClass($element, array('form-checkbox'));
    //return '<input' . $this->_formTools->generateAttributes($element['#attributes']) . ' />';
    return '<li ' . $this->_formTools->generateAttributes($attributesStyle). '><input' . $this->_formTools->generateAttributes($element['#attributes']) . ' style=" vertical-align:middle"  /> ' . $element['#title'] . ' </li>';
  }

  public function themeCheckboxes($variables) {
    $element = $variables;
    $attributes = array();
    if (isset($element['#id'])) {
      $attributes['id'] = $element['#id'];
    }
    $attributes['class'][] = 'form-checkboxes';
    if (!empty($element['#attributes']['class'])) {
      $attributes['class'] = array_merge($attributes['class'], $element['#attributes']['class']);
    }

    //return '<div' . $this->_formTools->generateAttributes($attributes) . '>' . (!empty($element['#children']) ? $element['#children'] : '') . '</div>';

    //过滤
    $html = $element['#children'];
    $html = str_replace('<ul>', '', $html);
    $html = str_replace('</ul>', '', $html);
    return  '<ul>' . $html .'</ul>' ;

  }

  public function themeFormElement($variables) {
    $element = &$variables;

    // This function is invoked as theme wrapper, but the rendered form element
    // may not necessarily have been processed by form_builder().
    $element += array(
        '#title_display' => 'before',
    );
    // Add element #id for #type 'item'.
    if (isset($element['#markup']) && !empty($element['#id'])) {
      $attributes['id'] = $element['#id'];
    }
    // Add element's #type and #name as class to aid with JS/CSS selectors.
    $attributes['class'] = array('form-item');
    if (!empty($element['#type'])) {
      $attributes['class'][] = 'form-type-' . strtr($element['#type'], '_', '-');
    }
    if (!empty($element['#name'])) {
      $attributes['class'][] = 'form-item-' . strtr($element['#name'], array(' ' => '-', '_' => '-', '[' => '-', ']' => ''));
    }
    // Add a class for disabled elements to facilitate cross-browser styling.
    if (!empty($element['#attributes']['disabled'])) {
      $attributes['class'][] = 'form-disabled';
    }
    //$output = '<div' . $this->_formTools->generateAttributes($attributes) . '>' . "\n";
    $output = '<ul>' . "\n";
    // If #title is not set, we don't display any label or required marker.
    if (!isset($element['#title'])) {
      $element['#title_display'] = 'none';
    }
    $prefix = isset($element['#field_prefix']) ? '<span class="field-prefix">' . $element['#field_prefix'] . '</span> ' : '';
    $suffix = isset($element['#field_suffix']) ? ' <span class="field-suffix">' . $element['#field_suffix'] . '</span>' : '';

    switch ($element['#title_display']) {
      case 'before':
      case 'invisible':
        $output .= ' ' . $this->themeFormElementLabel($variables);
        $output .= ' ' . $prefix . $element['#children'] . $suffix . "\n";
        break;

      case 'after':
        $output .= ' ' . $prefix . $element['#children'] . $suffix;
        //$output .= ' ' . $this->themeFormElementLabel($variables) . "\n";
        break;

      case 'none':
      case 'attribute':
        // Output no label and no required marker, only the children.
        $output .= ' ' . $prefix . $element['#children'] . $suffix . "\n";
        break;
    }

    /*     if (!empty($element['#description'])) {
     $output .= '<div class="description">' . $element['#description'] . "</div>\n";
    } */

    $output .= "</ul>\n";

    return $output;
  }

  public function themeFile($variables) {
    $element = $variables;
    $attributes = array();
    if (isset($element['#id'])) {
      $attributes['id'] = $element['#id'];
    }
    $attributes['class'][] = 'form-files';
    if (!empty($element['#attributes']['class'])) {
      $attributes['class'] = array_merge($attributes['class'], $element['#attributes']['class']);
    }

    //return '<div' . $this->_formTools->generateAttributes($attributes) . '>' . (!empty($element['#children']) ? $element['#children'] : '') . '</div>';

    //过滤
    //$html = $element['#children'];
    $html = "<input type='file' name='lnk_img' id='lnk_img' onchange='checkimg(this);' />";
    return  '<li>' . $html .'</li>' ;
  }

  public function themeFormElementLabel($variables) {
    $element = $variables;

    // If title and required marker are both empty, output no label.
    if ((!isset($element['#title']) || $element['#title'] === '') && empty($element['#required'])) {
      return '';
    }

    // If the element is required, a required marker is appended to the label.
    //$required = !empty($element['#required']) ? theme('form_required_marker', array('element' => $element)) : '';
    $required = '';
    //$title = filter_xss_admin($element['#title']);
    $title = $element['#title'];
    $attributes = array();
    // Style the label as class option to display inline with the element.
    if ($element['#title_display'] == 'after') {
      $attributes['class'] = 'option';
    }
    // Show label only to screen readers to avoid disruption in visual flows.
    elseif ($element['#title_display'] == 'invisible') {
      $attributes['class'] = 'element-invisible';
    }

    if (!empty($element['#id'])) {
      $attributes['for'] = $element['#id'];
    }
    // The leading whitespace helps visually separate fields from inline labels.
    //return ' <label' . $this->_formTools->generateAttributes($attributes) . '>' . $title . "</label>\n";
    if ($element['#title_display'] == 'after') {
      return  $title . "\n";
    } else {
      return ' <li' . $this->_formTools->generateAttributes($attributes) . ' class="bold">' . $title . " </li>\n";
    }
  }

  public function themeHidden($variables) {
    $element = $variables;
    $element['#attributes']['type'] = 'hidden';
    $this->_formElement->SetElementAttributes($element, array('name', 'value'));
    return '<input' . $this->_formTools->generateAttributes($element['#attributes']) . " />\n";
  }

  public function themeRadio($variables) {
    $element = $variables;
    $element['#attributes']['type'] = 'radio';
    $this->_formElement->SetElementAttributes($element, array('id', 'name', '#return_value' => 'value'));

    if (isset($element['#return_value']) && $element['#value'] !== FALSE && $element['#value'] == $element['#return_value']) {
      $element['#attributes']['checked'] = 'checked';
    }
    $this->_formElement->formSetClass($element, array('form-radio'));
    //return '<input' . $this->_formTools->generateAttributes($element['#attributes']) . ' />';
    return '<li><input' . $this->_formTools->generateAttributes($element['#attributes']) . ' style=" vertical-align:middle" /> ' . $element['#title'] .' </li>';
  }

  public function themeRadios($variables) {
    $element = $variables;
    $attributes = array();
    if (isset($element['#id'])) {
      $attributes['id'] = $element['#id'];
    }
    $attributes['class'] = 'form-radios';
    if (!empty($element['#attributes']['class'])) {
      $attributes['class'] .= ' ' . implode(' ', $element['#attributes']['class']);
    }
    //return '<div' . $this->_formTools->generateAttributes($attributes) . '>' . (!empty($element['#children']) ? $element['#children'] : '') . '</div>';

    //过滤
    $html = $element['#children'];
    $html = str_replace('<ul>', '', $html);
    $html = str_replace('</ul>', '', $html);
    return  $html ;
  }

  public function themeSelect($variables) {
    $element = $variables;
    $this->_formElement->SetElementAttributes($element, array('id', 'name', 'size'));
    $this->_formElement->formSetClass($element, array('form-select'));

    //return '<select' . $this->_formTools->generateAttributes($element['#attributes']) . '>' . $this->_formElement->formSelectOptions($element) . '</select>';
    return '<li><select' . $this->_formTools->generateAttributes($element['#attributes']) . '>' . $this->_formElement->formSelectOptions($element) . '</select></li>';
  }

  public function themeTextfield($variables) {
    $element = $variables;
    $element['#attributes']['type'] = 'text';
    $this->_formElement->SetElementAttributes($element, array('id', 'name', 'value', 'size', 'maxlength'));
    $this->_formElement->formSetClass($element, array('form-text','globalFormInput'));
    $extra = '';
    //$output = '<input' . $this->_formTools->generateAttributes($element['#attributes']) . ' />';
    $output = '<li><input' . $this->_formTools->generateAttributes($element['#attributes']) . ' /></li>';
    return $output . $extra;
  }

  public function themeTextFormat($variables){
    echo 111;exit;
  }


}

class AppFormHelper {

  /**
  *
  * 设置默认值
  * @param unknown_type $element
  * @param unknown_type $input
  * @return return_type
  */
  public function formTypeCheckboxesValue($element, $input = FALSE) {
    if ($input === FALSE) {
      $value = array();
      $element += array('#default_value' => array());
      foreach ($element['#default_value'] as $key) {
        $value[$key] = $key;
      }
      return $value;
    }
    elseif (is_array($input)) {
      // Programmatic form submissions use NULL to indicate that a checkbox
      // should be unchecked; see drupal_form_submit(). We therefore remove all
      // NULL elements from the array before constructing the return value, to
      // simulate the behavior of web browsers (which do not send unchecked
      // checkboxes to the server at all). This will not affect non-programmatic
      // form submissions, since all values in $_POST are strings.
      foreach ($input as $key => $value) {
        if (!isset($value)) {
          unset($input[$key]);
        }
      }
      return $this->mapAssoc($input);
    }
    else {
      return array();
    }
  }

  public function formTypeCheckboxValue($element, $input = FALSE) {
    if ($input === FALSE) {
      // Use #default_value as the default value of a checkbox, except change
      // NULL to 0, because _form_builder_handle_input_element() would otherwise
      // replace NULL with empty string, but an empty string is a potentially
      // valid value for a checked checkbox.
      return isset($element['#default_value']) ? $element['#default_value'] : 0;
    }
    else {
      // Checked checkboxes are submitted with a value (possibly '0' or ''):
      // http://www.w3.org/TR/html401/interact/forms.html#successful-controls.
      // For checked checkboxes, browsers submit the string version of
      // #return_value, but we return the original #return_value. For unchecked
      // checkboxes, browsers submit nothing at all, but
      // _form_builder_handle_input_element() detects this, and calls this
      // function with $input=NULL. Returning NULL from a value callback means to
      // use the default value, which is not what is wanted when an unchecked
      // checkbox is submitted, so we use integer 0 as the value indicating an
      // unchecked checkbox. Therefore, modules must not use integer 0 as a
      // #return_value, as doing so results in the checkbox always being treated
      // as unchecked. The string '0' is allowed for #return_value. The most
      // common use-case for setting #return_value to either 0 or '0' is for the
      // first option within a 0-indexed array of checkboxes, and for this,
      // form_process_checkboxes() uses the string rather than the integer.
      return isset($input) ? $element['#return_value'] : 0;
    }
  }

  public function formTypeSelectValue($element, $input = FALSE) {
    if ($input !== FALSE) {
      if (isset($element['#multiple']) && $element['#multiple']) {
        // If an enabled multi-select submits NULL, it means all items are
        // unselected. A disabled multi-select always submits NULL, and the
        // default value should be used.
        if (empty($element['#disabled'])) {
          return (is_array($input)) ? $this->mapAssoc($input) : array();
        }
        else {
          return (isset($element['#default_value']) && is_array($element['#default_value'])) ? $element['#default_value'] : array();
        }
      }
      // Non-multiple select elements may have an empty option preprended to them
      // (see form_process_select()). When this occurs, usually #empty_value is
      // an empty string, but some forms set #empty_value to integer 0 or some
      // other non-string constant. PHP receives all submitted form input as
      // strings, but if the empty option is selected, set the value to match the
      // empty value exactly.
      elseif (isset($element['#empty_value']) && $input === (string) $element['#empty_value']) {
        return $element['#empty_value'];
      }
      else {
        return $input;
      }
    }
  }

  public function formTypeTextfieldValue($element, $input = FALSE) {
    if ($input !== FALSE && $input !== NULL) {
      // Equate $input to the form value to ensure it's marked for
      // validation.
      return str_replace(array("\r", "\n"), '', $input);
    }
  }


}

class AppFormTools {

  public function getRequestUri() {
    if (isset($_SERVER['REQUEST_URI'])) {
      $uri = $_SERVER['REQUEST_URI'];
    }
    else {
      if (isset($_SERVER['argv'])) {
        $uri = $_SERVER['SCRIPT_NAME'] . '?' . $_SERVER['argv'][0];
      }
      elseif (isset($_SERVER['QUERY_STRING'])) {
        $uri = $_SERVER['SCRIPT_NAME'] . '?' . $_SERVER['QUERY_STRING'];
      }
      else {
        $uri = $_SERVER['SCRIPT_NAME'];
      }
    }
    // Prevent multiple slashes to avoid cross site requests via the Form API.
    $uri = '/' . ltrim($uri, '/');

    return $uri;
  }

  public function generateAttributes(array $attributes = array()) {
    foreach ($attributes as $attribute => &$data) {
      $data = implode(' ', (array) $data);
      $data = $attribute . '="' . $this->checkPlain($data) . '"';
    }
    return $attributes ? ' ' . implode(' ', $attributes) : '';
  }

  public function checkPlain($data) {
    //TODO
    return $data;
  }

  public function createUniqueId($id) {
    //TODO
    return $id;
  }

  public function getNestedValue(array &$array, array $parents, &$key_exists = NULL) {
    $ref = &$array;
    foreach ($parents as $parent) {
      if (is_array($ref) && array_key_exists($parent, $ref)) {
        $ref = &$ref[$parent];
      }
      else {
        $key_exists = FALSE;
        return NULL;
      }
    }
    $key_exists = TRUE;
    return $ref;
  }

  public function nestedKeyIsExists(array $array, array $parents) {
    // Although this function is similar to PHP's array_key_exists(), its
    // arguments should be consistent with $this->getNestedValue().
    $key_exists = NULL;
    $this->getNestedValue($array, $parents, $key_exists);
    return $key_exists;
  }

  public function setNestedValue(array &$array, array $parents, $value, $force = FALSE) {
    $ref = &$array;
    foreach ($parents as $parent) {
      // PHP auto-creates container arrays and NULL entries without error if $ref
      // is NULL, but throws an error if $ref is set, but not an array.
      if ($force && isset($ref) && !is_array($ref)) {
        $ref = array();
      }
      $ref = &$ref[$parent];
    }
    $ref = $value;
  }

  public function mapAssoc($array, $function = NULL) {
    // array_combine() fails with empty arrays:
    // http://bugs.php.net/bug.php?id=34857.
    $array = !empty($array) ? array_combine($array, $array) : array();
    if (is_callable($function)) {
      $array = array_map($function, $array);
    }
    return $array;
  }

  public function formHashBase64($data) {
    $hash = base64_encode(hash('sha256', $data, TRUE));
    // Modify the hash so it's safe to use in URLs.
    return strtr($hash, array('+' => '-', '/' => '_', '=' => ''));
  }

  public function getFormToken($value = '') {
    //TODO
    return  md5('aop'.$value);
  }
}