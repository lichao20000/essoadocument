package cn.flying.rest.service.utils;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.jdom.Document;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;

import cn.flying.rest.service.ITransferFlowService;
import cn.flying.rest.service.entiry.FormComboEntity;
import cn.flying.rest.service.entiry.FormComboValuesEntity;

/**
 * 导出表单，工作流工具类
 * 
 * 
 */
public class ExportWFDataUtil {
  private static ExportWFDataUtil util = null;

  public static ExportWFDataUtil newInstance(
      ITransferFlowService transferFlowService) {
    if (null == util)
      util = new ExportWFDataUtil(transferFlowService);
    return util;
  }

  private ITransferFlowService transferFlowService;
  // 表单
  private Map<String, Object> formEn = null;
  // 工作流模版
  private Map<String, Object> model = null;
  // 步骤
  private List<Map<String, Object>> steps = null;
  // 动作
  private List<Map<String, Object>> actions = null;
  // 函数
  private Map<String, Map<String, Object>> funs = new HashMap<String, Map<String, Object>>();
  // 表单类型
  private Map<String, Object> formType = null;
  // 工作流类型
  private Map<String, Object> modelType = null;
  // 表达式
  private List<Map<String, Object>> expressions = null;

  // 数据字典
  private List<String> comboboxs = new ArrayList<String>();
  /**
   * 1 表单 2 模版 3 all
   */
  private String expType;

  private String expFilePath;

  private ExportWFDataUtil(ITransferFlowService transferFlowService) {
    this.transferFlowService = transferFlowService;
  }

  /**
   * 往dom中添加工作流动作
   * 
   * @param rootElement
   * @param modelId
   * @return
   */
  private void addActionToDom(Element rootElement) throws Exception {
    if (null == actions)
      return;
    Element actionElements = new Element("actions");
    for (Map<String, Object> action : actions) {
      Element actionElement = new Element("action");

      Element stepId = new Element("stepId");
      Element name = new Element("name");
      Element condition = new Element("condition");
      Element freFun = new Element("freFun");
      Element postFun = new Element("postFun");
      Element modelId = new Element("modelId");
      Element actionId = new Element("actionId");
      Element isEmail = new Element("isEmail");
      Element isMessage = new Element("isMessage");
      Element message = new Element("message");
      Element noticeUsers = new Element("noticeUsers");
      Element noticeRoles = new Element("noticeRoles");
      Element isNoticeCaller = new Element("isNoticeCaller");
      Element isValidateForm = new Element("isValidateForm");

      setText(stepId, this.checkIfNull(action.get("step_id"), ""));
      setText(name, this.checkIfNull(action.get("name"), ""));
      setText(condition, this.checkIfNull(action.get("condition"), ""));
      setText(freFun, this.checkIfNull(action.get("frefunction"), ""));
      setText(postFun, this.checkIfNull(action.get("postfunction"), ""));
      setText(modelId, this.checkIfNull(action.get("flow_id"), ""));
      setText(actionId, this.checkIfNull(action.get("action_id"), ""));
      setText(isEmail, this.checkIfNull(action.get("is_email"), ""));
      setText(isMessage, this.checkIfNull(action.get("is_message"), ""));
      setText(message, this.checkIfNull(action.get("action_message"), ""));
      setText(noticeUsers, this.checkIfNull(action.get("notice_users"), ""));
      setText(noticeRoles, this.checkIfNull(action.get("notice_roles"), ""));
      setText(isNoticeCaller,
          this.checkIfNull(action.get("is_notice_caller"), ""));
      setText(isValidateForm,
          this.checkIfNull(action.get("is_validate_form"), ""));
      Element[] es = new Element[] { stepId, name, condition, freFun, postFun,
          modelId, actionId, isEmail, isMessage, message, noticeUsers,
          noticeRoles, isNoticeCaller, isValidateForm };
      addChild(actionElement, es);

      actionElements.addContent(actionElement);
    }
    rootElement.addContent(actionElements);
  }

  private void addChild(Element parent, Element[] childs) {
    for (Element e : childs)
      parent.addContent(e);
  }

