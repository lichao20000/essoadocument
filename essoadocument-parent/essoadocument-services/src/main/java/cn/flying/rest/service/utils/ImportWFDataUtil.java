package cn.flying.rest.service.utils;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import cn.flying.rest.service.ITransferFlowService;

/**
 * 导入表单，工作流工具类
 * 
 */
public class ImportWFDataUtil {

  // 解析导出文件生成
  private Document document = null;
  // 工作流模版类型
  private String modelTypeId = null;
  // 表单实体
  private Map<String, Object> formEn = null;
  // 工作流模版实体
  private Map<String, Object> modelEn = null;
  private String userId = "";
  // 文件类型 1 表单文件 2 模版文件 3 表单文件和模版文件
  private String importType;
  private ITransferFlowService transferFlowService;

  // 私有构造
  private ImportWFDataUtil(ITransferFlowService transferFlowService) {
    this.transferFlowService = transferFlowService;
  }

  public static ImportWFDataUtil newInstance(
      ITransferFlowService transferFlowService) {
    return new ImportWFDataUtil(transferFlowService);
  }

  /**
   * 导入工作流数据及表单数据，这是对外提供的方法
   * 
   * @param fullPath
   * @param user
   * @return
   */
  public boolean importWFData(String fullPath, String userId, String typeId) {
    this.userId = userId;
    boolean check = true;
    document = null;
    modelTypeId = typeId;
    formEn = null;
    modelEn = null;
    document = initDocument(fullPath);
    importType = document.getDocumentElement().getAttribute("importType");
    try {
      addModelTypeToDB();
      addFunctionsToDB();
      addModelToDB();
      addFormToDB();
      addStepsToDB();
      addActionsToDB();
      if (null != formEn && null != modelEn) {
        formEn.put("flow_id", modelEn.get("id").toString());
        if (!"3".equals(importType)) {
          formEn.put("flow_id", "");
        }
      }
    } catch (Exception e) {
      e.printStackTrace();
      check = false;
    }
    new File(fullPath).delete();
    return check;
  }

  // 构建document对象
  private Document initDocument(String file) {
    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    DocumentBuilder builder;
    Document document = null;
    try {
      builder = factory.newDocumentBuilder();
      document = builder.parse(new File(file));
    } catch (Exception e) {
      e.printStackTrace();
    }
    return document;
  }

  // 生成工作流模版数据
  private Map<String, Object> addModelToDB() throws Exception {
    Map<String, Object> model = null;
    Element docElement = document.getDocumentElement();
    NodeList modelNodes = docElement.getElementsByTagName("model");
    if (null != modelNodes && modelNodes.getLength() > 0) {
      for (int i = 0; i < modelNodes.getLength(); i++) {
        if (modelNodes.item(i).getNodeType() == Node.ELEMENT_NODE) {
          Node modelNode = modelNodes.item(i);
          model = new HashMap<String, Object>();
          NodeList childNodes = modelNode.getChildNodes();
          for (int j = 0; j < childNodes.getLength(); j++) {
            if (childNodes.item(j).getNodeType() == Node.ELEMENT_NODE) {
              if ("name".equals(childNodes.item(j).getNodeName())) {
                model.put("name", getValueByNode(childNodes.item(j)));
              } else if ("desc".equals(childNodes.item(j).getNodeName())) {
                model.put("describtion", getValueByNode(childNodes.item(j)));
              } else if ("firstStepRole".equals(childNodes.item(j)
                  .getNodeName())) {
                model.put("first_step_roles",
                    getValueByNode(childNodes.item(j)));
              } else if ("firstStepUser".equals(childNodes.item(j)
                  .getNodeName())) {
                model.put("first_step_users",
                    getValueByNode(childNodes.item(j)));
              } else if ("formId".equals(childNodes.item(j).getNodeName())) {
                model.put("form_relation", getValueByNode(childNodes.item(j)));
              } else if ("formTable".equals(childNodes.item(j).getNodeName())) {
                model.put("relation_table", getValueByNode(childNodes.item(j)));
              } else if ("firstStepId".equals(childNodes.item(j).getNodeName())) {
                String firstIdstr = getValueByNode(childNodes.item(j));
                if (!"".equals(firstIdstr))
                  model.put("first_step_id", Integer.parseInt(firstIdstr));
              } else if ("business".equals(childNodes.item(j).getNodeName())) {
                model.put("business_relation",
                    getValueByNode(childNodes.item(j)));
              } else if ("graphXML".equals(childNodes.item(j).getNodeName())) {
                model.put("graphXml", getValueByNode(childNodes.item(j)));
              } else if ("graphHTML".equals(childNodes.item(j).getNodeName())) {
                model.put("flowGraph", getValueByNode(childNodes.item(j)));
              } else if ("examine_time"
                  .equals(childNodes.item(j).getNodeName())) {
                model.put("examine_time", getValueByNode(childNodes.item(j)));
              } else if ("approval_time".equals(childNodes.item(j)
                  .getNodeName())) {
                model.put("approval_time", getValueByNode(childNodes.item(j)));
              } else if ("submitted_time".equals(childNodes.item(j)
                  .getNodeName())) {
                model.put("submitted_time", getValueByNode(childNodes.item(j)));
              }
            }
          }
        }
      }
    }
    if (null != model) {
      String name = this.checkIfNull(model.get("name"), "");
      String esModelName = transferFlowService.getFlowNewName(name);
      model.put("name", esModelName);
      model.put("creater", userId);
      SimpleDateFormat sdfmt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
      String createTime = sdfmt.format(new Date());
      model.put("createtime", createTime);
      model.put("identifier", "workflow" + System.currentTimeMillis());
      model.put("status", 0);
      model.put("version", 1);
      model.put("type_id", Long.parseLong(modelTypeId));
      if (!"3".equals(importType))
        model.put("relation_table", "");
      transferFlowService.saveOsWfModel(model);
      List<Map<String, Object>> osList = transferFlowService
          .getFlowListByIdentifier(model.get("identifier").toString());
      modelEn = osList.get(0);
    }
    return model;
  }

