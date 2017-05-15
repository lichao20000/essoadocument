package cn.flying.rest.service.workflow;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import cn.flying.rest.entity.UserEntry;
import cn.flying.rest.platform.IServiceProvider;
import cn.flying.rest.service.IFilingService;
import cn.flying.rest.service.IParticipatoryService;
import cn.flying.rest.service.IRoleService;
import cn.flying.rest.service.ITransferFlowService;
import cn.flying.rest.service.entiry.Participatory;
import cn.flying.rest.service.impl.TransferFlowServiceImpl;

import com.opensymphony.module.propertyset.PropertySet;
import com.opensymphony.workflow.Condition;
import com.opensymphony.workflow.StoreException;

/**
 * 分支条件校验器
 */
public class WfSplitValidator implements Condition {
  /**
   * 确定条件 信息通过或失败
   * 
   * @param transientVars
   *          Map：是客户端代码调用Workflow.doAction()时传进来的。 这个参数可以基于用户的不同的输入使函数有不同的行为。
   *          这个参数也包含了一些特别变量，这些变量对于访问workflow的信息是很有帮助的。
   *          它也包含了所有的在Registers中配置的变量和下面两种特别的变量： entry
   *          (com.opensymphony.workflow.spi.WorkflowEntry) and context
   *          (com.opensymphony.workflow.WorkflowContext)。
   * 
   * @param args
   *          Map是一个包含在所有的<function/>标签中的<arg/>标签的Map。 这些参数都是String类型的。这意味着<arg
   *          name="foo">this is ${someVar}</arg> 标签中定义的参数将在arg
   *          Map中通过"foo"，可以映射到"this is [contents of someVar]"字串。
   * 
   * @param propertySet
   *          包含所有的在workflow实例中持久化的变量。
   * @return true表示通过 false表示失败
   */
  @SuppressWarnings("rawtypes")
  public boolean passesCondition(Map transientVars, Map args, PropertySet ps)
      throws StoreException {
    try {
      /** 平台服务调度器-调用服务的重要接口 **/
      IServiceProvider iServiceProvider = (IServiceProvider) transientVars
          .get(TransferFlowServiceImpl.PLATFORM_SERVICEPROVIDER);
      ITransferFlowService transferFlowService = iServiceProvider
          .findService(ITransferFlowService.class);
      IFilingService filingService = iServiceProvider
          .findService(IFilingService.class);
      IParticipatoryService participatoryService = iServiceProvider
          .findService(IParticipatoryService.class);
      IRoleService roleService = iServiceProvider
          .findService(IRoleService.class);
      String splitCondtion = (String) args.get("splitCondtion");
      if (null != splitCondtion && !"".equals(splitCondtion)) {
        String formId = (String) transientVars
            .get(TransferFlowServiceImpl.PARM_FORM_ID);
        boolean rightBool = false;// 表单条件
        boolean leftBool = false;// 部门、角色条件
        String wfId = (String) transientVars
            .get(TransferFlowServiceImpl.PARM_WF_ID);
        List<Map<String, Object>> docList = transferFlowService
            .getFormAppendixList(Long.parseLong(wfId));
        String docIds = "";
        for (Map<String, Object> map : docList) {
          docIds += "," + map.get("dataId");
        }
        docIds = docIds.length() > 0 ? docIds.substring(1) : "";
        List<Map<String, Object>> values = filingService.findDocumentById(1, 1,
            formId.substring(5), docIds);
        String[] strs = splitCondtion.split("&&&");
        if (strs.length > 1) {
          if (values != null && !values.isEmpty()) {
            String rightCondition = strs[1];
            List<HashMap<String, String>> listMap = transferFlowService
                .parseCondition(rightCondition);
            StringBuffer cond = new StringBuffer("");
            for (HashMap<String, String> m : listMap) {
              String arg0 = m.get("arg0"); // 左括号
              String arg1 = m.get("arg1");// field
              String arg2 = m.get("arg2");// compare
              String arg3 = m.get("arg3");// value
              String arg4 = m.get("arg4");// 右括号
              String arg5 = m.get("arg5");// and/or
              if (null != arg0 && arg0.indexOf("(") != -1)
                cond.append(arg0);

              Map<String, Object> thisValue = values.get(0);
              /** 如果没有值则设置为空，保证没值的情况下可以正常进行条件判断 **/
              if (null == thisValue.get(arg1)) {
                thisValue.put(arg1, "");
              }

              if (null == thisValue.get(arg1)) {
                rightBool = false;
              } else {
                /**
                 * 分支条件校验修改 如果捕获到异常了，作为字符串的方式去比较，如果正常则按数字去比较 modify
                 * 捕获到异常后,不满足条件时将rightBool值重置
                 * */
                String str_arg1 = thisValue.get(arg1).toString();
                if (arg2.equals("=")) {
                  try {
                    if (Double.parseDouble(str_arg1) == Double
                        .parseDouble(arg3)) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  } catch (NumberFormatException n) {
                    if (str_arg1.compareTo(arg3) == 0) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  }
                } else if (arg2.equals("!=")) {
                  try {

                    if (Double.parseDouble(str_arg1) != Double
                        .parseDouble(arg3)) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  } catch (NumberFormatException n) {
                    if (str_arg1.compareTo(arg3) != 0) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  }
                } else if (arg2.equals(">")) {
                  try {
                    if (Double.parseDouble(str_arg1) > Double.parseDouble(arg3)) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  } catch (NumberFormatException n) {
                    if (str_arg1.compareTo(arg3) > 0) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  }

                } else if (arg2.equals("<")) {
                  try {
                    if (Double.parseDouble(str_arg1) < Double.parseDouble(arg3)) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  } catch (NumberFormatException n) {
                    if (str_arg1.compareTo(arg3) < 0) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  }

                } else if (arg2.equals("like")) {
                  rightBool = str_arg1.contains(arg3);
                } else if (arg2.equals("notLike")) {
                  rightBool = !str_arg1.contains(arg3);
                } else if (arg2.equals(">=")) {
                  try {
                    if (Double.parseDouble(str_arg1) >= Double
                        .parseDouble(arg3)) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  } catch (NumberFormatException n) {
                    if (str_arg1.compareTo(arg3) >= 0) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  }

                } else if (arg2.equals("<=")) {
                  try {
                    if (Double.parseDouble(str_arg1) <= Double
                        .parseDouble(arg3)) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  } catch (NumberFormatException n) {
                    if (str_arg1.compareTo(arg3) <= 0) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  }

                }
              }

              cond.append(rightBool);
              if (null != arg4 && arg4.indexOf(")") != -1)
                cond.append(arg4);
              if (arg5 != null)
                cond.append(arg5);

            }

            rightBool = pbk(cond.toString());
          } else {
            rightBool = false;
          }
        }
        if (strs.length > 0 && strs[0].length() > 1) {
          // 不进行条件校验bug
          UserEntry user = (UserEntry) transientVars
              .get(TransferFlowServiceImpl.PARM_CURRENT_USER);
          List<Participatory> listPart = participatoryService
              .getParticipatoryByUserId(user.getUserid());
          long partId = listPart.get(0).getId();
          List<Map<String, Object>> roles = roleService
              .getRoleListByUserId(user.getId());
          String leftCondition = splitCondtion.split("&&&")[0];
          List<HashMap<String, String>> listMap = transferFlowService
              .parseCondition(leftCondition);
          StringBuffer buffer = new StringBuffer("");
          for (HashMap<String, String> m : listMap) {
            String arg0 = m.get("arg0"); // 左括号
            String arg1 = m.get("arg1");// field
            String arg2 = m.get("arg2");// compare
            String arg3 = m.get("arg3");// value
            String arg4 = m.get("arg4");// 右括号
            String arg5 = m.get("arg5");// and/or
            if (null != arg0 && arg0.indexOf("(") != -1)
              buffer.append(arg0);
            if (arg1.equals("") || arg2.equals("") || arg3.equals("")) {
              break;
            }
            if (arg1.equals("role")) {
              boolean bo = false;
              for (Map<String, Object> map : roles) {
                if (arg3.equals(map.get("id").toString())) {
                  bo = true;
                  break;
                }
              }
              if (bo) {
                if ("!=".equals(arg2)) {
                  buffer.append("false");
                } else {
                  buffer.append("true");
                }
              } else {
                if ("!=".equals(arg2)) {
                  buffer.append("true");
                } else {
                  buffer.append("false");
                }
              }
            } else if (arg1.equals("part")) {
              if (partId == Long.parseLong(arg3)) {
                if ("!=".equals(arg2)) {
                  buffer.append("false");
                } else {
                  buffer.append("true");
                }
              } else {
                if ("!=".equals(arg2)) {
                  buffer.append("true");
                } else {
                  buffer.append("false");
                }
              }
            }

            if (null != arg4 && arg4.indexOf(")") != -1)
              buffer.append(arg4);
            if (arg5 != null) {
              buffer.append(arg5);
            }
          }
          if (buffer.toString().equals(""))
            return false;
          leftBool = pbk(buffer.toString());
          // }
        }
        if (strs.length == 2 && strs[0].length() > 0) {
          return leftBool && rightBool;
        } else if (strs.length == 2 && strs[0].length() == 0) {
          return rightBool;
        } else {
          return leftBool;
        }
      } else {
        return false;
      }
    } catch (Exception e) {
      e.printStackTrace();
      return false;
    }

  }

