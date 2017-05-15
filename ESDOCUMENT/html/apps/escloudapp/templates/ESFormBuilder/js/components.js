/*
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

ExtComponents = {

	getComponents : function() {

		var data = [];

		// Form elements
		// jiang add clearCls:'allowFloat' 20091123
		data.push(
			['Forms','字段分组',
				//'A Fieldset, containing other form elements',
				'字段分组',
				{xtype:'fieldset' ,title:'字段分组',autoHeight:true,animCollapse :true,collapsible:true,collapsed:false,clearCls:'allowFloat'}],
			['Forms','下拉字段 ',
				//'A combo box',
				'下拉字段 ',//xiaoxiong 20120417 添加,editable: false属性值 使其不可以输入值
				{xtype:'combo' ,fieldLabel:'字段'  ,name:'FORMBUILDER_FIELD'  ,maxLength:50,hiddenName:'FORMBUILDER_FIELD',value:'' ,
					width:161,comboRelation:'false',allowBlank:true,blankText:'这个字段不能为空',clearCls:'allowFloat',editable: false  }],
			['Forms','文本字段 ',
				//'A Text Field',
				'文本字段 ',
				{xtype:'textfield',fieldLabel:'字段'  ,name:'FORMBUILDER_FIELD'  ,maxLength:100,value:'',width:161, allowBlank:true,blankText:'这个字段不能为空',clearCls:'allowFloat'}],
			['Forms','文本域 ',
				//'A Text Area',
				'文本域 ',
				{xtype:'textarea',fieldLabel:'字段' ,name:'FORMBUILDER_FIELD'  ,maxLength:512,value:'',width:250, height:100, allowBlank:true,blankText:'这个字段不能为空',clearCls:'allowFloat'}],
				/**chenjian 20130402 modify在定制表单时，由于数字、浮点字段最后都是通过double表示,而double的有效数字只有15位，固将maxLength修改为了15*/
			['Forms','数字字段 ',
				'数字字段 ',
				//'A Text Field where you can only enter numbers',
				//xiaoxiong 20110918 给组建添加正则验证 并设置autoParseFloat:false ，使其在丢失鼠标时，不对数据进行科学技术法 xiaoxiong 20111229 添加allowDecimals:false 避免出现小数
				/**chenjian 20130517 modify 将正则和提示消息修改*/
				{xtype:'numberfield',fieldLabel:'字段' ,name:'FORMBUILDER_FIELD' ,maxLength:15,value:'',width:161,tempid:'123', allowBlank:true,fieldClass:'numberfield_align',allowDecimals:false,autoParseFloat:false,regex:'/^[-]*[0-9]{0,15}$/',regexText:'此字段的最大长度为15，您输入的值违反了此规则，请重新填写！',blankText:'这个字段不能为空',clearCls:'allowFloat'}],
			//xiaoxiong 20120417 添加浮点字段类型 xiaoxiong 20130524 添加decimalPrecision:3属性值 使其浮点型字段的有效小数位数为3位
			['Forms','浮点字段 ',
				'浮点字段 ',
				{xtype:'numberfield',fieldLabel:'字段' ,name:'FORMBUILDER_FIELD' ,maxLength:15,value:'',width:161,tempid:'123', allowBlank:true,fieldClass:'numberfield_align',autoFillZero:false,autoParseFloat:false,regex:'/^([-]*[0-9]{1,16})+([.]{1}[0-9]{0,3}){0,1}$/',regexText:'此字段的最大长度为15，小数精度为3，您输入的值违反了此规则，请重新填写！',blankText:'这个字段不能为空',decimalPrecision:3,clearCls:'allowFloat'}],
			['Forms','时间字段 ',
				//'A Text Field where you can only enter a time',
				// jiangyuntao 20110809 edit 时间和日期字段修改为只读。只允许选择。 //xiaoxiong 20110917 去掉只读属性，BUG：3596 是个错误的BUG  添加invalidText 
				/** xiaoxiong 20121109 添加时间字段显示格式 format: 'H:i:s' **/
				'时间字段 ',
				{xtype:'timefield',fieldLabel:'时间' ,name:'FORMBUILDER_FIELD' ,maxLength:20,format: 'H:i:s' ,value:'',width:161 , allowBlank:true,invalidText : '您输入的是无效的时间，合法的格式如：12:00:00',blankText:'这个字段不能为空',clearCls:'allowFloat'}],
			['Forms','日期字段 ',
				//'A Text Field where you can only enter a date',
				'日期字段 ',
				//xiaoxiong 20120917 添加日期类型正则表达式 及不符合提示信息
				{xtype:'datefield',fieldLabel:'日期' ,name:'FORMBUILDER_FIELD' ,maxLength:20 ,format:'Y-m-d' ,regex:'/^(([1-9][0-9]{2}[1-9]|[1-9][0-9][1-9][0-9]{1}|[1-9][1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([1-9][0-9])(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29)$/',regexText:'不是有效的日期，请填写如：2000-07-04的有效日期。',value:'' , allowBlank:true,blankText:'这个字段不能为空' ,width:161,clearCls:'allowFloat'}],
			['Forms','多选 ',
				//'A checkbox',
				'多选 ',
				{xtype:'checkbox',fieldLabel:'多选' ,name:'FORMBUILDER_FIELD' ,maxLength:10 ,hideLabel:true,boxLabel:'选择',inputValue:'cbvalue',value:'',clearCls:'allowFloat'}],
			['Forms','单选 ',
				//'A radio form element',
				'单选 ',
				{xtype:'radio',fieldLabel:'单选' ,name:'FORMBUILDER_FIELD' ,maxLength:10 ,hideLabel:true ,boxLabel:'选择' ,inputValue:'radiovalue',value:'',clearCls:'allowFloat'}]
			);

		// Simple Panels
		data.push(
//			['Panels','面板 ',
//				'A simple panel with default layout',
//				{xtype:'panel',title:'Panel'}],
			['Forms,Panels','表单',
				//'A panel containing form elements',
				'表单',
				//{xtype:'form',title:'表单',collapsible : true,height:500 ,defaults:{"itemCls":"floatLeft"},	style:'padding:8px 45px;background:#848484',autoScroll: true}]
				//{xtype:'form',title:'表单',collapsible : true,autoHeight:true ,defaults:{"itemCls":"floatLeft"},	style:'padding:8px 45px;background:#848484',autoScroll: true}]//xiaoxiong 20100716 edit 修改流程表单有内外两层滚动条问题
				{xtype:'form',title:'表单',autoHeight:true ,border:false,header:false,defaults:{"itemCls":"floatLeft"},	style:'padding:8px 10px;background:#FFFFFF',autoScroll: true}]//xiaoxiong 20100930 edit 修改流程表单的样式#848484
				// jiang20091123 add form style
				
			);

		// Tab Panel