  /**
   * 往dom中添加表单相关的数据字典
   * 
   * @param rootElement
   * @param formId
   * @return
   */
  private void addComboboxToDom(Element rootElement) throws Exception {
    if (null == comboboxs)
      return;
    Element comboboxElements = new Element("comboboxs");
    for (String ident : comboboxs) {

      if ("COMBO_TYPE_ORGAN".equals(ident) || "COMBO_TYPE_USER".equals(ident))
        continue;

      FormComboEntity comboEntity = transferFlowService
          .getComboEntityByIdentifier(ident);
      List<FormComboValuesEntity> values = transferFlowService.getComboValues(
          comboEntity.getId(), 0,
          transferFlowService.getComboValueCount(comboEntity.getId(), null),
          null);

      Element comboboxElement = new Element("combobox");

      Element identifier = new Element("identifier");
      Element combovalue = new Element("combovalue");

      setText(identifier, comboEntity.getIdentifier());
      setText(combovalue, comboEntity.getComboValue());

      for (FormComboValuesEntity valueEnti : values) {
        Element childValue = new Element("childValue");

        Element propertyValue = new Element("propertyValue");
        Element textValue = new Element("textValue");

        setText(propertyValue, valueEnti.getPropertyValue());
        setText(textValue, valueEnti.getTextValue());

        Element[] es = new Element[] { propertyValue, textValue };
        addChild(childValue, es);

        comboboxElement.addContent(childValue);

      }

      Element[] es = new Element[] { identifier, combovalue };
      addChild(comboboxElement, es);

      comboboxElements.addContent(comboboxElement);
    }

    rootElement.addContent(comboboxElements);
  }

  /**
   * 往dom中添加表单相关的自动计算表单式
   * 
   * @param rootElement
   * @param formId
   * @return
   */
  private void addExpressionToDom(Element rootElement) throws Exception {
    if (null == expressions)
      return;

    Element expressionElements = new Element("expressions");

    for (Map<String, Object> express : expressions) {
      Element expressionElement = new Element("expression");

      Element expression = new Element("expression");
      Element desc = new Element("desc");

      setText(expression, this.checkIfNull(express.get("expression"), ""));
      setText(desc, this.checkIfNull(express.get("expression_desc"), ""));

      Element[] es = new Element[] { expression, desc };
      addChild(expressionElement, es);

      expressionElements.addContent(expressionElement);
    }

    rootElement.addContent(expressionElements);
  }

  /**
   * 往dom中添加表单
   * 
   * @param rootElement
   * @param formId
   * @return
   */
  private void addFormToDom(Element rootElement) throws Exception {
    if (null == formEn)
      return;
    Element formElement = new Element("form");

    Element id = new Element("id");
    Element title = new Element("title");
    Element modelId = new Element("modelId");
    Element formId = new Element("formId");
    Element stageId = new Element("stageId");
    Element showType = new Element("showType");
    Element extPage = new Element("extPage");
    Element htmlPage = new Element("htmlPage");

    setText(id, this.checkIfNull(formEn.get("id"), ""));
    setText(title, this.checkIfNull(formEn.get("name"), ""));
    setText(modelId, this.checkIfNull(formEn.get("flow_id"), ""));
    setText(formId, this.checkIfNull(formEn.get("form_id"), ""));
    setText(stageId, this.checkIfNull(formEn.get("form_type_id"), ""));
    setText(showType, this.checkIfNull(formEn.get("show_type"), ""));
    setText(extPage, this.checkIfNull(formEn.get("form_js"), ""));
    setText(htmlPage, this.checkIfNull(formEn.get("form_js_html"), ""));

    Element[] es = new Element[] { id, title, modelId, formId, stageId,
        showType, extPage, htmlPage };
    addChild(formElement, es);
    rootElement.addContent(formElement);
  }