  // 生成工作流模版类型数据
  private Map<String, Object> addModelTypeToDB() throws Exception {
    Map<String, Object> modelType = null;
    if (!"".equals(modelTypeId) && modelTypeId != null) {
      modelType = transferFlowService.getTypeById(Long.parseLong(modelTypeId));
      if (modelType != null) {
        return modelType;
      }
    }
    Element docElement = document.getDocumentElement();
    NodeList Nodes = docElement.getElementsByTagName("modelType");
    if (null != Nodes && Nodes.getLength() > 0) {
      for (int i = 0; i < Nodes.getLength(); i++) {
        if (Nodes.item(i).getNodeType() == Node.ELEMENT_NODE) {
          Node modelTypeNode = Nodes.item(i);
          modelType = new HashMap<String, Object>();
          NodeList childNodes = modelTypeNode.getChildNodes();
          for (int j = 0; j < childNodes.getLength(); j++) {
            if (childNodes.item(j).getNodeType() == Node.ELEMENT_NODE) {
              if ("title".equals(childNodes.item(j).getNodeName())) {
                modelType.put("name", getValueByNode(childNodes.item(j)));
              }
            }
          }
        }
      }
    }
    if (null != modelType) {
      String addTitle = modelType.get("name").toString();
      List<Map<String, Object>> modelTypes = transferFlowService.getTree();
      for (Map<String, Object> type : modelTypes) {
        if (addTitle.equals(type.get("name"))) {
          modelTypeId = type.get("id").toString();
          break;
        }
      }
      if (modelTypeId == null) {
        Map<String, Object> flowType = transferFlowService.addType(modelType);
        if (flowType != null && flowType.containsKey("id")) {
          modelTypeId = flowType.get("id").toString();
        }
      }
    }
    return modelType;
  }