  /**
   * 比较两个字符串
   * 
   * @param str1
   *          字符串
   * @param str2
   *          字符串
   * @return str1 大于 str2 时 返回true 忽略大小写
   */
  @SuppressWarnings("unused")
  private boolean compareTwoString(String str1, String str2) {
    boolean check = false;
    int i = str1.compareToIgnoreCase(str2);
    if (i == 1) {
      check = true;
    }
    return check;
  }

  /**
   * 将带有括号的boolean转换成一个Boolean值 如trueor(trueandfalse)
   * 
   * @param str
   *          字符串
   * @return boolean值
   */
  private boolean pasBool(String str) {
    if (str == null)
      return false;
    String strs = str.replaceAll(" ", "");
    if (strs.trim().equals(""))
      return false;
    if (strs.trim().equals("true"))
      return true;
    if (strs.trim().equals("false"))
      return false;
    if (!strs.trim().endsWith("e"))
      return false;
    String tempField = strs;
    String tempsign = strs;
    String a[] = tempField.split("e");
    for (int i = 0; i < a.length; i++) {
      if (a[i].indexOf("f") >= 0) {
        a[i] = a[i].substring(a[i].indexOf("f")) + "e";
      } else if (a[i].indexOf("t") >= 0) {
        a[i] = a[i].substring(a[i].indexOf("t")) + "e";
      }
    }

    tempsign = tempsign.replaceAll("true", " ").replaceAll("false", " ");
    String[] sigs = tempsign.substring(1, tempsign.length() - 1).split(" ");
    boolean check = false;
    for (int i = 0; i < a.length - 1; i++) {
      if (i == 0) {
        check = parseTwo(parseBool(a[i]), parseBool(a[i + 1]), sigs[i]);
      } else {
        check = parseTwo(check, parseBool(a[i + 1]), sigs[i]);
      }

    }
    return check;
  }