  /**
   * 往dom中添加表单类型
   * 
   * @param rootElement
   * @param formTypeId
   * @return
   */
  private void addFormTypeToDom(Element rootElement) throws Exception {
    if (null == formEn)
      return;
    Element formTypeElement = new Element("formType");

    Element id = new Element("id");
    Element title = new Element("title");

    setText(id, this.checkIfNull(formType.get("id"), ""));
    setText(title, this.checkIfNull(formType.get("name"), ""));

    Element[] es = new Element[] { id, title };
    addChild(formTypeElement, es);

    rootElement.addContent(formTypeElement);
  }

  /**
   * 往dom中添加函数
   * 
   * @param rootElement
   * @param modelId
   * @return
   */
  private void addFunToDom(Element rootElement) throws Exception {
    if (null == funs)
      return;
    Element funElements = new Element("functions");
    for (String funId : funs.keySet()) {
      Map<String, Object> functionMap = funs.get(funId);
      Element funElement = new Element("function");

      Element id = new Element("id");
      Element fullPath = new Element("fullPath");
      Element name = new Element("name");
      Element method = new Element("method");
      Element description = new Element("description");

      setText(id, funId);
      setText(fullPath,
          this.checkIfNull(functionMap.get("restFullClassName"), ""));
      setText(name, this.checkIfNull(functionMap.get("functionName"), ""));
      setText(method, this.checkIfNull(functionMap.get("exeFunction"), ""));
      setText(description, this.checkIfNull(functionMap.get("description"), ""));

      Element[] es = new Element[] { id, fullPath, name, method, description };
      addChild(funElement, es);
      funElements.addContent(funElement);
    }
    rootElement.addContent(funElements);
  }

  /**
   * 往dom中添加工作流模版
   * 
   * @param rootElement
   * @param modelId
   * @return
   */
  private void addModelToDom(Element rootElement) throws Exception {
    if (null == model)
      return;
    Element modelElement = new Element("model");

    Element id = new Element("id");
    Element name = new Element("name");
    Element desc = new Element("desc");
    Element firstStepRole = new Element("firstStepRole");
    Element firstStepUser = new Element("firstStepUser");
    Element formId = new Element("formId");
    Element formTable = new Element("formTable");
    Element firstStepId = new Element("firstStepId");
    Element business = new Element("business");
    Element graphXML = new Element("graphXML");
    Element graphHTML = new Element("graphHTML");
    Element examine_time = new Element("examine_time");
    Element approval_time = new Element("approval_time");
    Element submitted_time = new Element("submitted_time");

    setText(id, this.checkIfNull(model.get("id"), ""));
    setText(name, this.checkIfNull(model.get("name"), ""));
    setText(desc, this.checkIfNull(model.get("describtion"), ""));
    setText(firstStepRole, this.checkIfNull(model.get("first_step_roles"), ""));
    setText(firstStepUser, this.checkIfNull(model.get("first_step_users"), ""));
    setText(formId, this.checkIfNull(model.get("form_relation"), ""));
    setText(formTable, this.checkIfNull(model.get("relation_table"), ""));
    setText(firstStepId, this.checkIfNull(model.get("first_step_id"), ""));
    setText(business, this.checkIfNull(model.get("business_relation"), ""));
    setText(graphXML, this.checkIfNull(model.get("graphXml"), ""));
    setText(graphHTML, this.checkIfNull(model.get("flowGraph"), ""));
    setText(examine_time, this.checkIfNull(model.get("examine_time"), ""));
    setText(approval_time, this.checkIfNull(model.get("approval_time"), ""));
    setText(submitted_time, this.checkIfNull(model.get("submitted_time"), ""));

    Element[] es = new Element[] { id, name, desc, firstStepRole,
        firstStepUser, formId, formTable, firstStepId, business, graphXML,
        graphHTML };
    addChild(modelElement, es);

    rootElement.addContent(modelElement);
  }

  /**
   * 往dom中添加工作流模版类型
   * 
   * @param rootElement
   * @param modelTypeId
   * @return
   */
  private void addModelTypeToDom(Element rootElement) throws Exception {
    if (null == model)
      return;
    Element modelTypeElement = new Element("modelType");

    Element id = new Element("id");
    Element pId = new Element("pId");
    Element title = new Element("title");

    setText(id, this.checkIfNull(modelType.get("id"), ""));
    setText(pId, this.checkIfNull(modelType.get("pId"), ""));
    setText(title, this.checkIfNull(modelType.get("name"), ""));

    Element[] es = new Element[] { id, pId, title };
    addChild(modelTypeElement, es);

    rootElement.addContent(modelTypeElement);
  }