  // 生成表单数据
  private void addFormToDB() throws Exception {
    Element docElement = document.getDocumentElement();
    NodeList formNodes = docElement.getElementsByTagName("form");
    if (null != formNodes && formNodes.getLength() > 0) {
      for (int i = 0; i < formNodes.getLength(); i++) {
        if (formNodes.item(i).getNodeType() == Node.ELEMENT_NODE) {
          Node form = formNodes.item(i);
          formEn = new HashMap<String, Object>();
          NodeList childNodes = form.getChildNodes();
          for (int j = 0; j < childNodes.getLength(); j++) {
            if (childNodes.item(j).getNodeType() == Node.ELEMENT_NODE) {
              if ("id".equals(childNodes.item(j).getNodeName())) {
                String formidstr = getValueByNode(childNodes.item(j));
                if (!"".equals(formidstr))
                  formEn.put("id", Long.parseLong(formidstr));
              } else if ("formId".equals(childNodes.item(j).getNodeName())) {
                formEn.put("form_id", getValueByNode(childNodes.item(j)));
              } else if ("stageId".equals(childNodes.item(j).getNodeName())) {
                formEn.put("stageId", getValueByNode(childNodes.item(j)));
              } else if ("title".equals(childNodes.item(j).getNodeName())) {
                formEn.put("name", getValueByNode(childNodes.item(j)));
              } else if ("showType".equals(childNodes.item(j).getNodeName())) {
                formEn.put("show_type", getValueByNode(childNodes.item(j)));
              } else if ("extPage".equals(childNodes.item(j).getNodeName())) {
                formEn.put("form_js", getValueByNode(childNodes.item(j)));
              } else if ("htmlPage".equals(childNodes.item(j).getNodeName())) {
                formEn.put("form_js_html", getValueByNode(childNodes.item(j)));
              }
            }
          }
        }
      }
    }
    if (null != formEn) {
      Long oldId = Long.parseLong(formEn.get("id").toString());
      formEn.put("id", oldId);
      String oldTitle = formEn.get("name").toString();
      String copyTitle = transferFlowService.getFormNewTitle(oldTitle);
      formEn.put("creater", userId);
      SimpleDateFormat sdfmt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
      String createTime = sdfmt.format(new Date());
      formEn.put("createtime", createTime);
      formEn.put("name", copyTitle);
      String formJs = formEn.get("form_js").toString();
      formJs = formJs.replace(oldTitle, copyTitle);
      formEn.put("form_js", formJs);
      formEn.put("form_type_id",
          Long.parseLong(this.checkIfNull(formEn.get("stageId"), "0")));
      if (null == formEn.get("status"))
        formEn.put("status", 0);
      if (null == formEn.get("is_create_table"))
        formEn.put("is_create_table", 1);
      Map<String, Object> form = transferFlowService.getFormById(this
          .checkIfNull(formEn.get("form_id"), ""));
      if (form != null && form.get("id") != null) {
        form.put("stageId", form.get("form_type_id"));
        form.put("creater", userId);
        form.put("createtime", createTime);
        String modelId = transferFlowService.getFormFlowId(form.get("flow_id")
            .toString(), modelEn.get("id").toString(), "1");
        transferFlowService.updateFlowForm(form, modelId);
      } else {
        transferFlowService.saveForm(formEn);
        // transferFlowService.alterEspFlowForm(Long.parseLong(formEn.get(
        // "stageId").toString()));
      }
    }
  }

  // 生成函数数据，暂未调用此方法
  private List<Map<String, Object>> addFunctionsToDB() throws Exception {
    List<Map<String, Object>> functions = null;
    Element docElement = document.getDocumentElement();
    NodeList Nodes = docElement.getElementsByTagName("functions");
    if (null != Nodes && Nodes.getLength() > 0) {
      for (int i = 0; i < Nodes.getLength(); i++) {
        if (Nodes.item(i).getNodeType() == Node.ELEMENT_NODE) {
          Node functionsNode = Nodes.item(i);
          functions = new ArrayList<Map<String, Object>>();
          NodeList childNodes = functionsNode.getChildNodes();
          for (int j = 0; j < childNodes.getLength(); j++) {
            if (childNodes.item(j).getNodeType() == Node.ELEMENT_NODE) {
              Node function = childNodes.item(j);
              Map<String, Object> functionMap = new HashMap<String, Object>();
              NodeList functionChild = function.getChildNodes();
              for (int k = 0; k < functionChild.getLength(); k++) {
                if (functionChild.item(k).getNodeType() == Node.ELEMENT_NODE) {
                  if ("fullPath".equals(functionChild.item(k).getNodeName())) {
                    functionMap.put("restFullClassName",
                        getValueByNode(functionChild.item(k)));
                  } else if ("name".equals(functionChild.item(k).getNodeName())) {
                    functionMap.put("functionName",
                        getValueByNode(functionChild.item(k)));
                  } else if ("method".equals(functionChild.item(k)
                      .getNodeName())) {
                    functionMap.put("exeFunction",
                        getValueByNode(functionChild.item(k)));
                  } else if ("description".equals(functionChild.item(k)
                      .getNodeName())) {
                    functionMap.put("description",
                        getValueByNode(functionChild.item(k)));
                  }
                }
              }
              functions.add(functionMap);
            }
          }
        }
      }
    }
    if (null != functions) {
      List<Map<String, Object>> querys = transferFlowService
          .getFunctionList(null);
      for (Map<String, Object> add : functions) {
        boolean ishaving = false;
        for (Map<String, Object> one : querys) {
          if (add.get("functionName").equals(one.get("functionName"))) {
            ishaving = true;
            break;
          }
        }
        if (!ishaving) {
          transferFlowService.addFun(add);
        }
      }
    }
    return functions;
  }

