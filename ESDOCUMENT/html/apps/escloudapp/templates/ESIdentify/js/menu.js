var setting = {
			view: {
				dblClickExpand: false,
				showLine: false
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			async:{
				autoParam:['id','column','path','number'],
				enable:true,
				dataFilter: ajaxDataFilter,
				url:getUrl
			},
			
			callback: {
				onClick: onClick
				
			}
		};
		var startTime='';
		function onClick(e,treeId, treeNode) {
			var zTree = $.fn.zTree.getZTreeObj("treeDemo");
			zTree.expandNode(treeNode);
			if(treeNode.sId!=0 || treeNode.condition){
			/*每隔一秒才能在点击树节点触发请求 start*/
				var dateObj = new Date();
				if(!startTime){
					startTime=dateObj.getTime();
				}else{
					var temp=startTime;
					startTime='';
					if(parseInt(dateObj.getTime()-temp) < 1000){
						return false;
					}
					
				}
			/*每隔一秒才能在点击树节点触发请求 end*/
				strucid=treeNode.sId;
//				$('#treeDemo').attr('treenodeid',treeNode.id);
				$('#treeDemo').attr('treenodeid',treeNode.treeNodeId);
				var url=$.appClient.generateUrl({ESIdentify:'project'},'x');
				if(treeNode.path){
					var path=treeNode.path;
					var reg=/\//g;
					nodePath=path.replace(reg, '-');//全局Path
				}
				nodeName=treeNode.name;
				var file=/file/gi,
					innerfile=/innerfile/gi,
					con='',
					fileNode={id:''};
					conditions=[];
					gc={};//分组条件
				if(treeNode.condition)
				{
					getParentNodes(conditions,treeNode);
					gc.groupCondition=conditions;
					//con=conditions.join('@');
					//$("#condition:hidden").val(con);
						fileNode=getFileNodes(treeNode);
						$('#treeDemo').attr('selectid',fileNode.id);//记录中的节点的id
				}else{
					$('#treeDemo').attr('selectid',treeNode.id);//记录中的节点的id
					//根据用户ID获取分组设置字段
					var number,id,column;
					if(treeNode.number){
						number=treeNode.number;
						id=treeNode.id;
						column=treeNode.column;
					}
					var uri=$.appClient.generateUrl({ESIdentify:'getGroupColumn'},'x');
					$.post(uri,{path:nodePath,number:number,id:id,column:column},function(result){
						if(result && result.nodes!=""&& result.cncolumn!=""){
							//如点击更多节点
							if(treeNode.id.match(/^\<more\>/)){
								var pNode=treeNode.getParentNode();
								zTree.removeNode(treeNode);
								zTree.addNodes(pNode, result.nodes);
							}else{
								var position=treeNode.name.search(/\[/);
								if(position!=-1)
								{
									treeNode.name=treeNode.name.slice(0,position);
								}
								if(treeNode) {
									zTree.removeChildNodes(treeNode);
								}
								zTree.addNodes(treeNode, result.nodes);
								treeNode.name+='['+result.cncolumn+']';
								zTree.updateNode(treeNode);
							}
							
						}
					},'json')
					if(treeNode.id.match(/^\<more\>/)){//判断用户使用点击分组节点“更多”按钮
						return;
					}
					
				}
				//只有文书档案下才显示不归档库和不归档按钮
					if(fileNode.id){
						archiveName=fileNode.name;
						archiveType=fileNode.archivetype;
					}else{
						archiveName=treeNode.name;
						archiveType=treeNode.archivetype;
					}
					//doc=archiveName.match(/文书档案/);
					//liqiubo 20140722 加入验证，验证是否设置了列表显示字段规则,以防止在IE8下出现问题
//				var isHaveColumnModelUrl = $.appClient.generateUrl({ESIdentify:'isHaveColumnModel'},'x');
//				$.post(isHaveColumnModelUrl,{path:nodePath},function(result){
//					if(result == 'false'){
//						$.dialog.notice({width: 350,content: '该结构下没有设置列表显示规则，请联系管理员',icon: 'error',time: 3});
//						return false;
//					}
					//如果节点是设置的分组节点
					var isgroupNode=0;
					if(treeNode.condition)
					{   isgroupNode=1;
					}
					if((treeNode.id.match(innerfile)==null) && (treeNode.id.match(file) || (fileNode.id.match(file) && fileNode.id.match(innerfile)==null))){
						var Node=treeNode.childPath?treeNode.childPath:fileNode.childPath;
						var parentNode=treeNode.childPath?treeNode.getParentNode():fileNode.getParentNode();
						archiveName=parentNode.name;
						var name = fileNode.name?fileNode.name:treeNode.name;
						title=archiveName+' ● '+getTitle(name);
						var reg=/\//g;
						nextPath=Node.replace(reg, '-');
						parentPath=nodePath;
						$("#esone").load(url,{path:nodePath,file:'file',nextpath:nextPath,isgroupNode:isgroupNode});
						
					}else if(treeNode.id.match(innerfile)||fileNode.id.match(innerfile)){
						$("#esone").load(url,{path:nodePath,file:'innerfile',isgroupNode:isgroupNode});
						var prePath=treeNode.parentPath?treeNode.parentPath:fileNode.parentPath;
						var parentNode=treeNode.parentPath?treeNode.getParentNode():fileNode.getParentNode();
							archiveName=parentNode.name;
							var name = fileNode.name?fileNode.name:treeNode.name;
						
							title=archiveName+' ● '+getTitle(name);
						
						var reg=/\//g;
						parentPath=prePath.replace(reg, '-');
					}else{
						title=getTitle(archiveName);
						$("#esone").load(url,{path:nodePath,file:'',isgroupNode:isgroupNode});
					}

//				});
			}
			
			
		}
		$(document).ready(function(){
			$.getJSON($.appClient.generateUrl({
				ESIdentify : "getTree",status:status
			}, 'x'), function(zNodes) {
				$.fn.zTree.init($("#treeDemo"), setting, zNodes);

			});

		});
		function getUrl(treeId, treeNode){
			return $.appClient.generateUrl({ESIdentify : "getGroupColumn"}, 'x');
		}
		//递归获取分组节点上的condition字段值
		function getParentNodes(conditions,treeNode){
			
			conditions.push(treeNode.condition);
			var parentNodes=treeNode.getParentNode();
			if(parentNodes && parentNodes.condition){
				getParentNodes(conditions,parentNodes);
			}
			
		}
		//递归获取分组字段的名称
		function getColumnField(nameSpace,treeNode){
			nameSpace.push(treeNode.cncolumn);
			var childNodes=treeNode.children;
			if(childNodes){
				getColumnField(nameSpace,childNodes[0]);
			}
		}
		//如果点击分组设置节点，需要递归判断其父节点是不是案卷级或文件级
		function getFileNodes(treeNode){
			var parentNodes=treeNode.getParentNode();
			if(!parentNodes.condition){
				return parentNodes; 
			}else{
			   return getFileNodes(parentNodes);
			}
			
		
		}
		//获取表格的TITLE
		function getTitle(title){
			var position=title.search(/\[/);
			if(position!=-1)
			{
				title=title.slice(0,position);
			}
			//
			if(conditions.length > 0){
				title+=' ● ';
				var len=conditions.reverse().length;
				for(var i= 0; i < len;i++){
					//title+=conditions[i].split(',')[2]+' ● ';
					var name=conditions[i].split(',')[2] ? conditions[i].split(',')[2]:'空值';
						title+=name+' ● ';
				}
				title=title.slice(0,-3);
			}
			
			return title;
		}
		function ajaxDataFilter(treeId, parentNode, responseData) {
		   return responseData.nodes;
		}
		
		