//		data.push(['Panels', 'Tab Panel', 'A panel with many tabs', function(add,parent) {
//			var w = new Ext.Window({
//        width:586,
//        height:339,
//        title:"New Tab Panel",
//        items:[{
//            xtype:"form",
//            frame:true,
//            items:[{
//                layout:"table",
//                layoutConfig:{
//                  columns:2
//                },
//                defaults:{
//                  style:"margin:1px;",
//                  border:true
//                },
//                xtype:"fieldset",
//                title:"Tabs",
//                autoHeight:true,
//                items:[{
//                    title:"Title"
//                  },{
//                    title:"activeTab"
//                  },{
//                    xtype:"textfield",
//                    name:"title_1",
//                    width:200
//                  },{
//                    xtype:"radio",
//                    fieldLabel:"Label",
//                    boxLabel:"This tab is the default active one",
//                    name:"active",
//										inputValue:0
//                  },{
//                    xtype:"textfield",
//                    name:"title_2",
//                    width:200
//                  },{
//                    xtype:"radio",
//                    fieldLabel:"Label",
//                    boxLabel:"This tab is the default active one",
//                    name:"active",
//										inputValue:1
//                  },{
//                    xtype:"textfield",
//                    name:"title_3",
//                    width:200
//                  },{
//                    xtype:"radio",
//                    fieldLabel:"Label",
//                    boxLabel:"This tab is the default active one",
//                    name:"active",
//										inputValue:2
//                  },{
//                    xtype:"textfield",
//                    name:"title_4",
//                    width:200
//                  },{
//                    xtype:"radio",
//                    fieldLabel:"Label",
//                    boxLabel:"This tab is the default active one",
//                    name:"active",
//										inputValue:3
//                  },{
//                    xtype:"textfield",
//                    name:"title_5",
//                    width:200
//                  },{
//                    xtype:"radio",
//                    fieldLabel:"Label",
//                    boxLabel:"This tab is the default active one",
//                    name:"active",
//										inputValue:4
//                  },{
//                    xtype:"textfield",
//                    name:"title_6",
//                    width:200
//                  },{
//                    xtype:"radio",
//                    fieldLabel:"Label",
//                    boxLabel:"This tab is the default active one",
//                    name:"active",
//										inputValue:5
//                  }]
//              }]
//          }],
//					buttons:[{
//						text:'Ok',
//						scope:this,
//						handler:function() {
//							var values = w.items.first().form.getValues();
//							w.close();
//							var config = {xtype:'tabpanel',items:[]};
//							var activeTab = 0;
//							Ext.each([1,2,3,4,5,6], function(i) {
//								if (values['title_'+i]) {
//									config.items.push({xtype:'panel',title:values['title_'+i]});
//									if (values.active == i) { activeTab = i; }
//								}
//							});
//							config.activeTab = activeTab;
//							add.call(this, config);
//						}
//					},{
//						text:'Cancel',
//						handler:function() {w.close();}
//					}]
//			});
//			w.show();
//
//		}]);

		// Simples Layouts
		// jiang note 20091221
		data.push(
//			['Layouts','Fit Layout',
//			'Layout containing only one element, fitted to container',
//			{layout:'fit',title:'FitLayout Container'}],
//			['Layouts','Card Layout',
//			'Layout containing many elements, only one can be displayed at a time',
//			{layout:'card',title:'CardLayout Container'}],
//			['Layouts','Anchor Layout',
//			'Layout containing many elements, sized with "anchor" percentage values',
//			{layout:'anchor',title:'AnchorLayout Container'}],
			//huangheng 20130723 edit 修改tooltips bug 8212
			['Layouts','绝对布局',
			'使用绝对位置x/y的值来布局',
			{layout:'absolute',title:'',height:100}]
		);

		// Accordion Layout
		// jiang note 20091125