  // 生成工作流步骤数据
  private List<Map<String, Object>> addStepsToDB() throws Exception {
    List<Map<String, Object>> steps = null;
    Element docElement = document.getDocumentElement();
    NodeList Nodes = docElement.getElementsByTagName("steps");
    if (null != Nodes && Nodes.getLength() > 0) {
      for (int i = 0; i < Nodes.getLength(); i++) {
        if (Nodes.item(i).getNodeType() == Node.ELEMENT_NODE) {
          Node stepsNode = Nodes.item(i);
          steps = new ArrayList<Map<String, Object>>();
          NodeList childNodes = stepsNode.getChildNodes();
          for (int j = 0; j < childNodes.getLength(); j++) {
            if (childNodes.item(j).getNodeType() == Node.ELEMENT_NODE) {
              Node stepNode = childNodes.item(j);
              Map<String, Object> step = new HashMap<String, Object>();
              NodeList stepChild = stepNode.getChildNodes();
              for (int k = 0; k < stepChild.getLength(); k++) {
                if (stepChild.item(k).getNodeType() == Node.ELEMENT_NODE) {
                  if ("name".equals(stepChild.item(k).getNodeName())) {
                    step.put("name", getValueByNode(stepChild.item(k)));
                  } else if ("childStepId".equals(stepChild.item(k)
                      .getNodeName())) {
                    String childStep = getValueByNode(stepChild.item(k));
                    if (!"".equals(childStep))
                      step.put("step_child_id", Integer.parseInt(childStep));
                  } else if ("parentStepId".equals(stepChild.item(k)
                      .getNodeName())) {
                    String parentStep = getValueByNode(stepChild.item(k));
                    if (!"".equals(parentStep))
                      step.put("parentStepId", Integer.parseInt(parentStep));
                  } else if ("editField"
                      .equals(stepChild.item(k).getNodeName())) {
                    step.put("selectField", getValueByNode(stepChild.item(k)));
                  } else if ("stepId".equals(stepChild.item(k).getNodeName())) {
                    String stepIp = getValueByNode(stepChild.item(k));
                    if (!"".equals(stepIp))
                      step.put("stepId", Integer.parseInt(stepIp));
                  } else if ("nextStepRole".equals(stepChild.item(k)
                      .getNodeName())) {
                    step.put("roleIds", getValueByNode(stepChild.item(k)));
                  } else if ("nextStepUser".equals(stepChild.item(k)
                      .getNodeName())) {
                    step.put("userIds", getValueByNode(stepChild.item(k)));
                  } else if ("isRelationPart".equals(stepChild.item(k)
                      .getNodeName())) {
                    String isRelationPart = getValueByNode(stepChild.item(k));
                    if (!"".equals(isRelationPart))
                      step.put("is_relationpart",
                          Integer.parseInt(isRelationPart));
                  } else if ("isCounterSign".equals(stepChild.item(k)
                      .getNodeName())) {
                    String isCountersign = getValueByNode(stepChild.item(k));
                    if (!"".equals(isCountersign))
                      step.put("is_countersign",
                          Integer.parseInt(isCountersign));
                  } else if ("isRelationCaller".equals(stepChild.item(k)
                      .getNodeName())) {
                    String isRelationByCaller = getValueByNode(stepChild
                        .item(k));
                    if (!"".equals(isRelationByCaller))
                      step.put("is_relationcaller",
                          Integer.parseInt(isRelationByCaller));
                  } else if ("editFieldPrint".equals(stepChild.item(k)
                      .getNodeName())) {
                    step.put("selectFieldPrint",
                        getValueByNode(stepChild.item(k)));
                  }
                }
              }
              if (null != modelEn) {
                step.put("modelId", modelEn.get("id"));
                step.put("ES_STEP_NAME", step.get("name"));
              }
              steps.add(step);
            }
          }
        }
      }
    }

    if (null != steps) {
      for (Map<String, Object> osWfStep : steps) {
        transferFlowService.saveStepInit(osWfStep);
      }
    }
    return steps;
  }