  /**
   * 往dom中添加工作流步骤
   * 
   * @param rootElement
   * @param modelId
   * @return
   */
  private void addStepToDom(Element rootElement) throws Exception {
    if (null == steps)
      return;
    Element stepElements = new Element("steps");
    for (Map<String, Object> step : steps) {
      Element stepElement = new Element("step");

      Element modelId = new Element("modelId");
      Element name = new Element("name");
      Element nextStepRole = new Element("nextStepRole");
      Element nextStepUser = new Element("nextStepUser");
      Element childStepId = new Element("childStepId");
      Element parentStepId = new Element("parentStepId");
      Element editField = new Element("editField");
      Element stepId = new Element("stepId");
      Element isRelationOrgan = new Element("isRelationOrgan");
      Element isCounterSign = new Element("isCounterSign");
      Element isRelationCaller = new Element("isRelationCaller");
      Element editFieldPrint = new Element("editFieldPrint");

      setText(modelId, this.checkIfNull(model.get("id"), ""));
      setText(name, this.checkIfNull(step.get("name"), ""));
      setText(nextStepRole, this.checkIfNull(step.get("next_step_roles"), ""));
      setText(nextStepUser, this.checkIfNull(step.get("next_step_users"), ""));
      setText(childStepId, this.checkIfNull(step.get("step_child_id"), ""));
      setText(parentStepId, this.checkIfNull(step.get("step_parent_id"), ""));
      setText(editField, this.checkIfNull(step.get("edit_field"), ""));
      setText(stepId, this.checkIfNull(step.get("step_id"), ""));
      setText(isRelationOrgan,
          this.checkIfNull(step.get("is_relationpart"), ""));
      setText(isCounterSign, this.checkIfNull(step.get("is_countersign"), ""));
      setText(isRelationCaller,
          this.checkIfNull(step.get("is_relationcaller"), ""));
      setText(editFieldPrint,
          this.checkIfNull(step.get("edit_field_print"), ""));
      Element[] es = new Element[] { modelId, name, nextStepRole, nextStepUser,
          childStepId, parentStepId, editField, stepId, isRelationOrgan,
          isCounterSign, isRelationCaller, editFieldPrint };
      addChild(stepElement, es);

      stepElements.addContent(stepElement);
    }
    rootElement.addContent(stepElements);
  }

  private String checkIfNull(Object obj, String value) {
    if (obj != null) {
      return obj.toString();
    }
    return value;
  }