//		data.push(['Layouts', 'Accordion Layout', 'Layout as accordion', function(add,parent) {
//			var w = new Ext.Window({
//				title:"New Accordion Layout",
//				width:619,
//				height:552,
//				items:[{
//						xtype:"form",
//						labelWidth:120,
//						items:[{
//								border:false,
//								hideLabels:true,
//								layout:"form",
//								items:[{
//										xtype:"checkbox",
//										boxLabel:"collapseFirst <span class=\"notice\">True to make sure the collapse/expand toggle button always renders first (to the left of) any other tools in the contained panels' title bars, false to render it last (defaults to false).</span>",
//										name:"collapseFirst"
//									},{
//										xtype:"checkbox",
//										boxLabel:"autoWidth <span class=\"notice\">True to set each contained item's width to 'auto', false to use the item's current width (defaults to true).</span>",
//										name:"autoWidth",
//										checked:true
//									},{
//										xtype:"checkbox",
//										boxLabel:"animate <span class=\"notice\">True to swap the position of each panel as it is expanded so that it becomes the first item in the container, false to keep the panels in the rendered order. This is NOT compatible with \"animate:true\" (defaults to false).</span>",
//										name:"animate"
//									},{
//										xtype:"checkbox",
//										boxLabel:"activeOnTop <span class=\"notice\">True to swap the position of each panel as it is expanded so that it becomes the first item in the container, false to keep the panels in the rendered order. This is NOT compatible with \"animate:true\" (defaults to false).</span>",
//										name:"activeOnTop"
//									},{
//										xtype:"checkbox",
//										boxLabel:"fill <span class=\"notice\">True to adjust the active item's height to fill the available space in the container, false to use the item's current height, or auto height if not explicitly set (defaults to true).</span>",
//										name:"fill",
//										checked:true
//									},{
//										xtype:"checkbox",
//										boxLabel:"hideCollapseTool <span class=\"notice\">True to hide the contained panels' collapse/expand toggle buttons, false to display them (defaults to false). When set to true, titleCollapse should be true also.</span>",
//										name:"hideCollapseTool"
//									},{
//										xtype:"checkbox",
//										boxLabel:"titleCollapse <span class=\"notice\">True to allow expand/collapse of each contained panel by clicking anywhere on the title bar, false to allow expand/collapse only when the toggle tool button is clicked (defaults to true). When set to false, hideCollapseTool should be false also.</span>",
//										name:"titleCollapse",
//										checked:true
//									}]
//							},{
//								xtype:"textfield",
//								fieldLabel:"extraCls",
//								name:"extraCls"
//							},{
//								xtype:"checkbox",
//								boxLabel:"<span class=\"notice\">Add dummy panels to help render layout (useful for debug)</span>",
//								name:"adddummy",
//								checked:true,
//								fieldLabel:"Add dummy panels"
//							}]
//					}],
//					buttons:[{
//						text:'Ok',
//						scope:this,
//						handler:function() {
//							var values = w.items.first().form.getValues();
//							w.close();
//							var config = {layout:'accordion',layoutConfig:{},items:[]};
//							config.layoutConfig.activeOnTop = (values.activeOnTop ? true : false);
//							config.layoutConfig.animate = (values.animate ? true : false);
//							config.layoutConfig.autoWidth = (values.autoWidth ? true : false);
//							config.layoutConfig.collapseFirst = (values.collapseFirst ? true : false);
//							config.layoutConfig.fill = (values.fill ? true : false);
//							config.layoutConfig.hideCollapseTool = (values.hideCollapseTool ? true : false);
//							config.layoutConfig.titleCollapse = (values.titleCollapse ? true : false);
//							if (values.extraCls) { config.layoutConfig.extraCls = values.extraCls; }
//							if (values.adddummy) {
//								config.items.push(
//									{title:'Panel 1',html:'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Sed non risus.'},
//									{title:'Panel 2',html:'Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.'},
//									{title:'Panel 3',html:'Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.'},
//									{title:'Panel 4',html:'Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.'});
//							}
//							add.call(this, config);
//						}
//					},{
//						text:'Cancel',
//						handler:function() {w.close();}
//					}]
//			});
//			w.show();
//
//		}]);

		// Table Layout
		//data.push(['Forms', '表格布局', 'Layout as a table', function(add,parent) {
		data.push(['Forms', '表格布局', '表格布局', function(add,parent) {
			var w = new Ext.Window({
        width:300,
        height:130,
        //jiangyuntao 20110803 edit 将输入行列的弹出WINDOW修改为模态的，避免出现未输入行列就保存表单的情况。
        modal : true ,
        layout:"fit",
        title:"创建表格布局",
        items:[{
            xtype:"form",
            frame:true,
            labelWidth:150,
            items:[{
                layout:"table",
                layoutConfig:{
                  columns:2
                },
                items:[{
                    layout:"form",
                    items:[{
                        xtype:"numberfield",
                        fieldLabel:"列 x 行",
                        width:48,
                        allowNegative:false,
                        allowDecimals:false,
                        name:"cols"
                      }]
                  },{
                    layout:"form",
                    labelWidth:10,
                    labelSeparator:" ",
                    style:"margin-left:5px",
                    items:[{
                        xtype:"numberfield",
                        fieldLabel:"x",
                        width:48,
                        allowNegative:false,
                        allowDecimals:false,
                        name:"rows"
                      }]
                  }]
              }
             // jiang note 20091124
//              ,{
//                xtype:"textfield",
//                fieldLabel:"Cells padding (px)",
//                width:48,
//                name:"cellpadding"
//              }
//              ,{
//                xtype:"textfield",
//                fieldLabel:"Cells margin (px)",
//                width:48,
//                name:"cellmargin"
//              }
              ,{
                xtype:"checkbox",
								fieldLabel:"是否有边框",
								name:"borders",
								//jiangyuntao 20120329 edit 将是否有边框隐藏，不允许进行此设置。
								hidden:true,
								hideLabel:true,
								checked:true
              /*},{
                xtype:"checkbox",
								fieldLabel:"单元格中是否增加内容",
								name:"addcontent",
								checked:false*/
              }]
          }],
					buttons:[{
						text:'确定',
						scope:this,
						handler:function() {
						
							var cleanConfig = this.getTreeConfig();
							cleanConfig = (cleanConfig.items?cleanConfig.items[0]||{}:{});	
							if(cleanConfig&&cleanConfig.xtype == 'form'){
							
							}else{
								showMsg('请先双击表单按钮','3');
									return ;
							}
						
							var values = w.items.first().form.getValues();
							var cols = parseInt(values.cols,10);
							var rows = parseInt(values.rows,10);
							if (isNaN(cols) || isNaN(rows)) {
								showMsg("操作失败！",'2');
								showMsg("请正确输入行和列的值！",'3');//xiaoxiong 20110426 修改提示信息
								return;
							}
							w.close();
							var config = {layout:'table',border:false,defaults:{},layoutConfig:{columns:cols},items:[]};
							for (var i = 0; i < cols; i++) {
								for (var j = 0; j < rows; j++) {
//									config.items.push({html:(values.addcontent?'col '+i+', row '+j:null)});
									// jiang modify 20091124
  
									//config.items.push({html:(values.addcontent?' 单 元 格 ':' '),
									config.items.push({html:(' '),//xiaoxiong 20110427 注释掉"单元格中是否增加内容"复选框
									height:25,width:140,bodyCfg:{tag: 'center',cls: 'x-panel-body',style:'font:normal 12px arial;'}});
								}
							}
							var defaults = {};
							 // jiang note 20091124
//							var pad = parseInt(values.cellpadding,10);
//							if (!isNaN(pad)) { defaults.bodyStyle = 'padding:'+pad+'px;'; }
//							var margin = parseInt(values.cellmargin,10);
//							if (!isNaN(margin)) { defaults.style = 'margin:'+margin+'px;'; }
							if (!values.borders) { defaults.border = false; }
							if (defaults != {}) { config.defaults ={style:"border-color:red",margins:'6 6 6 6'}; }
							add.call(this, config);
						}
					},{
						text:'关闭',
						handler:function() {w.close();}
					}]
			});
			w.show();

		}]);

		// Column Layout
		// jiang note 20091125