  // 生成工作流动作数据
  private List<Map<String, Object>> addActionsToDB() throws Exception {
    List<Map<String, Object>> actions = null;
    Element docElement = document.getDocumentElement();
    NodeList Nodes = docElement.getElementsByTagName("actions");
    if (null != Nodes && Nodes.getLength() > 0) {
      for (int i = 0; i < Nodes.getLength(); i++) {
        if (Nodes.item(i).getNodeType() == Node.ELEMENT_NODE) {
          Node actionsNode = Nodes.item(i);
          actions = new ArrayList<Map<String, Object>>();
          NodeList childNodes = actionsNode.getChildNodes();
          for (int j = 0; j < childNodes.getLength(); j++) {
            if (childNodes.item(j).getNodeType() == Node.ELEMENT_NODE) {
              Node actionNode = childNodes.item(j);
              Map<String, Object> action = new HashMap<String, Object>();
              NodeList actionChild = actionNode.getChildNodes();
              for (int k = 0; k < actionChild.getLength(); k++) {
                if (actionChild.item(k).getNodeType() == Node.ELEMENT_NODE) {
                  if ("stepId".equals(actionChild.item(k).getNodeName())) {
                    String stepid = getValueByNode(actionChild.item(k));
                    if (!"".equals(stepid))
                      action.put("step_id", Long.parseLong(stepid));
                  } else if ("name".equals(actionChild.item(k).getNodeName())) {
                    action.put("name", getValueByNode(actionChild.item(k)));
                  } else if ("condition".equals(actionChild.item(k)
                      .getNodeName())) {
                    action
                        .put("condition", getValueByNode(actionChild.item(k)));

                  } else if ("freFun".equals(actionChild.item(k).getNodeName())) {
                    action.put("frefunction",
                        getValueByNode(actionChild.item(k)));
                  } else if ("postFun"
                      .equals(actionChild.item(k).getNodeName())) {
                    action.put("postfunction",
                        getValueByNode(actionChild.item(k)));
                  } else if ("actionId".equals(actionChild.item(k)
                      .getNodeName())) {
                    String actionid = getValueByNode(actionChild.item(k));
                    if (!"".equals(actionid))
                      action.put("action_id", Long.parseLong(actionid));
                  } else if ("isEmail"
                      .equals(actionChild.item(k).getNodeName())) {
                    String isEmail = getValueByNode(actionChild.item(k));
                    if (!"".equals(isEmail))
                      action.put("is_email", Integer.parseInt(isEmail));
                  } else if ("isMessage".equals(actionChild.item(k)
                      .getNodeName())) {
                    String isMessage = getValueByNode(actionChild.item(k));
                    if (!"".equals(isMessage))
                      action.put("is_message", Integer.parseInt(isMessage));
                  } else if ("message"
                      .equals(actionChild.item(k).getNodeName())) {
                    action.put("action_message",
                        getValueByNode(actionChild.item(k)));
                  } else if ("noticeUsers".equals(actionChild.item(k)
                      .getNodeName())) {
                    action.put("notice_users",
                        getValueByNode(actionChild.item(k)));
                  } else if ("noticeRoles".equals(actionChild.item(k)
                      .getNodeName())) {
                    action.put("notice_roles",
                        getValueByNode(actionChild.item(k)));
                  } else if ("isNoticeCaller".equals(actionChild.item(k)
                      .getNodeName())) {
                    String isNoticeCaller = getValueByNode(actionChild.item(k));
                    if (!"".equals(isNoticeCaller))
                      action.put("is_notice_caller",
                          Integer.parseInt(isNoticeCaller));
                  } else if ("isValidateForm".equals(actionChild.item(k)
                      .getNodeName())) {
                    String isValidateForm = getValueByNode(actionChild.item(k));
                    if (!"".equals(isValidateForm))
                      action.put("is_validate_form",
                          Integer.parseInt(isValidateForm));
                  }
                }
              }
              if (null != modelEn)
                action.put("flow_id", modelEn.get("id"));
              actions.add(action);
            }
          }
        }
      }
    }

    if (null != actions) {
      for (Map<String, Object> osWfAction : actions) {
        transferFlowService.saveAction(osWfAction);
      }
    }
    return actions;
  }

  private String getValueByNode(Node node) {
    if (null == node.getFirstChild())
      return "";
    return node.getFirstChild().getNodeValue();
  }

  private String checkIfNull(Object obj, String value) {
    if (obj != null) {
      return obj.toString();
    }
    return value;
  }
}