  /**
   * 将带有括号的boolean转换成一个Boolean值 如trueor(trueandfalse)
   * 
   * @param str
   *          字符串
   * @return boolean值
   */
  private boolean pbk(String str) {
    int charatR = -1;
    int charatY = -1;
    while (str.indexOf("(") > -1) {
      charatR = str.lastIndexOf("(");
      charatY = charatR + str.substring(charatR).indexOf(")");
      String tempBool = str.substring(charatR + 1, charatY);
      str = str.replace("(" + tempBool + ")", this.pasBool(tempBool) + "");
    }
    return this.pasBool(str);
  }

  /**
   * 将带有括号的boolean转换成一个Boolean值 如trueor(trueandfalse)
   * 
   * @param str
   *          字符串
   * @return boolean值
   */
  private boolean parseBool(String s) {
    if (s == null)
      return false;
    if (s.trim().equals(""))
      return false;
    if (s.trim().equals("true"))
      return true;
    return false;
  }

  /**
   * 将带有括号的boolean转换成两个个Boolean值 如trueor(trueandfalse)
   * 
   * @param b1
   *          boolean值
   * @param b2
   *          boolean值
   * @param str
   *          字符串
   * @return boolean值
   */
  private boolean parseTwo(boolean b1, boolean b2, String sign) {
    if (sign == null)
      return false;
    if (sign.trim().equals(""))
      return false;
    if (sign.trim().equals("|") || sign.equals("||") || sign.equals("or"))
      return b1 || b2;
    if (sign.trim().equals("&") || sign.equals("&&") || sign.equals("and"))
      return b1 && b2;
    return false;
  }
}