//		data.push(['Layouts', 'Column Layout', 'Layout of columns', function(add,parent) {
//			var w = new Ext.Window({
//        width:425,
//        height:349,
//        layout:"fit",
//        title:"New Column Layout",
//        items:[{
//            xtype:"form",
//            frame:true,
//            items:[{
//                columns:"3",
//                layout:"table",
//                layoutConfig:{
//                  columns:3
//                },
//                defaults:{
//                  style:"margin:2px"
//                },
//                items:[{
//                    html:"Column"
//                  },{
//                    html:"Size *"
//                  },{
//                    html:"Title **"
//                  },{
//                    xtype:"checkbox",
//										name:'active_1'
//                  },{
//                    xtype:"textfield",
//                    maskRe:/[0-9%]/,
//                    width:53,
//										name:'size_1'
//                  },{
//                    xtype:"textfield",
//										name:'title_1'
//                  },{
//                    xtype:"checkbox",
//										name:'active_2'
//                  },{
//                    xtype:"textfield",
//                    maskRe:/[0-9.%]/,
//                    width:53,
//										name:'size_2'
//                  },{
//                    xtype:"textfield",
//										name:'title_2'
//                  },{
//                    xtype:"checkbox",
//										name:'active_3'
//                  },{
//                    xtype:"textfield",
//                    maskRe:/[0-9.%]/,
//                    width:53,
//										name:'size_3'
//                  },{
//                    xtype:"textfield",
//										name:'title_3'
//                  },{
//                    xtype:"checkbox",
//										name:'active_4'
//                  },{
//                    xtype:"textfield",
//                    maskRe:/[0-9.%]/,
//                    width:53,
//										name:'size_4'
//                  },{
//                    xtype:"textfield",
//										name:'title_4'
//                  },{
//                    xtype:"checkbox",
//										name:'active_5'
//                  },{
//                    xtype:"textfield",
//                    maskRe:/[0-9.%]/,
//                    width:53,
//										name:'size_5'
//                  },{
//                    xtype:"textfield",
//										name:'title_5'
//                  },{
//                    xtype:"checkbox",
//										name:'active_6'
//                  },{
//                    xtype:"textfield",
//                    maskRe:/[0-9.%]/,
//                    width:53,
//										name:'size_6'
//                  },{
//                    xtype:"textfield",
//										name:'title_6'
//                  }]
//              },{
//								html:"* Size : can be a percentage of total width (i.e. 33%),"+
//									"a fixed with (i.e. 120), or empty (autosize)<br/>"+
//									"** Title : not set if empty"
//							}]
//          }],
//					buttons:[{
//						text:'Ok',
//						scope:this,
//						handler:function() {
//							var values = w.items.first().form.getValues();
//							w.close();
//							var config = {layout:'column',items:[]};
//							Ext.each([1,2,3,4,5,6], function(r) {
//								if (values['active_'+r]) {
//									var item = {title:values['title_'+r]||null};
//									var widthVal = values['size_'+r];
//									var width = parseInt(widthVal,10);
//									if (!isNaN(width)) {
//										if (widthVal[widthVal.length-1] == '%') {
//											item.columnWidth = width/100;
//										} else {
//											item.width = width;
//										}
//									}
//									config.items.push(item);
//								}
//							});
//							add.call(this, config);
//						}
//					},{
//						text:'Cancel',
//						handler:function() {w.close();}
//					}]
//			});
//			w.show();
//
//		}]);

		// Border layout
		// jiang note 20091125