  public void convertToXML(Document dom, String filePath) {
    XMLOutputter out = new XMLOutputter();
    String tempFile = filePath.replace(".wf", ".xml");
    File file = new File(tempFile);
    OutputStream outStream = null;
    try {
      outStream = new FileOutputStream(file);
      out.output(dom, outStream);
      outStream.flush();
      outStream.close();
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
    Base64Util.encode(tempFile, filePath);
    file.delete();
  }

  /**
   * 通过表单ID导出工作流及关联表单
   * 
   * @param formId
   * @return
   * @throws Exception
   */
  public boolean exportWFDataByFormId(String formId, String expType,
      String expFilePath) {

    initByFormId(formId, expType, expFilePath);

    return wirteXML();
  }

  /**
   * 通过工作流模版ID导出工作流模版及相关表单
   * 
   * @param modelId
   * @return
   */
  public boolean exportWFDataByModelId(Long modelId, String expType,
      String expFilePath) {

    initByModelId(modelId, expType, expFilePath);

    return wirteXML();
  }

  private void initByFormId(String formId, String expType, String expFilePath) {
    this.expType = expType;
    this.expFilePath = expFilePath;
    formEn = transferFlowService.getFormById(formId);
    String wfmodels = formEn.get("flow_id").toString();
    if (null != wfmodels) {
      model = transferFlowService.getModelInit(Long.parseLong(wfmodels));
    } else {
      model = null;
    }
    initOthers();
  }

  private void initByModelId(Long modelId, String expType, String expFilePath) {
    this.expType = expType;
    this.expFilePath = expFilePath;
    model = transferFlowService.getModelInit(modelId);
    if (model.get("form_relation") != null) {
      String formIds = model.get("form_relation").toString();
      if (null != formIds) {
        formEn = transferFlowService.getFormById(formIds);
      } else {
        formEn = null;
      }
    }
    initOthers();
  }

  private void initOthers() {
    if (null != model) {
      steps = transferFlowService.getStepByFlowId(Long.parseLong(model
          .get("id").toString()));
      actions = transferFlowService.getActionByFlowId(Long.parseLong(model.get(
          "id").toString()));
      if (null != actions) {
        for (Map<String, Object> action : actions) {
          Object freFun = action.get("frefunction");
          if (null != freFun && !funs.keySet().contains(freFun.toString()))
            funs.put(freFun.toString(), transferFlowService
                .getFunctionById(Integer.parseInt(freFun.toString())));
          Object postFun = action.get("postfunction");
          if (null != postFun && !"".equals(postFun.toString())
              && !funs.keySet().contains(postFun.toString()))
            funs.put(postFun.toString(), transferFlowService
                .getFunctionById(Integer.parseInt(postFun.toString())));
        }
      }
      modelType = transferFlowService.getTypeById(Long.parseLong(model.get(
          "type_id").toString()));
      if (null == modelType || modelType.isEmpty()) {
        modelType = new HashMap<String, Object>();
      }
    } else {
      steps = null;
      actions = null;
      funs = new HashMap<String, Map<String, Object>>();
      modelType = new HashMap<String, Object>();
    }

    if (null != formEn) {
      List<Map<String, Object>> maps = transferFlowService.getFormByTypeId(Long
          .parseLong(this.checkIfNull(formEn.get("form_type_id"), "-1")));
      if (null != maps && !maps.isEmpty()) {
        formType = maps.get(0);
      } else {
        formType = new HashMap<String, Object>();
      }

      String[] arrayStr = this.checkIfNull(formEn.get("form_js"), "").split(
          "\n");
      for (int i = 0; i < arrayStr.length; i++) {
        if (arrayStr[i].contains("xtype")) {
          String[] arrayFieldname = arrayStr[i].split(":");
          String types = arrayFieldname[1].replace(',', ' ').trim();
          String type = types.split("\"")[1];
          if (type.equals("combo")) {
            String findValue = "";
            int tempIndex = i;
            do {
              findValue = arrayStr[tempIndex];
              tempIndex++;
            } while (!findValue.contains("value"));
            String str = findValue.split(":")[1];
            if (str.indexOf("\"") != str.lastIndexOf("\"") - 1) {
              String strv = str.split("\"")[1];
              comboboxs.add(strv);
            }
          }
        }
      }
    } else {
      formType = new HashMap<String, Object>();
      expressions = null;
      comboboxs = new ArrayList<String>();
    }
  }

  private void setText(Element e, String text) {
    e.setText(text);
  }

  private boolean wirteXML() {
    boolean check = true;

    // 产生基本的dom对象
    Document doc = new Document();
    Element rootElement = new Element("root");
    rootElement.setAttribute("importType", expType);
    doc.setRootElement(rootElement);
    try {
      // 组装表单相关的数据
      if (null != formEn && !"2".equals(expType)) {
        addFormToDom(rootElement);
        addFormTypeToDom(rootElement);
        addExpressionToDom(rootElement);
        addComboboxToDom(rootElement);
      }
      // 组装工作流模版相关的数据
      if (null != model && !"1".equals(expType)) {
        addModelToDom(rootElement);
        addStepToDom(rootElement);
        addActionToDom(rootElement);
        addFunToDom(rootElement);
        addModelTypeToDom(rootElement);
      }
    } catch (Exception e) {
      // 组装相关出错处理
      check = false;
    }
    convertToXML(doc, expFilePath);
    return check;
  }
}
