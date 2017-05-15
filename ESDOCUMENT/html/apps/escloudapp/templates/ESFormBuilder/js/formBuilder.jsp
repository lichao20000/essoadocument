<%@ include file="/common/taglibs.jsp"%>
<html>
 <head>
  <meta http-equiv="expires" content="never"/>
  <meta http-equiv="content-language" content="fr"/>
  <meta lang="fr" />
  <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
  <script type="text/javascript">
  	function getFormJs(m){
		Ext.Ajax.request({
	        url:'formBuilderManager.html?method=getFormJs&formId='+m.id,
	        callback:function(options,success,response){
				var json=Ext.util.JSON.decode(response.responseText);
		   		var config= Ext.decode(json.formJs);
				m.setConfig({items:[config]});
			}
	    });
	}
  </script>
 </head>
<body>
<style>
.notice {
	color: #559;
	font-style: italic;
}
.x-form-multicheckbox {
	background:#FFFFFF;
	border:1px solid #B5B8C8;
	padding:3px;
}
</style>
<%
	String formId = (String)request.getAttribute("formId");
	String formTypeID = (String)request.getAttribute("formTypeID");
	String hasData = (String)request.getAttribute("hasData");//xiaoxiong 20120516 ??????????????????
%>
<div id="OS_Form_Builder_Div" />
<script type="text/javascript">
try{
var savedCleanConfig = '' ;
var hasData = '<%=hasData%>'//xiaoxiong 20120516 ??????????????????
var main = new FormBuilderMain('<%=formId%>','<%=formTypeID%>');
<%
	if(null!=formId&&!"null".equals(formId)){
%>
		getFormJs(main);
<%
	}
%>
Ext.onReady(main.init, main);
}catch(e){}
</script>
</body>
</html>