//		data.push(['Layouts','Border Layout', 'Layout with regions', function(add,parent) {
//				var w = new Ext.Window({
//					title:"Border Layout",
//					width:550,
//					height:400,
//					layout:'fit',
//					items:[{
//						autoScroll:true,
//						xtype:"form",
//						frame:true,
//						defaults:{
//							style:"margin:10px"
//						},
//						items:[{
//								xtype:"fieldset",
//								title:"Center",
//								autoHeight:true,
//								items:[{
//										xtype:"textfield",
//										fieldLabel:"Title",
//										name:"title_center",
//										width:299
//									}]
//							},{
//								xtype:"fieldset",
//								title:"Add north region",
//								autoHeight:true,
//								checkboxToggle:true,
//								collapsed:true,
//								checkboxName:"active_north",
//								items:[{
//										xtype:"textfield",
//										fieldLabel:"Title",
//										name:"title_north",
//										width:299
//									},{
//										layout:"table",
//										items:[{
//												layout:"form",
//												items:[{
//														xtype:"numberfield",
//														fieldLabel:"Height (px)",
//														name:"height_north",
//														allowDecimals:false,
//														allowNegative:false,
//														width:66
//													}]
//											},{
//												layout:"form",
//												hideLabels:true,
//												style:"margin-left:10px",
//												items:[{
//														xtype:"checkbox",
//														name:"split_north",
//														boxLabel:"Split"
//													}]
//											},{
//												layout:"form",
//												hideLabels:true,
//												style:"margin-left:10px",
//												items:[{
//														xtype:"checkbox",
//														name:"collapsible_north",
//														boxLabel:"Collapsible"
//													}]
//											},{
//												layout:"form",
//												hideLabels:true,
//												style:"margin-left:10px",
//												items:[{
//														xtype:"checkbox",
//														name:"titleCollapse_north",
//														boxLabel:"TitleCollapse"
//													}]
//											}]
//									}]
//							},{
//								xtype:"fieldset",
//								title:"Add south region",
//								autoHeight:true,
//								checkboxToggle:true,
//								collapsed:true,
//								checkboxName:"active_south",
//								items:[{
//										xtype:"textfield",
//										fieldLabel:"Title",
//										name:"title_south",
//										width:299
//									},{
//										layout:"table",
//										items:[{
//												layout:"form",
//												items:[{
//														xtype:"numberfield",
//														fieldLabel:"Height (px)",
//														name:"height_south",
//														allowDecimals:false,
//														allowNegative:false,
//														width:66
//													}]
//											},{
//												layout:"form",
//												hideLabels:true,
//												style:"margin-left:10px",
//												items:[{
//														xtype:"checkbox",
//														name:"split_south",
//														boxLabel:"Split"
//													}]
//											},{
//												layout:"form",
//												hideLabels:true,
//												style:"margin-left:10px",
//												items:[{
//														xtype:"checkbox",
//														name:"collapsible_south",
//														boxLabel:"Collapsible"
//													}]
//											},{
//												layout:"form",
//												hideLabels:true,
//												style:"margin-left:10px",
//												items:[{
//														xtype:"checkbox",
//														name:"titleCollapse_south",
//														boxLabel:"TitleCollapse"
//													}]
//											}]
//									}]
//							},{
//								xtype:"fieldset",
//								title:"Add west region",
//								autoHeight:true,
//								checkboxToggle:true,
//								collapsed:true,
//								checkboxName:"active_west",
//								items:[{
//										xtype:"textfield",
//										fieldLabel:"Title",
//										name:"title_west",
//										width:299
//									},{
//										layout:"table",
//										items:[{
//												layout:"form",
//												items:[{
//														xtype:"numberfield",
//														fieldLabel:"Width (px)",
//														name:"width_west",
//														allowDecimals:false,
//														allowNegative:false,
//														width:66
//													}]
//											},{
//												layout:"form",
//												hideLabels:true,
//												style:"margin-left:10px",
//												items:[{
//														xtype:"checkbox",
//														name:"split_west",
//														boxLabel:"Split"
//													}]
//											},{
//												layout:"form",
//												hideLabels:true,
//												style:"margin-left:10px",
//												items:[{
//														xtype:"checkbox",
//														name:"collapsible_west",
//														boxLabel:"Collapsible"
//													}]
//											},{
//												layout:"form",
//												hideLabels:true,
//												style:"margin-left:10px",
//												items:[{
//														xtype:"checkbox",
//														name:"titleCollapse_west",
//														boxLabel:"TitleCollapse"
//													}]
//											}]
//									}]
//							},{
//								xtype:"fieldset",
//								title:"Add east region",
//								autoHeight:true,
//								checkboxToggle:true,
//								collapsed:true,
//								checkboxName:"active_east",
//								items:[{
//										xtype:"textfield",
//										fieldLabel:"Title",
//										name:"title_east",
//										width:299
//									},{
//										layout:"table",
//										items:[{
//												layout:"form",
//												items:[{
//														xtype:"numberfield",
//														fieldLabel:"Width (px)",
//														name:"width_east",
//														allowDecimals:false,
//														allowNegative:false,
//														width:66
//													}]
//											},{
//												layout:"form",
//												hideLabels:true,
//												style:"margin-left:10px",
//												items:[{
//														xtype:"checkbox",
//														name:"split_east",
//														boxLabel:"Split"
//													}]
//											},{
//												layout:"form",
//												hideLabels:true,
//												style:"margin-left:10px",
//												items:[{
//														xtype:"checkbox",
//														name:"collapsible_east",
//														boxLabel:"Collapsible"
//													}]
//											},{
//												layout:"form",
//												hideLabels:true,
//												style:"margin-left:10px",
//												items:[{
//														xtype:"checkbox",
//														name:"titleCollapse_east",
//														boxLabel:"TitleCollapse"
//													}]
//											}]
//									}]
//							}],
//						buttons:[{
//							text:'Ok',
//							scope:this,
//							handler:function() {
//								var values = w.items.first().form.getValues();
//								w.close();
//								var config = {layout:'border',items:[]};
//								config.items.push({region:'center',title:values.title_center||null});
//								Ext.each(['north','south','west','east'], function(r) {
//									if (values['active_'+r]) {
//										config.items.push({
//											region        : r,
//											title         : values['title_'+r]||null,
//											width         : parseInt(values['width_'+r], 10)||null,
//											height        : parseInt(values['height_'+r], 10)||null,
//											split         : (values['split_'+r]?true:null),
//											collapsible   : (values['collapsible_'+r]?true:null),
//											titleCollapse : (values['titleCollapse_'+r]?true:null)
//										});
//									}
//								});
//								if (parent) { parent.layout = 'fit'; }
//								add.call(this, config);
//							}
//						},{
//							text:'Cancel',
//							handler:function() {w.close();}
//						}]
//					}]
//				});
//				w.show();
//			}]);

		return data;

	}
};
