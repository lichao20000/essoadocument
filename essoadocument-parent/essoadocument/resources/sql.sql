-- ----------------------------
-- Table structure for ess_contract
-- ----------------------------
DROP TABLE IF EXISTS `ess_contract`;
CREATE TABLE `ess_contract` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `escontractname` varchar(64) DEFAULT NULL,
  `escontractnum` varchar(20) DEFAULT NULL,
  `esprojectname` varchar(64) DEFAULT NULL,
  `esdevice` varchar(64) DEFAULT NULL,
  `escompany` varchar(64) DEFAULT NULL,
  `esperson` varchar(20) DEFAULT NULL,
  `esperstel` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of ess_contractitem
-- ----------------------------

-- ----------------------------
-- Table structure for `ess_device`
-- ----------------------------
DROP TABLE IF EXISTS `ess_device`;
CREATE TABLE `ess_device` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `pId` int(11) NOT NULL COMMENT '父节点id',
  `name` varchar(200) DEFAULT NULL COMMENT '装置单元或分类名称',
  `firstNo` varchar(20) DEFAULT NULL COMMENT '主项号',
  `secondNo` varchar(20) DEFAULT NULL COMMENT '子项号',
  `deviceNo` varchar(20) DEFAULT NULL COMMENT '装置单元号',
  `baseUnits` varchar(200) DEFAULT NULL COMMENT '基础设计单位名称',
  `detailUnits` varchar(200) DEFAULT NULL COMMENT '详细设计单位名称',
  `mainPart` varchar(200) DEFAULT NULL COMMENT '负责部门',
  `supervisionUnits` varchar(200) DEFAULT NULL COMMENT '监理单位名称',
  `baseUnitsCode` varchar(200) DEFAULT NULL COMMENT '基础设计单位代码',
  `detailUnitsCode` varchar(200) DEFAULT NULL COMMENT '详细设计单位代码',
  `mainPartCode` varchar(200) DEFAULT NULL COMMENT '负责部门代码',
  `supervisionUnitsCode` varchar(200) DEFAULT NULL COMMENT '监理单位代码',
  `remarks` varchar(2000) DEFAULT NULL COMMENT '备注',
  `level` char(1) DEFAULT NULL COMMENT '装置单元级别',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8;

-- begin--gengqianfeng
-- ----------------------------
-- Table structure for ess_filechange_order
-- ----------------------------
DROP TABLE IF EXISTS `ess_filechange_order`;
CREATE TABLE `ess_filechange_order` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `code` varchar(30) DEFAULT NULL COMMENT '代码',
  `draw_name` varchar(50) DEFAULT NULL COMMENT '图纸名称',
  `file_id` varchar(30) DEFAULT NULL COMMENT '文件代码',
  `status` varchar(20) DEFAULT NULL COMMENT '状态',
  `creater` varchar(50) DEFAULT NULL COMMENT '发起人id',
  `createtime` varchar(20) DEFAULT NULL COMMENT '发起时间',
  `receiver` varchar(50) DEFAULT NULL COMMENT '接收人',
  `receivetime` varchar(20) DEFAULT NULL COMMENT '接收时间',
  `do_del` tinyint(1) DEFAULT '1' COMMENT '0、删除，1、未删',
  `part_code` varchar(20) DEFAULT NULL COMMENT '单位部门代码',
  `send_id` varchar(50) DEFAULT NULL COMMENT '发送者id',
  `copies` int(11) DEFAULT NULL COMMENT '份数',
  `sign` varchar(50) DEFAULT NULL COMMENT '签名',
  `mobile` varchar(20) DEFAULT NULL COMMENT '手机号',
  `reply_content` varchar(150) DEFAULT NULL COMMENT '回复内容',
  `filePath` varchar(50) DEFAULT NULL COMMENT '接收签字单路径',
  `fileName` varchar(30) DEFAULT NULL COMMENT '签字单文件名',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='文件变更清单表';

-- ----------------------------
-- Table structure for ess_fileflow
-- ----------------------------
DROP TABLE IF EXISTS `ess_fileflow`;
CREATE TABLE `ess_fileflow` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `pId` int(11) DEFAULT NULL COMMENT '父节点id',
  `name` varchar(50) DEFAULT NULL COMMENT '流程名称',
  `typeNo` varchar(20) DEFAULT NULL COMMENT '关联文件类型id',
  `status` varchar(20) DEFAULT NULL COMMENT '状态',
  `version` varchar(50) DEFAULT NULL COMMENT '版本',
  `describtion` varchar(256) DEFAULT NULL COMMENT '描述',
  `creater` varchar(50) DEFAULT NULL COMMENT '创建人id',
  `modifyer` varchar(50) DEFAULT NULL COMMENT '修改人id',
  `createtime` varchar(20) DEFAULT NULL COMMENT '创建时间',
  `modifytime` varchar(20) DEFAULT NULL COMMENT '修改时间',
  `flow_matrix` text COMMENT '流程矩阵json串',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='文件收发流程表';

-- ----------------------------
-- Table structure for ess_fileflow_type
-- ----------------------------
DROP TABLE IF EXISTS `ess_fileflow_type`;
CREATE TABLE `ess_fileflow_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `pId` int(11) DEFAULT NULL COMMENT '父节点id',
  `name` varchar(50) DEFAULT NULL COMMENT '类型名称',
  `sort` int(11) DEFAULT NULL COMMENT '显示顺序',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='文件收发流程类型表';
-- ----------------------------
-- Records of ess_fileflow_type
-- ----------------------------
INSERT INTO `ess_fileflow_type` VALUES ('1', '0', '文件收发流程类型', '1');
-- ----------------------------
-- Table structure for ess_filereceive
-- ----------------------------
DROP TABLE IF EXISTS `ess_filereceive`;
CREATE TABLE `ess_filereceive` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `pId` int(11) DEFAULT NULL COMMENT '父级节点id',
  `send_id` int(11) DEFAULT NULL COMMENT '分发id',
  `part_code` varchar(20) DEFAULT NULL COMMENT '单位部门代码',
  `copies` int(11) DEFAULT NULL COMMENT '份数',
  `creater` varchar(50) DEFAULT NULL COMMENT '发送人',
  `createtime` varchar(20) DEFAULT NULL COMMENT '发送时间',
  `receiver` varchar(50) DEFAULT NULL COMMENT '接受人id',
  `receivetime` varchar(20) DEFAULT NULL COMMENT '接受时间',
  `status` varchar(10) DEFAULT NULL COMMENT '未接收（默认）,已接收',
  `do_del` tinyint(1) DEFAULT '1' COMMENT '0、删除，1、未删除',
  `sign` varchar(50) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `reply_content` varchar(150) DEFAULT NULL,
  `filePath` varchar(50) DEFAULT NULL COMMENT '接收签字单路径',
  `fileName` varchar(30) DEFAULT NULL COMMENT '签字单名称',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='文件接收表';

ALTER TABLE ess_filereceive add column `file_id` varchar(30) DEFAULT NULL; 

-- ----------------------------
-- Table structure for ess_filesend
-- ----------------------------
DROP TABLE IF EXISTS `ess_filesend`;
CREATE TABLE `ess_filesend` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `no` int(11) DEFAULT NULL COMMENT '编号',
  `pId` int(11) DEFAULT NULL COMMENT '父级节点id',
  `status` varchar(20) DEFAULT NULL COMMENT '状态--待发（默认），已发，结束',
  `fileflow_id` int(11) DEFAULT NULL COMMENT '流程id',
  `file_id` varchar(64) DEFAULT NULL COMMENT '文件id，多个以英文逗号分隔',
  `creater` varchar(50) DEFAULT NULL COMMENT '发起人id',
  `createtime` varchar(20) DEFAULT NULL COMMENT '发起时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='文件分发表';

-- ----------------------------
-- Table structure for ess_participatory
-- ----------------------------
DROP TABLE IF EXISTS `ess_participatory`;
CREATE TABLE `ess_participatory` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `pId` int(11) DEFAULT NULL COMMENT '父节点id',
  `code` varchar(20) DEFAULT NULL COMMENT '代码',
  `name` varchar(50) DEFAULT NULL COMMENT '名称',
  `type` varchar(20) DEFAULT NULL COMMENT '参建单位类型',
  `user_id` varchar(64) DEFAULT NULL COMMENT '文控人员id，多个以英文逗号分隔',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='参建单位部门表';

-- ----------------------------
-- Records of ess_participatory
-- ----------------------------
INSERT INTO `ess_participatory` VALUES ('1', '0', 'CJDW', '参建单位部门', null, 'admin');

INSERT INTO fyplatformdb.platformservice (serviceId,serviceName,interfaceName,url,enableState,token,appId,instanceId,reason ) VALUES ('esdocument_service', 'sendreceiveflow', 'cn.flying.rest.service.ISendReceiveFlowService', 'http://127.0.0.1:8080/essoadocument/rest/sendreceiveflow', '1', 'wwwwww', '1', '0', null);
INSERT INTO fyplatformdb.platformservice (serviceId,serviceName,interfaceName,url,enableState,token,appId,instanceId,reason ) VALUES ('esdocument_service', 'documentSend', 'cn.flying.rest.service.IDocumentSendService', 'http://127.0.0.1:8080/essoadocument/rest/documentSend', '1', 'wwwwww', '1', '0', null);
INSERT INTO fyplatformdb.platformservice (serviceId,serviceName,interfaceName,url,enableState,token,appId,instanceId,reason ) VALUES ('esdocument_service', 'documentReceive', 'cn.flying.rest.service.IDocumentReceiveService', 'http://127.0.0.1:8080/essoadocument/rest/documentReceive', '1', 'wwwwww', '1', '0', null);
INSERT INTO fyplatformdb.platformservice (serviceId,serviceName,interfaceName,url,enableState,token,appId,instanceId,reason ) VALUES ('esdocument_service', 'filing', 'cn.flying.rest.service.IFilingService', 'http://127.0.0.1:8080/essoadocument/rest/filing', '1', 'wwwwww', '3', '0', NULL );

-- end--gengqianfeng

-- 添加rest服务
INSERT INTO fyplatformdb.platformservice (serviceId,serviceName,interfaceName,url,enableState,token,appId,instanceId,reason ) VALUES ('esdocument_service', 'device', 'cn.flying.rest.service.IDeviceService', 'http://127.0.0.1:8080/essoadocument/rest/device', '1', 'wwwwww', '3', '0', null);
INSERT INTO fyplatformdb.platformservice (serviceId,serviceName,interfaceName,url,enableState,token,appId,instanceId,reason ) VALUES ('esdocument_service', 'participatory', 'cn.flying.rest.service.IParticipatoryService', 'http://127.0.0.1:8080/essoadocument/rest/participatory', '1', 'wwwwww', '3', '0', null);
INSERT INTO fyplatformdb.platformservice (serviceId,serviceName,interfaceName,url,enableState,token,appId,instanceId,reason )VALUES('esdocument_service','documentStage','cn.flying.rest.service.IDocumentStageService','http://127.0.0.1:8080/essoadocument/rest/documentStage','1','wwwwww','3','0',NULL);
INSERT INTO fyplatformdb.platformservice (serviceId,serviceName,interfaceName,url,enableState,token,appId,instanceId,reason )VALUES('esdocument_service','documentType','cn.flying.rest.service.IDocumentTypeService','http://127.0.0.1:8080/essoadocument/rest/documentType','1','wwwwww','3','0',NULL);


-- 添加文件收集范围数据表     20141118 xuekun--
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS `ess_document_stage`;
CREATE TABLE `ess_document_stage` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '子增长id',
  `pId` int(11) DEFAULT NULL COMMENT '父节点id',
  `name` varchar(200) DEFAULT NULL COMMENT '文档收集范围名称',
  `code` varchar(50) DEFAULT NULL COMMENT '文档收集范围代码',
  `period` varchar(50) DEFAULT NULL COMMENT '文档收集范围期限',
  `level` char(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8;

-- xuekun 20141118 添加文件元数据 数据表--
SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `ess_document_metadata`
-- ----------------------------
DROP TABLE IF EXISTS `ess_document_metadata`;
CREATE TABLE `ess_document_metadata` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `name` varchar(200) DEFAULT NULL COMMENT '元数据名称',
  `code` varchar(50) DEFAULT NULL COMMENT '元数据代码',
  `type` varchar(10) DEFAULT NULL COMMENT '元数据类型',
  `length` char(5) DEFAULT NULL COMMENT '元数据长度',
  `defaultValue` char(5) DEFAULT NULL COMMENT '元数据默认值',
  `stageId` int(11) DEFAULT NULL,
  `isSystem` char(1) DEFAULT '1' COMMENT '是否为系统元数据 0:系统元数据,1:不是系统元数据',
  PRIMARY KEY (`id`),
  KEY `stageId` (`stageId`),
  CONSTRAINT `ess_document_metadata_ibfk_1` FOREIGN KEY (`stageId`) REFERENCES `ess_document_stage` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- 添加文件元数据 rest服务--
INSERT INTO fyplatformdb.platformservice ( serviceId, serviceName, interfaceName, url, enableState, token, appId, instanceId, reason ) VALUES ( 'esdocument_service', 'documentsMetadata', 'cn.flying.rest.service.IDocumentsMetadataService', 'http://127.0.0.1:8080/essoadocument/rest/documentsMetadata', '1', 'wwwwww', '3', '0', NULL );

-- ------------xuekun 20141120 文件专业代码----------------
DROP TABLE IF EXISTS `ess_document_type`;
CREATE TABLE `ess_document_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '子增长id',
  `typeName` varchar(50) DEFAULT NULL COMMENT '文件类型名称',
  `typeNo` varchar(50) DEFAULT NULL COMMENT '文件类型代码',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
-- ------------------xuekun 20141120 文件分类代码 rest服务----------------------------------
INSERT INTO fyplatformdb.platformservice (serviceId,serviceName,interfaceName,url,enableState,token,appId,instanceId,reason )VALUES('esdocument_service','documentType','cn.flying.rest.service.IDocumentTypeService','http://127.0.0.1:8080/essoadocument/rest/documentType','1','wwwwww','3','0',NULL);


-- -------------xuekun 20141120 文件分类代码---------------
-- Table structure for `ess_engineering`
-- ----------------------------
DROP TABLE IF EXISTS `ess_engineering`;
CREATE TABLE `ess_engineering` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '子增长id',
  `typeName` varchar(50) DEFAULT NULL COMMENT '文件专业名称',
  `typeNo` varchar(50) DEFAULT NULL COMMENT '文件专业代码',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
-- ------------------xuekun 20141120 文件专业代码 rest服务----------------------------------
INSERT INTO fyplatformdb.platformservice ( serviceId, serviceName, interfaceName, url, enableState, token, appId, instanceId, reason ) VALUES ( 'esdocument_service', 'engineering', 'cn.flying.rest.service.IEngineeringService', 'http://127.0.0.1:8080/essoadocument/rest/engineering', '1', 'wwwwww', '3', '0', NULL );

-- -xuekun 20141119 添加文件收集数据表----
DROP TABLE IF EXISTS `ess_document`;
CREATE TABLE `ess_document` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `stageCode` varchar(40) DEFAULT NULL  COMMENT '收集范围代码',
  `deviceCode` varchar(40) DEFAULT NULL COMMENT '装置号',
  `participatoryCode` varchar(40) DEFAULT NULL COMMENT '部门代码',
  `documentCode` varchar(40) DEFAULT NULL COMMENT '文件代码',
  `engineeringCode` varchar(40) DEFAULT NULL COMMENT '专业代码',
  `itemName` varchar(200) DEFAULT NULL COMMENT '项目名称',
  `title` varchar(200) DEFAULT NULL COMMENT '文件标题',
  `docNo` varchar(200) DEFAULT NULL COMMENT '文件编码',
  `person` varchar(100) DEFAULT NULL COMMENT '拟定人',
  `date` varchar(11) DEFAULT '0000-00-00' COMMENT '拟定日期',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;
-- -------------20141120 xuekun 添加文件收集相关rest服务----------------------
INSERT INTO fyplatformdb.platformservice ( serviceId, serviceName, interfaceName, url, enableState, token, appId, instanceId, reason ) VALUES ( 'esdocument_service', 'documentsCollection', 'cn.flying.rest.service.IDocumentsCollectionService', 'http://127.0.0.1:8080/essoadocument/rest/documentsCollection', '1', 'wwwwww', '3', '0', NULL );
/**
 * 元数据添加小数点长度字段和是否为空字段
 */
alter table ess_document_metadata add column dotLength decimal(10);
-- ---xiewenda修改添加表 start--- --
/**
 * 参见部门表 添加level字段
 */
alter table ess_participatory add column level char(1);

/**
 * 统计主表
 */
CREATE TABLE `ess_statistic` (
  `id` bigint(32) NOT NULL AUTO_INCREMENT COMMENT '逻辑主键',
  `statisticName` varchar(128) DEFAULT NULL COMMENT '统计名称',
  `treeType` int(1) DEFAULT NULL COMMENT '此统计选择的分类节点树标识 1：收集范围表 2：参见部门表 3：装置表',
  `colCount` int(2) DEFAULT NULL COMMENT '此统计的总列数',
  `colTitle` varchar(128) DEFAULT NULL COMMENT '列标题字符串集合以 ；分割',
  `currStep` varchar(2) DEFAULT NULL COMMENT '当前进行统计步骤',
  `classNode` int(1) DEFAULT NULL COMMENT '分类节点',
  `dataNode` int(1) DEFAULT NULL COMMENT '数据节点',
  `isSummary` int(1) DEFAULT NULL COMMENT '是否汇总 0：否 1：是',
  `isLayout` int(1) DEFAULT NULL COMMENT '是否缩进 0：否 1：是',
  `isComplete` int(1) DEFAULT NULL COMMENT '统计是否完成 0：否，1：是',
  `orgId` varchar(64) DEFAULT NULL COMMENT '所属的部门',
  `pic` varchar(10) DEFAULT NULL COMMENT '要展现的统计图样式',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

INSERT INTO fyplatformdb.platformservice ( serviceId, serviceName, interfaceName, url, enableState, token, appId, instanceId, reason ) VALUES ( 'esdocument_service', 'statistic', 'cn.flying.rest.service.IStatisticService', 'http://127.0.0.1:8080/essoadocument/rest/statistic', '1', 'wwwwww', '4', '0', NULL );

/**
 * 统计项表
 */
CREATE TABLE `ess_statistic_items` (
  `id` bigint(32) NOT NULL AUTO_INCREMENT COMMENT '逻辑主键',
  `tree_id` int(32) DEFAULT NULL COMMENT '统计树节点标识id',
  `statistic_id` bigint(32) DEFAULT NULL COMMENT '关联的统计规则的id',
  `nodeType` int(1) DEFAULT NULL COMMENT '节点类型(所属的树)',
  `colNo` int(5) DEFAULT NULL COMMENT '列号',
  `ruleField` varchar(64) DEFAULT NULL COMMENT '规则字段',
  `ruleMethod` varchar(10) DEFAULT NULL COMMENT '统计方法（求和，平均等）',
  `ruleCondition` varchar(256) DEFAULT NULL COMMENT '统计的规则条件',
  `isCollection` int(1) DEFAULT NULL,
  `collIdentifier` varchar(256) DEFAULT NULL COMMENT '显示的统计标识',
  `structureId` int(11) DEFAULT NULL,
  `cncondition` varchar(256) DEFAULT NULL COMMENT '统计条件显示规则',
  `encondition` varchar(256) DEFAULT NULL COMMENT '统计条件生成规则',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;
-- ---xiewenda修改添加表 end--- --

-- ---xiewenda添加菜单表start----
SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `ess_menu`
-- ----------------------------
DROP TABLE IF EXISTS `ess_menu`;
CREATE TABLE `ess_menu` (
  `id` int(11) NOT NULL COMMENT '逻辑主键',
  `pId` int(11) NOT NULL COMMENT '父节点的id',
  `name` varchar(40) NOT NULL COMMENT '节点显示名称',
  `description` varchar(50) DEFAULT NULL COMMENT '节点描述',
  `controller` varchar(40) DEFAULT NULL COMMENT '节点对应的请求类型',
  `action` varchar(40) DEFAULT NULL COMMENT '请求路径',
  `img` varchar(100) DEFAULT NULL COMMENT '图片',
  `menuorder` int(4) DEFAULT NULL COMMENT '节点树的先后排序',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of ess_menu
-- ----------------------------
INSERT INTO `ess_menu` VALUES ('1', '0', '个人工作台', null, null, null, null, '1');
INSERT INTO `ess_menu` VALUES ('2', '0', '项目管理', null, null, null, null, '2');
INSERT INTO `ess_menu` VALUES ('3', '0', '文件管理', null, null, null, null, '3');
INSERT INTO `ess_menu` VALUES ('4', '0', '收发文件', null, null, null, null, '4');
INSERT INTO `ess_menu` VALUES ('5', '0', '文件验收归档', null, null, null, null, '5');
INSERT INTO `ess_menu` VALUES ('6', '0', '文档利用', null, null, null, null, '6');
INSERT INTO `ess_menu` VALUES ('7', '0', '权限控制', null, null, null, null, '7');
INSERT INTO `ess_menu` VALUES ('8', '0', '标准规范', null, null, null, null, '8');
INSERT INTO `ess_menu` VALUES ('11', '1', '系统首页', null, 'ESDefault', 'index', null, '1');
INSERT INTO `ess_menu` VALUES ('12', '1', '我的待办', null, 'ESCollaborative', 'index', null, '2');
INSERT INTO `ess_menu` VALUES ('13', '1', '交流园地', null, 'ESDiscuss', 'index', null, '3');
INSERT INTO `ess_menu` VALUES ('21', '2', '参见单位部门', null, 'ESParticipatory', 'index', null, '1');
INSERT INTO `ess_menu` VALUES ('22', '2', '装置单元', null, 'ESDevice', 'index', null, '2');
INSERT INTO `ess_menu` VALUES ('23', '2', '合同工程', null, 'ESContractItem', 'index', null, '3');
INSERT INTO `ess_menu` VALUES ('31', '3', '文件收集范围', null, 'ESDocumentStage', 'index', null, '1');
INSERT INTO `ess_menu` VALUES ('32', '3', '文件类型代码', null, 'ESDocumentType', 'index', null, '2');
INSERT INTO `ess_menu` VALUES ('33', '3', '文件专业代码', null, 'ESEngineering', 'index', null, '3');
INSERT INTO `ess_menu` VALUES ('34', '3', '文件元数据', null, 'ESDocumentsMetadata', 'index', null, '4');
INSERT INTO `ess_menu` VALUES ('35', '3', '文件收集', null, 'ESDocumentsCollection', 'index', null, '5');
INSERT INTO `ess_menu` VALUES ('41', '4', '定制收发流程', null, 'ESSendReceiveFlow', 'index', null, '1');
INSERT INTO `ess_menu` VALUES ('42', '4', '文件发放', null, 'ESDocumentSend', 'index', null, '2');
INSERT INTO `ess_menu` VALUES ('43', '4', '文件接收', null, 'ESDocumentReceive', 'index', null, '3');
INSERT INTO `ess_menu` VALUES ('44', '4', '计划变更清单', null, 'ESChangeOrders', 'index', null, '4');
INSERT INTO `ess_menu` VALUES ('51', '5', '目录检查', null, 'ESCatalogCheck', 'index', null, '1');
INSERT INTO `ess_menu` VALUES ('52', '5', '文件归档', null, 'ESFiling', 'index', null, '2');
INSERT INTO `ess_menu` VALUES ('61', '6', '全文检索', null, 'ESFullTextSearch', 'index', null, '1');
INSERT INTO `ess_menu` VALUES ('62', '6', '文件借阅', null, 'ESDocumentBorrwing', 'index', null, '2');
INSERT INTO `ess_menu` VALUES ('63', '6', '文件统计', null, 'ESStatistics', 'index', null, '3');
INSERT INTO `ess_menu` VALUES ('71', '7', '角色管理', null, 'ESRole', 'index', null, '1');
INSERT INTO `ess_menu` VALUES ('81', '8', '规定规范', null, 'ESRegulations', 'index', null, '1');
INSERT INTO `ess_menu` VALUES ('82', '8', '标准文件', null, 'ESStandardDocuments', 'index', null, '2');
INSERT INTO fyplatformdb.platformservice ( serviceId, serviceName, interfaceName, url, enableState, token, appId, instanceId, reason ) VALUES ( 'esdocument_service', 'role', 'cn.flying.rest.service.IRoleService', 'http://127.0.0.1:8080/essoadocument/rest/role', '1', 'wwwwww', '4', '0', NULL );
INSERT INTO fyplatformdb.platformservice ( serviceId, serviceName, interfaceName, url, enableState, token, appId, instanceId, reason ) VALUES ( 'esdocument_service', 'regulation', 'cn.flying.rest.service.IRegulationService', 'http://127.0.0.1:8080/essoadocument/rest/regulation', '1', 'wwwwww', '4', '0', NULL );
INSERT INTO fyplatformdb.platformservice ( serviceId, serviceName, interfaceName, url, enableState, token, appId, instanceId, reason ) VALUES ( 'esdocument_service', 'standarddocument', 'cn.flying.rest.service.IStandarddocumentService', 'http://127.0.0.1:8080/essoadocument/rest/standarddocument', '1', 'wwwwww', '4', '0', NULL );
INSERT INTO fyplatformdb.platformservice ( serviceId, serviceName, interfaceName, url, enableState, token, appId, instanceId, reason ) VALUES ( 'esdocument_service', 'changeOrders', 'cn.flying.rest.service.IChangeOrdersService', 'http://127.0.0.1:8080/essoadocument/rest/changeOrders', '1', 'wwwwww', '4', '0', NULL );
INSERT INTO fyplatformdb.platformservice ( serviceId, serviceName, interfaceName, url, enableState, token, appId, instanceId, reason ) VALUES ( 'esdocument_service', 'documentBorrowing', 'cn.flying.rest.service.IDocumentBorrowingService', 'http://127.0.0.1:8080/essoadocument/rest/documentBorrowing', '1', 'wwwwww', '4', '0', NULL );
-- ---xiewenda end--------------
-- -----xuekun add isNull column------
alter table ess_document_metadata add column isNull char(1);
-- --电子文件中心相关服务
INSERT INTO fyplatformdb.platformservice ( serviceId, serviceName, interfaceName, url, enableState, token, appId, instanceId, reason ) VALUES ( 'esdocument_service', 'folderservice', 'cn.flying.rest.service.FolderWS', 'http://127.0.0.1:8080/essoadocument/rest/folderservice', '1', 'wwwwww', '3', '0', NULL );
-- --文件收集主表添加附件数字段----
ALTER TABLE ess_document ADD COLUMN Attachments int(5) DEFAULT 0;
-- --收集范围表添加字段
ALTER TABLE ess_document_stage ADD COLUMN iscreateindex int(11) ;
ALTER TABLE ess_document_stage ADD COLUMN id_seq varchar(30) ;

-- -----是否挂接附件标识---xuekun 20141208-------
ALTER TABLE ess_document ADD COLUMN documentFlag char(1);
-- --------xuekun 20141209 添加电子文件中心相关数据表 start-------

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS `ess_document_file`;
CREATE TABLE `ess_document_file` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` int(11) DEFAULT NULL,
  `esfileid` varchar(60) DEFAULT NULL,
  `obligate1` varchar(45) DEFAULT NULL,
  `obligate2` varchar(45) DEFAULT NULL,
  `esstype` varchar(45) DEFAULT NULL,
  `dept` varchar(11) DEFAULT NULL,
  `esfiletype` varchar(8) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;


-- ----------------------------
-- Table structure for `ess_file`
-- ----------------------------
DROP TABLE IF EXISTS `ess_file`;
CREATE TABLE `ess_file` (
  `originalId` varchar(60) NOT NULL DEFAULT '',
  `esmd5` varchar(32) DEFAULT NULL,
  `folderId` int(11) DEFAULT NULL,
  `estitle` varchar(254) DEFAULT NULL,
  `essize` varchar(254) DEFAULT NULL,
  `estype` varchar(20) DEFAULT NULL,
  `pdfId` varchar(45) DEFAULT NULL,
  `swfId` varchar(45) DEFAULT NULL,
  `esfileState` varchar(45) DEFAULT NULL,
  `createTime` bigint(11) DEFAULT NULL,
  `codeFile` varchar(45) DEFAULT NULL,
  `linkTotal` int(8) DEFAULT NULL,
  PRIMARY KEY (`originalId`),
  KEY `AK_ESS_FILE_KEY` (`originalId`),
  KEY `FK_Reference_29` (`folderId`),
  CONSTRAINT `ess_file_ibfk_1` FOREIGN KEY (`folderId`) REFERENCES `ess_folder` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- ----------------------------
-- Table structure for `ess_folder`
-- ----------------------------
DROP TABLE IF EXISTS `ess_folder`;
CREATE TABLE `ess_folder` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `estitle` varchar(254) DEFAULT NULL,
  `espath` varchar(2000) DEFAULT NULL,
  `parentid` int(11) DEFAULT NULL,
  `userid` int(11) DEFAULT '0',
  `hookingNum` int(11) DEFAULT '0',
  `notHookNum` int(11) DEFAULT '0',
  `esViewTitle` varchar(12) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `AK_ESS_FOLDER_KEY` (`id`),
  KEY `FK_Reference_33` (`parentid`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;

-- --------------添加电子文件中心相关数据表 end------------------------

ALTER TABLE ess_document_stage ADD COLUMN isnode char(1) DEFAULT 1;

-- --xiewenda 角色模块表添加start -- --
CREATE TABLE `ess_role` (
  `id` bigint(32) NOT NULL AUTO_INCREMENT COMMENT '逻辑主键',
  `roleId` varchar(100) DEFAULT NULL COMMENT '角色标识',
  `roleName` varchar(100) DEFAULT NULL COMMENT '角色名称',
  `roleRemark` tinytext COMMENT '角色描述',
  `createTime` varchar(32) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(32) DEFAULT NULL COMMENT '修改时间',
  `isSystem` int(1) DEFAULT NULL COMMENT '是否为系统用户',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `ess_menu_auth` (
  `id` bigint(32) NOT NULL AUTO_INCREMENT COMMENT '功能权限唯一标识',
  `role_id` varchar(100) DEFAULT NULL COMMENT '关联角色的id',
  `resource` varchar(800) DEFAULT NULL COMMENT '功能权限的资源',
  `resourceName` varchar(100) DEFAULT NULL COMMENT '资源名称',
  `createTime` varchar(50) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(50) DEFAULT NULL COMMENT '功能权限修改时间',
  `creator` varchar(50) DEFAULT NULL COMMENT '功能权限创造人',
  `mender` varchar(50) DEFAULT NULL COMMENT '功能权限最后修改人',
  `reservend_1` varchar(200) DEFAULT NULL COMMENT '预留字段',
  `reservend_2` varchar(200) DEFAULT NULL,
  `reservend_3` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `ess_tree_auth` (
  `id` bigint(32) NOT NULL AUTO_INCREMENT COMMENT '目录权限资源唯一标识',
  `tree_id` int(32) DEFAULT NULL COMMENT '权限资源的modelID',
  `role_id` bigint(32) DEFAULT NULL COMMENT '角色的唯一标识',
  `nodeType` varchar(1) DEFAULT NULL COMMENT '节点树类型',
  `resourceName` varchar(100) DEFAULT NULL COMMENT '目录权限资源名',
  `operator` varchar(50) DEFAULT NULL COMMENT '权限资源最后操作者',
  `updateTime` varchar(50) DEFAULT NULL COMMENT '目录资源更新时间',
  `item_read` int(1) DEFAULT NULL COMMENT '条目的浏览权限',
  `item_update` int(1) DEFAULT NULL COMMENT '条目的修改权限',
  `item_delete` int(1) DEFAULT NULL COMMENT '条目的删除权限',
  `file_download` int(1) DEFAULT NULL COMMENT '文件的下载权限',
  `file_read` int(1) DEFAULT NULL COMMENT '文件的浏览权限',
  `file_print` int(1) DEFAULT NULL COMMENT '文件的打印权限',
  `reserved_1` varchar(200) DEFAULT NULL COMMENT '预留字段',
  `reserved_2` varchar(200) DEFAULT NULL,
  `reserved_3` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `ess_data_auth` (
  `id` bigint(32) NOT NULL AUTO_INCREMENT COMMENT '数据权限的唯一标识',
  `tree_id` int(32) DEFAULT NULL COMMENT '关联目录权限的树的id',
  `role_id` bigint(32) DEFAULT NULL COMMENT '角色的id',
  `nodeType` varchar(10) DEFAULT NULL COMMENT '所属的树类型',
  `model_id` varchar(10) DEFAULT NULL COMMENT 'modelid',
  `operator` varchar(20) DEFAULT NULL COMMENT '操作人',
  `updateTime` varchar(32) DEFAULT NULL COMMENT '更新时间',
  `dataAuth` varchar(128) DEFAULT NULL COMMENT '存储数据权限',
  `en` varchar(128) DEFAULT '' COMMENT '授权数据的逻辑条件',
  `cn` varchar(128) DEFAULT NULL COMMENT '授权数据的显示条件',
  `ITEM_READ` tinyint(4) DEFAULT NULL COMMENT '目录浏览权限',
  `ITEM_UPDATE` tinyint(4) DEFAULT NULL COMMENT '目录修改权限',
  `ITEM_DELETE` tinyint(4) DEFAULT NULL COMMENT '目录删除权限',
  `FILE_DOWNLOAD` tinyint(4) DEFAULT NULL COMMENT '文件下载权限',
  `FILE_READ` tinyint(4) DEFAULT NULL COMMENT '文件浏览权限',
  `FILE_PRINT` tinyint(4) DEFAULT NULL COMMENT '文件打印权限',
  `RESERVED_1` varchar(200) DEFAULT NULL COMMENT '预留字段',
  `RESERVED_2` varchar(200) DEFAULT NULL,
  `RESERVED_3` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --xiewenda 角色模块表添加end--- --
-- --------xuekun 专业代码和类型代码 添加 设计单位字段------------
ALTER TABLE ess_engineering add COLUMN participatoryId int(11) DEFAULT NULL COMMENT '设计单位id';
ALTER TABLE ess_document_type add COLUMN participatoryId int(11) DEFAULT NULL COMMENT '设计单位id';
-- ----------------文件元数据添加是否加入添加编辑表格字段---------------------
ALTER TABLE ess_document_metadata add COLUMN isEdit char(1) DEFAULT NULL COMMENT '是否加入添加编辑';
-- ----------------添加系统元数据 -----------------------
INSERT INTO `ess_document_metadata` (stageId,name,code,type,length,dotLength,isNull,defaultValue,isSystem,isEdit) VALUES ( null, '收集范围', 'stageCode', 'TEXT', '40', '0', '1', '', '0', '1');
INSERT INTO `ess_document_metadata` (stageId,name,code,type,length,dotLength,isNull,defaultValue,isSystem,isEdit) VALUES ( null, '装置名称', 'deviceCode', 'TEXT', '40', '0', '0', '', '0', '1');
INSERT INTO `ess_document_metadata` (stageId,name,code,type,length,dotLength,isNull,defaultValue,isSystem,isEdit) VALUES ( null, '拟定部门', 'participatoryCode', 'TEXT', '40', '0', '1', '', '0', '1');
INSERT INTO `ess_document_metadata` (stageId,name,code,type,length,dotLength,isNull,defaultValue,isSystem,isEdit) VALUES ( null, '分类编码', 'documentCode', 'TEXT', '40', '0', '1', '', '0', '1');
INSERT INTO `ess_document_metadata` (stageId,name,code,type,length,dotLength,isNull,defaultValue,isSystem,isEdit) VALUES ( null, '专业代码', 'engineeringCode', 'TEXT', '40', '0', '1', '', '0', '1');
INSERT INTO `ess_document_metadata` (stageId,name,code,type,length,dotLength,isNull,defaultValue,isSystem,isEdit) VALUES ( null, '项目名称', 'itemName', 'TEXT', '200', '0', '0', '', '0', '1');
INSERT INTO `ess_document_metadata` (stageId,name,code,type,length,dotLength,isNull,defaultValue,isSystem,isEdit) VALUES ( null, '文件标题', 'title', 'TEXT', '200', '0', '0', '', '0', '1');
INSERT INTO `ess_document_metadata` (stageId,name,code,type,length,dotLength,isNull,defaultValue,isSystem,isEdit) VALUES ( null, '文件编码', 'docNo', 'TEXT', '100', '0', '0', '', '0', '1');
INSERT INTO `ess_document_metadata` (stageId,name,code,type,length,dotLength,isNull,defaultValue,isSystem,isEdit) VALUES ( null, '拟定人', 'person', 'TEXT', '100', '0', '0', '', '0', '1');
INSERT INTO `ess_document_metadata` (stageId,name,code,type,length,dotLength,isNull,defaultValue,isSystem,isEdit) VALUES ( null, '拟定日期', 'date', 'DATE', '10', '0', '0', '', '0', '1');
-- 增加contractitem服务
INSERT INTO fyplatformdb.platformservice ( `serviceId`, `serviceName`, `interfaceName`, `url`, `enableState`, `token`, `appId`, `instanceId`, `reason`) VALUES ( 'esdocument_service', 'contractitem', 'cn.flying.rest.service.IContractItemService', 'http://127.0.0.1:8080/essoadocument/rest/contractitem', '1', 'wwwwww', '3', '0', '');
/**------------添加报表维护数据表--模板-----开始-----------**/
DROP TABLE IF EXISTS `ess_report`;
CREATE TABLE `ess_report` (
  `ID_REPORT` int(11) NOT NULL AUTO_INCREMENT,
  `RESOURCELEVEL` varchar(20) DEFAULT NULL,
  `REPORTSTYLE` varchar(40) DEFAULT NULL,
  `TITLE` varchar(100) DEFAULT NULL,
  `PERPAGE` varchar(20) DEFAULT NULL,
  `REPORTMODEL` text,
  `ISHAVE` varchar(10) DEFAULT NULL,
  `UPLODAER` varchar(20) DEFAULT NULL,
  `REPORTTYPE` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`ID_REPORT`)
) ENGINE=InnoDB AUTO_INCREMENT=146 DEFAULT CHARSET=utf8;
/**-----------------结束----------------------------**/

/**-----------------添加报表维护 rest服务----------------**/
INSERT INTO fyplatformdb.platformservice ( serviceId, serviceName, interfaceName, url, enableState, token, appId, instanceId, reason ) VALUES ( 'esdocument_service', 'reportService', 'cn.flying.rest.service.IReportService', 'http://127.0.0.1:8080/essoadocument/rest/reportService', '1', 'wwwwww', '4', '0', null );
/**-----------------添加文控引用-----------------------**/
INSERT INTO fyplatformdb.platformapp VALUES ('4', 'esdocument', '文控系统', 'wwwww', '文控系统', '不支持');
/**------------------将rest服务置于文控应用下-----------------------------**/
UPDATE fyplatformdb.platformservice set appId=4 where serviceId='esdocument_service'

-- ----------------------------
-- Table structure for ess_filing
-- ----------------------------
DROP TABLE IF EXISTS `ess_filing`;
CREATE TABLE `ess_filing` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `deviceCode` varchar(50) DEFAULT NULL COMMENT '装置代码',
  `volumeId` int(11) DEFAULT NULL COMMENT '案卷代码',
  `documentId` int(11) DEFAULT NULL COMMENT '文件id',
  `creater` varchar(50) DEFAULT NULL COMMENT '添加人',
  `createtime` varchar(20) DEFAULT NULL COMMENT '添加时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='归档表';

-- ----------------------------
-- Table structure for ess_storehouse
-- ----------------------------
DROP TABLE IF EXISTS `ess_storehouse`;
CREATE TABLE `ess_storehouse` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `code` varchar(50) DEFAULT NULL COMMENT '编号',
  `name` varchar(50) DEFAULT NULL COMMENT '名称',
  `shelf` int(11) DEFAULT NULL COMMENT '架',
  `layer` int(11) DEFAULT NULL COMMENT '层',
  `col` int(11) DEFAULT NULL COMMENT '列',
  `manager` varchar(50) DEFAULT NULL COMMENT '管理员',
  `position` varchar(100) DEFAULT NULL COMMENT '位置',
  `area` double DEFAULT NULL COMMENT '面积',
  `mark` char(1) DEFAULT '0' COMMENT '0、不存在文档（默认），1、存在文档',
  `hasStructure` char(1) DEFAULT '0' COMMENT '0、没有结构（默认），1、有结构',
  `description` varchar(200) DEFAULT NULL COMMENT '库房描述',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='库房表';

-- ----------------------------
-- Table structure for ess_storehouse_structure
-- ----------------------------
DROP TABLE IF EXISTS `ess_storehouse_structure`;
CREATE TABLE `ess_storehouse_structure` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `pId` int(11) DEFAULT NULL COMMENT '父级节点id',
  `storehouseId` int(11) DEFAULT NULL COMMENT '库房id',
  `sort` int(11) DEFAULT NULL COMMENT '排序',
  `level` char(1) DEFAULT '0' COMMENT '0、架，1、排，2、列',
  `mark` char(1) DEFAULT '0' COMMENT '0、不存在文档（默认），1、存在文档',
  `name` varchar(255) DEFAULT NULL COMMENT '架、层、列名称',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='库房结构表';

-- ----------------------------
-- Table structure for ess_transferflow
-- ----------------------------
DROP TABLE IF EXISTS `ess_transferflow`;
CREATE TABLE `ess_transferflow` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `type_id` int(11) DEFAULT NULL COMMENT '类型id',
  `name` varchar(50) DEFAULT NULL COMMENT '名称',
  `version` varchar(50) DEFAULT NULL COMMENT '版本',
  `status` varchar(20) DEFAULT NULL COMMENT '状态',
  `creater` varchar(50) DEFAULT NULL COMMENT '创建人id',
  `modifyer` varchar(50) DEFAULT NULL COMMENT '修改人id',
  `createtime` varchar(20) DEFAULT NULL COMMENT '创建时间',
  `modifytime` varchar(20) DEFAULT NULL COMMENT '修改时间',
  `describtion` varchar(256) DEFAULT NULL COMMENT '描述',
  `form_relation` varchar(255) DEFAULT NULL COMMENT '关联表单',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for ess_transferflow_type
-- ----------------------------
DROP TABLE IF EXISTS `ess_transferflow_type`;
CREATE TABLE `ess_transferflow_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `pId` int(11) DEFAULT NULL COMMENT '父级节点id',
  `name` varchar(50) DEFAULT NULL COMMENT '名称',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ---------------添加rest服务----------------
INSERT INTO fyplatformdb.platformservice ( serviceId, serviceName, interfaceName, url, enableState, token, appId, instanceId, reason ) VALUES ('esdocument_service', 'filing', 'cn.flying.rest.service.IFilingService', 'http://127.0.0.1:8080/essoadocument/rest/filing', '1', 'wwwwww', '4', '0', null);
INSERT INTO fyplatformdb.platformservice ( serviceId, serviceName, interfaceName, url, enableState, token, appId, instanceId, reason ) VALUES ('esdocument_service', 'storehouse3D', 'cn.flying.rest.service.IStorehouse3DService', 'http://127.0.0.1:8080/essoadocument/rest/storehouse3D', '1', 'wwwwww', '4', '0', null);
INSERT INTO fyplatformdb.platformservice ( serviceId, serviceName, interfaceName, url, enableState, token, appId, instanceId, reason ) VALUES ('esdocument_service', 'transferFlow', 'cn.flying.rest.service.ITransferFlowService', 'http://127.0.0.1:8080/essoadocument/rest/transferFlow', '1', 'wwwwww', '4', '0', null);
-- --添加电子文件中心和报表维护-----
update ess_menu set name='系统维护' where id=8;
INSERT INTO `ess_menu` VALUES ('83', '8', '电子文件中心', null, 'ESEFile', 'index', null, '3');
INSERT INTO `ess_menu` VALUES ('84', '8', '报表维护', null, 'ESReport', 'index', null, '4');
-- -----------添加报表维护相关数据表-----------------
DROP TABLE IF EXISTS `ess_report`;
CREATE TABLE `ess_report` (
  `ID_REPORT` int(11) NOT NULL AUTO_INCREMENT,
  `RESOURCELEVEL` varchar(20) DEFAULT NULL,
  `REPORTSTYLE` varchar(40) DEFAULT NULL,
  `TITLE` varchar(100) DEFAULT NULL,
  `PERPAGE` varchar(20) DEFAULT NULL,
  `REPORTMODEL` text,
  `ISHAVE` varchar(10) DEFAULT NULL,
  `UPLODAER` varchar(20) DEFAULT NULL,
  `REPORTTYPE` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`ID_REPORT`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of ess_report
-- ----------------------------
INSERT INTO `ess_report` VALUES ('1', null, 'pdf', '文件收集', null, '<?xml version=\"1.0\" encoding=\"UTF-8\"  ?>\r\n<!-- Created with iReport - A designer for JasperReports -->\r\n<!DOCTYPE jasperReport PUBLIC \"//JasperReports//DTD Report Design//EN\" \"http://jasperreports.sourceforge.net/dtds/jasperreport.dtd\">\r\n<jasperReport\r\n		 name=\"文件目录\"\r\n		 columnCount=\"1\"\r\n		 printOrder=\"Vertical\"\r\n		 orientation=\"Portrait\"\r\n		 pageWidth=\"635\"\r\n		 pageHeight=\"842\"\r\n		 columnWidth=\"575\"\r\n		 columnSpacing=\"0\"\r\n		 leftMargin=\"30\"\r\n		 rightMargin=\"30\"\r\n		 topMargin=\"20\"\r\n		 bottomMargin=\"20\"\r\n		 whenNoDataType=\"NoPages\"\r\n		 isTitleNewPage=\"false\"\r\n		 isSummaryNewPage=\"false\">\r\n	<property name=\"ireport.scriptlethandling\" value=\"0\" />\r\n	<property name=\"ireport.encoding\" value=\"UTF-8\" />\r\n	<import value=\"java.util.*\" />\r\n	<import value=\"net.sf.jasperreports.engine.*\" />\r\n	<import value=\"net.sf.jasperreports.engine.data.*\" />\r\n\r\n	<queryString language=\"xPath\"><![CDATA[/data/descendant::Package/Description]]></queryString>\r\n\r\n	<field name=\"收集范围\" class=\"java.lang.String\">\r\n		<fieldDescription><![CDATA[收集范围]]></fieldDescription>\r\n	</field>\r\n	<field name=\"装置名称\" class=\"java.lang.String\">\r\n		<fieldDescription><![CDATA[装置名称]]></fieldDescription>\r\n	</field>\r\n	<field name=\"拟定部门\" class=\"java.lang.String\">\r\n		<fieldDescription><![CDATA[拟定部门]]></fieldDescription>\r\n	</field>\r\n	<field name=\"分类编码\" class=\"java.lang.String\">\r\n		<fieldDescription><![CDATA[分类编码]]></fieldDescription>\r\n	</field>\r\n	<field name=\"专业代码\" class=\"java.lang.String\">\r\n		<fieldDescription><![CDATA[专业代码]]></fieldDescription>\r\n	</field>\r\n	<field name=\"项目名称\" class=\"java.lang.String\">\r\n		<fieldDescription><![CDATA[项目名称]]></fieldDescription>\r\n	</field>\r\n	<field name=\"页数\" class=\"java.lang.String\">\r\n		<fieldDescription><![CDATA[页数]]></fieldDescription>\r\n	</field>\r\n	<field name=\"rows\" class=\"java.lang.String\">\r\n		<fieldDescription><![CDATA[15]]></fieldDescription>\r\n	</field>\r\n	<field name=\"文件标题\" class=\"java.lang.String\">\r\n		<fieldDescription><![CDATA[文件标题]]></fieldDescription>\r\n	</field>\r\n	<field name=\"文件编码\" class=\"java.lang.String\">\r\n		<fieldDescription><![CDATA[文件编码]]></fieldDescription>\r\n	</field>\r\n	<field name=\"拟定人\" class=\"java.lang.String\">\r\n		<fieldDescription><![CDATA[拟定人]]></fieldDescription>\r\n	</field>\r\n	<field name=\"拟定日期\" class=\"java.lang.String\">\r\n		<fieldDescription><![CDATA[拟定日期]]></fieldDescription>\r\n	</field>\r\n	<field name=\"挂接数\" class=\"java.lang.String\">\r\n		<fieldDescription><![CDATA[挂接数]]></fieldDescription>\r\n	</field>\r\n\r\n		<background>\r\n			<band height=\"0\"  isSplitAllowed=\"true\" >\r\n			</band>\r\n		</background>\r\n		<title>\r\n			<band height=\"0\"  isSplitAllowed=\"true\" >\r\n			</band>\r\n		</title>\r\n		<pageHeader>\r\n			<band height=\"70\"  isSplitAllowed=\"true\" >\r\n				<staticText>\r\n					<reportElement\n						x=\"183\"\n						y=\"19\"\n						width=\"196\"\n						height=\"32\"\n						key=\"staticText-1\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"18\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<text><![CDATA[文 件 收 集 数据]]></text>\r\n				</staticText>\r\n			</band>\r\n		</pageHeader>\r\n		<columnHeader>\r\n			<band height=\"45\"  isSplitAllowed=\"true\" >\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"0\"\n						y=\"0\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-1\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"BottomUp\">\r\n					<reportElement\n						x=\"0\"\n						y=\"0\"\n						width=\"575\"\n						height=\"0\"\n						key=\"line-2\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"BottomUp\">\r\n					<reportElement\n						x=\"0\"\n						y=\"44\"\n						width=\"575\"\n						height=\"0\"\n						key=\"line-3\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"41\"\n						y=\"0\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-4\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"99\"\n						y=\"0\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-5\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"268\"\n						y=\"0\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-6\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"324\"\n						y=\"0\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-7\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"496\"\n						y=\"0\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-8\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"534\"\n						y=\"0\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-9\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<staticText>\r\n					<reportElement\n						x=\"1\"\n						y=\"1\"\n						width=\"40\"\n						height=\"43\"\n						key=\"staticText-3\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"11\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<text><![CDATA[项目名称]]></text>\r\n				</staticText>\r\n				<staticText>\r\n					<reportElement\n						x=\"42\"\n						y=\"1\"\n						width=\"57\"\n						height=\"43\"\n						key=\"staticText-4\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"11\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<text><![CDATA[文件标题]]></text>\r\n				</staticText>\r\n				<staticText>\r\n					<reportElement\n						x=\"100\"\n						y=\"1\"\n						width=\"168\"\n						height=\"43\"\n						key=\"staticText-5\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"11\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<text><![CDATA[分类编码]]></text>\r\n				</staticText>\r\n				<staticText>\r\n					<reportElement\n						x=\"269\"\n						y=\"1\"\n						width=\"55\"\n						height=\"43\"\n						key=\"staticText-6\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"11\" isItalic=\"false\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<text><![CDATA[拟定部门]]></text>\r\n				</staticText>\r\n				<staticText>\r\n					<reportElement\n						x=\"325\"\n						y=\"1\"\n						width=\"28\"\n						height=\"43\"\n						key=\"staticText-7\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"11\" isItalic=\"false\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<text><![CDATA[页数]]></text>\r\n				</staticText>\r\n				<staticText>\r\n					<reportElement\n						x=\"497\"\n						y=\"1\"\n						width=\"37\"\n						height=\"43\"\n						key=\"staticText-8\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"11\" isItalic=\"false\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<text><![CDATA[收集范围]]></text>\r\n				</staticText>\r\n				<staticText>\r\n					<reportElement\n						x=\"353\"\n						y=\"1\"\n						width=\"56\"\n						height=\"43\"\n						key=\"staticText-9\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"11\" isItalic=\"false\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<text><![CDATA[文件编码]]></text>\r\n				</staticText>\r\n				<staticText>\r\n					<reportElement\n						x=\"409\"\n						y=\"1\"\n						width=\"49\"\n						height=\"43\"\n						key=\"staticText-10\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"11\" isItalic=\"false\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<text><![CDATA[拟定日期]]></text>\r\n				</staticText>\r\n				<staticText>\r\n					<reportElement\n						x=\"459\"\n						y=\"1\"\n						width=\"37\"\n						height=\"43\"\n						key=\"staticText-11\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"11\" isItalic=\"false\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<text><![CDATA[拟定人]]></text>\r\n				</staticText>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"353\"\n						y=\"0\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-18\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"408\"\n						y=\"0\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-19\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"458\"\n						y=\"0\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-20\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"574\"\n						y=\"0\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-24\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<staticText>\r\n					<reportElement\n						x=\"535\"\n						y=\"1\"\n						width=\"39\"\n						height=\"43\"\n						key=\"staticText-12\"\n						isRemoveLineWhenBlank=\"true\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<text><![CDATA[挂接数]]></text>\r\n				</staticText>\r\n			</band>\r\n		</columnHeader>\r\n		<detail>\r\n			<band height=\"45\"  isSplitAllowed=\"true\" >\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"0\"\n						y=\"-1\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-10\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"BottomUp\">\r\n					<reportElement\n						x=\"0\"\n						y=\"44\"\n						width=\"575\"\n						height=\"0\"\n						key=\"line-11\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"41\"\n						y=\"-1\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-12\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"99\"\n						y=\"-1\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-13\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"268\"\n						y=\"0\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-14\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"324\"\n						y=\"-1\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-15\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"496\"\n						y=\"-1\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-16\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"534\"\n						y=\"-1\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-17\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<textField isStretchWithOverflow=\"false\" isBlankWhenNull=\"true\" evaluationTime=\"Now\" hyperlinkType=\"None\"  hyperlinkTarget=\"Self\" >\r\n					<reportElement\n						x=\"497\"\n						y=\"0\"\n						width=\"37\"\n						height=\"44\"\n						key=\"textField\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"10\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<textFieldExpression   class=\"java.lang.String\"><![CDATA[$F{项目名称}]]></textFieldExpression>\r\n				</textField>\r\n				<textField isStretchWithOverflow=\"false\" isBlankWhenNull=\"true\" evaluationTime=\"Now\" hyperlinkType=\"None\"  hyperlinkTarget=\"Self\" >\r\n					<reportElement\n						x=\"325\"\n						y=\"0\"\n						width=\"28\"\n						height=\"44\"\n						key=\"textField\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"10\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<textFieldExpression   class=\"java.lang.String\"><![CDATA[$F{页数}]]></textFieldExpression>\r\n				</textField>\r\n				<textField isStretchWithOverflow=\"false\" isBlankWhenNull=\"true\" evaluationTime=\"Now\" hyperlinkType=\"None\"  hyperlinkTarget=\"Self\" >\r\n					<reportElement\n						x=\"269\"\n						y=\"0\"\n						width=\"55\"\n						height=\"44\"\n						key=\"textField\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"10\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<textFieldExpression   class=\"java.lang.String\"><![CDATA[$F{拟定部门}]]></textFieldExpression>\r\n				</textField>\r\n				<textField isStretchWithOverflow=\"false\" isBlankWhenNull=\"true\" evaluationTime=\"Now\" hyperlinkType=\"None\"  hyperlinkTarget=\"Self\" >\r\n					<reportElement\n						x=\"100\"\n						y=\"0\"\n						width=\"168\"\n						height=\"44\"\n						key=\"textField\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"10\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<textFieldExpression   class=\"java.lang.String\"><![CDATA[$F{分类编码}]]></textFieldExpression>\r\n				</textField>\r\n				<textField isStretchWithOverflow=\"false\" isBlankWhenNull=\"true\" evaluationTime=\"Now\" hyperlinkType=\"None\"  hyperlinkTarget=\"Self\" >\r\n					<reportElement\n						x=\"42\"\n						y=\"0\"\n						width=\"57\"\n						height=\"44\"\n						key=\"textField\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"10\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<textFieldExpression   class=\"java.lang.String\"><![CDATA[$F{文件标题}]]></textFieldExpression>\r\n				</textField>\r\n				<textField isStretchWithOverflow=\"false\" isBlankWhenNull=\"true\" evaluationTime=\"Now\" hyperlinkType=\"None\"  hyperlinkTarget=\"Self\" >\r\n					<reportElement\n						x=\"1\"\n						y=\"0\"\n						width=\"40\"\n						height=\"44\"\n						key=\"textField\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"10\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<textFieldExpression   class=\"java.lang.String\"><![CDATA[$F{项目名称}]]></textFieldExpression>\r\n				</textField>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"353\"\n						y=\"0\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-21\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"408\"\n						y=\"0\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-22\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"458\"\n						y=\"0\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-23\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<textField isStretchWithOverflow=\"false\" isBlankWhenNull=\"true\" evaluationTime=\"Now\" hyperlinkType=\"None\"  hyperlinkTarget=\"Self\" >\r\n					<reportElement\n						x=\"354\"\n						y=\"0\"\n						width=\"54\"\n						height=\"44\"\n						key=\"textField-1\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"10\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<textFieldExpression   class=\"java.lang.String\"><![CDATA[$F{文件编码}]]></textFieldExpression>\r\n				</textField>\r\n				<textField isStretchWithOverflow=\"false\" isBlankWhenNull=\"true\" evaluationTime=\"Now\" hyperlinkType=\"None\"  hyperlinkTarget=\"Self\" >\r\n					<reportElement\n						x=\"409\"\n						y=\"0\"\n						width=\"49\"\n						height=\"44\"\n						key=\"textField-2\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"10\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<textFieldExpression   class=\"java.lang.String\"><![CDATA[$F{拟定日期}]]></textFieldExpression>\r\n				</textField>\r\n				<textField isStretchWithOverflow=\"false\" isBlankWhenNull=\"true\" evaluationTime=\"Now\" hyperlinkType=\"None\"  hyperlinkTarget=\"Self\" >\r\n					<reportElement\n						x=\"459\"\n						y=\"0\"\n						width=\"37\"\n						height=\"44\"\n						key=\"textField-3\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font fontName=\"宋体\" pdfFontName=\"STSong-Light\" size=\"10\" isPdfEmbedded =\"true\" pdfEncoding =\"UniGB-UCS2-H\"/>\r\n					</textElement>\r\n				<textFieldExpression   class=\"java.lang.String\"><![CDATA[$F{拟定人}]]></textFieldExpression>\r\n				</textField>\r\n				<line direction=\"TopDown\">\r\n					<reportElement\n						x=\"574\"\n						y=\"0\"\n						width=\"0\"\n						height=\"45\"\n						key=\"line-25\"/>\r\n					<graphicElement stretchType=\"NoStretch\"/>\r\n				</line>\r\n				<textField isStretchWithOverflow=\"false\" isBlankWhenNull=\"true\" evaluationTime=\"Now\" hyperlinkType=\"None\"  hyperlinkTarget=\"Self\" >\r\n					<reportElement\n						x=\"535\"\n						y=\"0\"\n						width=\"39\"\n						height=\"44\"\n						key=\"textField-4\"/>\r\n					<box topBorder=\"None\" topBorderColor=\"#000000\" leftBorder=\"None\" leftBorderColor=\"#000000\" rightBorder=\"None\" rightBorderColor=\"#000000\" bottomBorder=\"None\" bottomBorderColor=\"#000000\"/>\r\n					<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\r\n						<font/>\r\n					</textElement>\r\n				<textFieldExpression   class=\"java.lang.String\"><![CDATA[$F{挂接数}]]></textFieldExpression>\r\n				</textField>\r\n			</band>\r\n		</detail>\r\n		<columnFooter>\r\n			<band height=\"0\"  isSplitAllowed=\"true\" >\r\n			</band>\r\n		</columnFooter>\r\n		<pageFooter>\r\n			<band height=\"0\"  isSplitAllowed=\"true\" >\r\n			</band>\r\n		</pageFooter>\r\n		<summary>\r\n			<band height=\"0\"  isSplitAllowed=\"true\" >\r\n			</band>\r\n		</summary>\r\n</jasperReport>\r\n', null, 'admin', null);

-- ----------------------------
-- Table structure for `ess_reportinfomation`
-- ----------------------------
DROP TABLE IF EXISTS `ess_reportinfomation`;
CREATE TABLE `ess_reportinfomation` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `id_foreign` int(11) NOT NULL DEFAULT '0' COMMENT '做外键用',
  `userId` varchar(50) NOT NULL COMMENT '用户id',
  `userName` varchar(50) DEFAULT NULL COMMENT '用户中文名',
  `creat_date` varchar(50) DEFAULT NULL COMMENT '生成时间',
  `infoType` varchar(50) DEFAULT NULL COMMENT '消息类型',
  `infoName` varchar(50) DEFAULT NULL COMMENT '消息名称',
  `printStatus` varchar(50) DEFAULT NULL COMMENT '打印状态',
  `downloadStatus` varchar(50) DEFAULT NULL COMMENT '下载状态',
  `address` text COMMENT '下载地址',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8;

-- --用户角色关联关系表----------
CREATE TABLE `ess_user_role` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `userId` int(10) DEFAULT NULL,
  `roleId` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- --------档案元数据添加和档案元数据的对应------------
 alter table ess_document_metadata add column metaDataId int(11) DEFAULT NULL COMMENT '档案系统元数据Id';
 alter table ess_document_metadata add column esidentifier varchar(100) DEFAULT NULL COMMENT '档案系统元数据';
 
 -- ---借阅权限表----------
 CREATE TABLE `ess_using_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(10) DEFAULT NULL COMMENT '关联用户的id',
  `roleId` int(10) DEFAULT NULL COMMENT '关联角色的id',
  `lendDays` int(10) DEFAULT NULL COMMENT '借阅的天数',
  `lendCount` int(10) DEFAULT NULL COMMENT '可借阅的数量',
  `relendTimes` varchar(32) DEFAULT NULL COMMENT '归还的时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --续借权限表------------
CREATE TABLE `ess_using_role_relend_count` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(10) DEFAULT NULL COMMENT '关联用户id',
  `roleId` int(10) DEFAULT NULL COMMENT '关联角色id',
  `relendCount` varchar(10) NOT NULL COMMENT '续借的次数',
  `relendDays` int(10) NOT NULL COMMENT '续借的天数',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- Table structure for `ess_rule_docno`
-- ----------存储文件编码规则数据表------------------
DROP TABLE IF EXISTS `ess_rule_docno`;
CREATE TABLE `ess_rule_docno` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stageId` int(11) NOT NULL,
  `tagids` varchar(512) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
 
-- ------------文件流程管理 ---------------------
-- ----------------------------
-- Table structure for ess_formbuildercombo
-- ----------------------------
DROP TABLE IF EXISTS `ess_formbuildercombo`;
CREATE TABLE `ess_formbuildercombo` (
  `id_combo` int(11) NOT NULL AUTO_INCREMENT,
  `identifier` varchar(50) DEFAULT NULL,
  `combovalue` varchar(50) DEFAULT NULL,
  `estype` varchar(50) DEFAULT NULL,
  `dataurl` varchar(100) DEFAULT NULL,
  `description` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_combo`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for ess_formbuildercombovalues
-- ----------------------------
DROP TABLE IF EXISTS `ess_formbuildercombovalues`;
CREATE TABLE `ess_formbuildercombovalues` (
  `id_value` int(11) NOT NULL AUTO_INCREMENT,
  `propertyvalue` varchar(50) DEFAULT NULL,
  `textvalue` varchar(50) DEFAULT NULL,
  `id_combo` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_value`),
  KEY `COMBO_FK` (`id_combo`),
  CONSTRAINT `ess_formbuildercombovalues_ibfk_1` FOREIGN KEY (`id_combo`) REFERENCES `es_os_formbuildercombo` (`id_combo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for ess_transferaction
-- ----------------------------
DROP TABLE IF EXISTS `ess_transferaction`;
CREATE TABLE `ess_transferaction` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `step_id` int(10) DEFAULT NULL COMMENT '步骤id',
  `name` varchar(128) DEFAULT NULL COMMENT '名称',
  `condition` varchar(1024) DEFAULT NULL COMMENT '条件',
  `frefunction` varchar(256) DEFAULT NULL,
  `postfunction` varchar(256) DEFAULT NULL,
  `flow_id` int(10) DEFAULT NULL COMMENT '流程id',
  `action_id` int(10) DEFAULT NULL COMMENT '动作id',
  `is_email` int(2) DEFAULT NULL COMMENT '是否发送邮件(0、不发，1、发送)',
  `is_message` int(2) DEFAULT NULL COMMENT '是否发送消息(0、不发，1、发送)',
  `action_message` varchar(256) DEFAULT NULL COMMENT '动作消息',
  `notice_users` varchar(1024) DEFAULT NULL COMMENT '知会人',
  `notice_roles` varchar(1024) DEFAULT NULL COMMENT '知会角色',
  `is_notice_caller` int(2) DEFAULT NULL COMMENT '是否通知流程发起人(0、不通知，1、通知)',
  `is_validate_form` int(2) DEFAULT NULL COMMENT '是否验证表单(0、否，1、是)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='流程动作表';

-- ----------------------------
-- Table structure for ess_transferflow
-- ----------------------------
DROP TABLE IF EXISTS `ess_transferflow`;
CREATE TABLE `ess_transferflow` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `type_id` int(11) DEFAULT NULL COMMENT '类型id',
  `name` varchar(50) DEFAULT NULL COMMENT '名称',
  `version` varchar(50) DEFAULT NULL COMMENT '版本',
  `status` int(1) DEFAULT NULL COMMENT '状态',
  `form_relation` varchar(400) DEFAULT NULL COMMENT '关联表单',
  `business_relation` varchar(20) DEFAULT NULL COMMENT '关联业务',
  `creater` varchar(50) DEFAULT NULL COMMENT '创建人id',
  `modifyer` varchar(50) DEFAULT NULL COMMENT '修改人id',
  `createtime` varchar(20) DEFAULT NULL COMMENT '创建时间',
  `modifytime` varchar(20) DEFAULT NULL COMMENT '修改时间',
  `describtion` varchar(256) DEFAULT NULL COMMENT '描述',
  `graphXml` text COMMENT '模型xml',
  `flowGraph` text,
  `relation_table` varchar(255) DEFAULT NULL,
  `first_step_users` varchar(255) DEFAULT NULL,
  `first_step_roles` varchar(255) DEFAULT NULL,
  `first_step_id` int(11) DEFAULT NULL,
  `identifier` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='工作流程表';

-- ----------------------------
-- Table structure for ess_transferflow_type
-- ----------------------------
DROP TABLE IF EXISTS `ess_transferflow_type`;
CREATE TABLE `ess_transferflow_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `pId` int(11) DEFAULT NULL COMMENT '父级节点id',
  `name` varchar(50) DEFAULT NULL COMMENT '名称',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='工作流程类型表';

-- ----------------------------
-- Table structure for ess_transferform
-- ----------------------------
DROP TABLE IF EXISTS `ess_transferform`;
CREATE TABLE `ess_transferform` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `status` int(11) DEFAULT NULL COMMENT '状态-0、未发布，1-发布成功',
  `form_js` text,
  `name` varchar(256) DEFAULT NULL COMMENT '名称',
  `form_id` varchar(256) DEFAULT NULL COMMENT '表单id',
  `flow_id` varchar(256) DEFAULT NULL COMMENT '流程id',
  `is_create_table` int(11) DEFAULT NULL COMMENT '是否生成表',
  `form_type_id` int(11) DEFAULT NULL COMMENT '表单类型id',
  `creater` varchar(20) DEFAULT NULL COMMENT '添加者id',
  `createtime` varchar(20) DEFAULT NULL COMMENT '添加时间',
  `modifyer` varchar(20) DEFAULT NULL COMMENT '修改人id',
  `modifytime` varchar(20) DEFAULT NULL COMMENT '修改时间',
  `version` int(10) DEFAULT NULL COMMENT '版本',
  `form_js_html` text,
  `show_type` char(1) DEFAULT NULL COMMENT '显示类型',
  `form_js_html_usingsystem` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='表单表';

-- ----------------------------
-- Table structure for ess_transferform_user
-- ----------------------------
DROP TABLE IF EXISTS `ess_transferform_user`;
CREATE TABLE `ess_transferform_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `user_id` int(11) DEFAULT NULL COMMENT '用户id',
  `form_id` varchar(11) DEFAULT NULL COMMENT '表单id',
  `wf_id` decimal(10,0) DEFAULT NULL,
  `title` varchar(512) DEFAULT NULL COMMENT '标题',
  `start_time` varchar(20) DEFAULT NULL COMMENT '开始时间',
  `end_time` varchar(20) DEFAULT NULL COMMENT '结束时间',
  `wf_status` varchar(100) DEFAULT NULL COMMENT '状态（null、待发，not null、已发）',
  `part_id` decimal(10,0) DEFAULT NULL COMMENT '单位部门id',
  `tree_year` varchar(4) DEFAULT NULL,
  `tree_month` varchar(2) DEFAULT NULL,
  `dataId` decimal(8,0) DEFAULT NULL,
  `user_formno` varchar(20) DEFAULT NULL,
  `statistic_status` varchar(4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_Reference_41` (`form_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for ess_transferfunctions
-- ----------------------------
DROP TABLE IF EXISTS `ess_transferfunctions`;
CREATE TABLE `ess_transferfunctions` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `functionName` varchar(100) DEFAULT NULL COMMENT '函数名称',
  `restFullClassName` varchar(500) DEFAULT NULL COMMENT '服务名称',
  `exeFunction` varchar(500) DEFAULT NULL COMMENT '方法名称',
  `description` varchar(1000) DEFAULT NULL COMMENT '描述',
  `relationBusiness` varchar(100) DEFAULT NULL COMMENT '关联业务',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='流程函数表';

-- ----------------------------
-- Table structure for ess_transferfunctions_param
-- ----------------------------
DROP TABLE IF EXISTS `ess_transferfunctions_param`;
CREATE TABLE `ess_transferfunctions_param` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `function_id` int(11) DEFAULT NULL COMMENT '函数id',
  `action_id` int(11) DEFAULT NULL COMMENT '动作id',
  `flow_id` int(11) DEFAULT NULL COMMENT '流程id',
  `parameter` varchar(255) DEFAULT NULL COMMENT '参数',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='函数参数表';

-- ----------------------------
-- Table structure for ess_transferstep
-- ----------------------------
DROP TABLE IF EXISTS `ess_transferstep`;
CREATE TABLE `ess_transferstep` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `flow_id` int(10) DEFAULT NULL COMMENT '流程id',
  `name` varchar(128) DEFAULT NULL COMMENT '步骤名称',
  `step_id` int(10) DEFAULT NULL COMMENT '步骤id',
  `step_child_id` int(10) DEFAULT NULL COMMENT '下一步骤id',
  `step_parent_id` int(10) DEFAULT NULL COMMENT '上一步骤id',
  `next_step_roles` varchar(50) DEFAULT NULL COMMENT '下一步骤角色',
  `next_step_users` varchar(256) DEFAULT NULL COMMENT '下一步骤用户',
  `edit_field` varchar(4000) DEFAULT NULL COMMENT '编辑字段',
  `is_relationpart` int(2) DEFAULT NULL COMMENT '是否联系部门',
  `is_countersign` int(2) DEFAULT NULL,
  `is_relationcaller` int(2) DEFAULT NULL COMMENT '是否联系发起人',
  `edit_field_print` varchar(4000) DEFAULT NULL COMMENT '编辑字段打印',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 文件流程菜单添加 ---
INSERT INTO `ess_menu` VALUES (36, 3, '定制文件流转流程', NULL, 'ESTransferFlow', 'index', NULL, 6);

-- xiewenda 信息发布管理模块表-----------------
CREATE TABLE `ess_publish_board` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(125) NOT NULL,
  `createTime` datetime DEFAULT NULL,
  `tableMark` varchar(20) DEFAULT NULL,
  `boardType` int(2) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;
INSERT INTO `ess_publish_board` VALUES ('1', '文控新闻', '2015-01-20 17:46:30', '0', '1');
INSERT INTO `ess_publish_board` VALUES ('2', '文控公告', '2015-01-20 17:46:59', '0', '1');
INSERT INTO `ess_publish_board` VALUES ('3', '文控其他', '2015-01-20 17:47:22', '0', '0');

CREATE TABLE `ess_publish_text` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `topicId` int(11) NOT NULL,
  `summary` varchar(512) DEFAULT NULL,
  `text` longtext,
  `orderNum` int(11) DEFAULT '0',
  `updateTime` varchar(34) DEFAULT NULL,
  `browseTimes` bigint(20) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_topicId` (`topicId`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `ess_publish_topic` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `boardId` int(11) NOT NULL,
  `title` varchar(256) DEFAULT NULL,
  `authorId` varchar(50) DEFAULT NULL,
  `authorName` varchar(100) DEFAULT NULL,
  `status` int(2) DEFAULT '0',
  `createTime` varchar(34) DEFAULT NULL,
  `workflowId` varchar(125) DEFAULT NULL,
  `province` varchar(20) DEFAULT NULL,
  `dept` varchar(45) DEFAULT NULL,
  `browseTimes` bigint(20) DEFAULT '0',
  `replyTimes` bigint(20) DEFAULT '0',
  `publicStatus` int(2) DEFAULT '0',
  `commentStatus` int(2) DEFAULT '0',
  `approvalStatus` int(2) DEFAULT NULL,
  `topicImageId` varchar(256) DEFAULT NULL,
  `appStatus` int(2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_boardId` (`boardId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `ess_menu` VALUES (85, 8, '信息发布管理', NULL, 'ESInformationPublish', 'index', NULL, 5);
INSERT INTO fyplatformdb.platformservice ( serviceId, serviceName, interfaceName, url, enableState, token, appId, instanceId, reason ) VALUES ('esdocument_service', 'informationPublish', 'cn.flying.rest.service.IInformationPublish', 'http://127.0.0.1:8080/essoadocument/rest/informationPublish', '1', 'wwwwww', '4', '0', null);

-- 20150123 gengqianfeng 修改文件流程表字段 --------------
ALTER TABLE ess_transferflow MODIFY form_relation VARCHAR(20) DEFAULT NULL COMMENT '表单id（form+收集范围id组成）';
-- 文件附件中添加版本字段
ALTER TABLE ess_file add column fileVersion int(8) DEFAULT NULL  COMMENT '文件版本'; 
-- ----- 添加未来组卷方式字段----xuekun 20150128----
ALTER TABLE ess_document_stage add column paperWay char(1) DEFAULT NULL  COMMENT '未来组卷方式1 ：按单项工程组卷，2：整体项目组卷'; 

-- 20150128 gengqianfeng 修改流程表单表 -----------
ALTER TABLE ess_transferform MODIFY column flow_id VARCHAR(256) DEFAULT NULL  COMMENT '流程id（多个以英文逗号分割）'; 
-- 20150129 gengqianfeng 修改流程表单表 -----------
ALTER TABLE ess_filing change  volumeId stageId INT(11);
DROP TABLE IF EXISTS `ess_regulations`;
DROP TABLE IF EXISTS `ess_volume`;
DROP TABLE IF EXISTS `ess_stage_regulations`;
-- 文件借阅单----------------------------
-- Table structure for ess_borrowing_form
-- ----------------------------
DROP TABLE IF EXISTS `ess_borrowing_form`;
CREATE TABLE `ess_borrowing_form` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `borrowNum` varchar(20) NOT NULL,
  `borrowPerson` varchar(20) NOT NULL,
  `regDate` varchar(50) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `telphone` varchar(11) DEFAULT NULL,
  `email` varchar(20) DEFAULT NULL,
  `overdueDays` varchar(10) DEFAULT NULL,
  `regPerson` varchar(20) DEFAULT NULL,
  `status` varchar(10) DEFAULT NULL,
  `idcardnum` varchar(20) DEFAULT NULL,
  `pnum` int(10) DEFAULT NULL,
  `remark` varchar(40) DEFAULT NULL,
  `uid` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;

-- 文件利用单----------------------------
-- Table structure for ess_borrrowing_detail
-- ----------------------------
DROP TABLE IF EXISTS `ess_borrrowing_detail`;
CREATE TABLE `ess_borrrowing_detail` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `documentCode` varchar(20) NOT NULL,
  `borrowtype` varchar(10) DEFAULT NULL,
  `status` varchar(10) DEFAULT NULL,
  `happen_date` varchar(60) DEFAULT NULL,
  `shouldreturndate` varchar(60) DEFAULT NULL,
  `return_date` varchar(60) DEFAULT NULL,
  `pnum` int(10) DEFAULT NULL,
  `borrowNum` varchar(20) DEFAULT NULL,
  `remark` varchar(40) DEFAULT NULL,
  `relendcount` varchar(10) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;

-- 20150129 gengqianfeng 修改流程表单表 -----------
ALTER TABLE `ess_document` add column `filingFlag` char(1) DEFAULT '0'  COMMENT '0、未归档（默认），1、已归档'; 
ALTER TABLE `ess_document` add column `filingDirect` varchar(50) DEFAULT NULL  COMMENT '归档目录'; 

-- log服务---
INSERT INTO fyplatformdb.platformservice (serviceId,serviceName,interfaceName,url,enableState,token,appId,instanceId,reason ) VALUES ('esdocument_service', 'documentlog', 'cn.flying.rest.service.ILogService', 'http://127.0.0.1:8080/essoadocument/rest/documentlog', '1', 'wwwwww', '4', '0', NULL );

-- 20150202 gengqianfeng 修改流程函数表 -----------
ALTER TABLE ess_transferfunctions add column stageId VARCHAR(100) DEFAULT NULL  COMMENT '收集范围id'; 

-- 20150202 xiewenda role角色管理  系统角色添加---
INSERT INTO `ess_role` VALUES ('1', 'admin', '管理员', '超级管理员', '2014-11-10', '2014-12-03 11:10:13', '1');
INSERT INTO `ess_role` VALUES ('2', 'wenkong', '文控管理员', '文控管理员', '2014-11-10', '2015-02-02 16:58:55', '1');
INSERT INTO `ess_role` VALUES ('3', 'canjiandanwei', '参建单位', '参见单位人员', '2014-11-10', '2015-02-02 16:59:51', '1');
INSERT INTO `ess_role` VALUES ('4', 'yezhu', '业主', '业主', '2014-12-03 11:14:31', '2015-02-02 17:00:47', '1');
INSERT INTO `ess_user_role` VALUES ('1', '1', '1');
-- ----------添加表ess_collaborativemanage----xuekun 20150202--------------
DROP TABLE IF EXISTS `ess_collaborativemanage`;
CREATE TABLE `ess_collaborativemanage` (
  `id` int(11) not null auto_increment,
  `stepid` int(11) not null,
  `userformid` int(11) not null,
  `owner` varchar(256) not null,
  `state` char(1) default null,
  `workflowtype` char(1) default null,
  `organid` int(11) default null,
  `audit_time` varchar(64) default null,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;


-- ----------------------------
-- 20150203 gengqianfeng 添加待办服务 -----------
INSERT INTO fyplatformdb.platformservice ( serviceId, serviceName, interfaceName, url, enableState, token, appId, instanceId, reason ) VALUES ('esdocument_service', 'collaborative', 'cn.flying.rest.service.ICollaborativeService', 'http://127.0.0.1:8080/essoadocument/rest/collaborative', '1', 'wwwwww', '4', '0', null);
-- 20150206 gengqianfeng 添加流程表字段 -----------
ALTER TABLE `ess_transferflow` add column `examine_time` int(11) DEFAULT NULL  COMMENT '审查时间（单位小时）'; 
ALTER TABLE `ess_transferflow` add column `approval_time` int(11) DEFAULT NULL  COMMENT '审批时间（单位小时）'; 
ALTER TABLE `ess_transferflow` add column `submitted_time` int(11) DEFAULT NULL  COMMENT '上报时间（单位小时）'; 

-- 20150206 gengqianfeng 添加流程相关表 -----------
DROP TABLE IF EXISTS `os_combo_formbuilder_relation`;
CREATE TABLE `os_combo_formbuilder_relation` (
  `RELATIONID` varchar(50) NOT NULL,
  `FORMID` varchar(50) NOT NULL,
  `RELATIONTYPE` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `os_currentstep`;
CREATE TABLE `os_currentstep` (
  `ID` bigint(20) NOT NULL,
  `ENTRY_ID` bigint(20) DEFAULT NULL,
  `STEP_ID` int(11) DEFAULT NULL,
  `ACTION_ID` int(11) DEFAULT NULL,
  `OWNER` varchar(4000) DEFAULT NULL,
  `START_DATE` datetime DEFAULT NULL,
  `FINISH_DATE` datetime DEFAULT NULL,
  `DUE_DATE` datetime DEFAULT NULL,
  `STATUS` varchar(40) DEFAULT NULL,
  `CALLER` varchar(35) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `ENTRY_ID` (`ENTRY_ID`),
  KEY `OWNER` (`OWNER`(255)),
  KEY `CALLER` (`CALLER`),
  CONSTRAINT `os_currentstep_ibfk_1` FOREIGN KEY (`ENTRY_ID`) REFERENCES `os_wfentry` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `os_currentstep_prev`;
CREATE TABLE `os_currentstep_prev` (
  `ID` bigint(20) NOT NULL,
  `PREVIOUS_ID` bigint(20) NOT NULL,
  PRIMARY KEY (`ID`,`PREVIOUS_ID`),
  KEY `ID` (`ID`),
  KEY `PREVIOUS_ID` (`PREVIOUS_ID`),
  CONSTRAINT `os_currentstep_prev_ibfk_1` FOREIGN KEY (`ID`) REFERENCES `os_currentstep` (`ID`),
  CONSTRAINT `os_currentstep_prev_ibfk_2` FOREIGN KEY (`PREVIOUS_ID`) REFERENCES `os_historystep` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `os_doc`;
CREATE TABLE `os_doc` (
  `wf_id` bigint(20) NOT NULL DEFAULT '0',
  `title` varchar(100) DEFAULT NULL,
  `content` text,
  PRIMARY KEY (`wf_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `os_doc_opinion`;
CREATE TABLE `os_doc_opinion` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `ENTRY_ID` bigint(20) DEFAULT NULL,
  `STEP_ID` int(11) DEFAULT NULL,
  `ACTION_ID` int(11) DEFAULT NULL,
  `CALLER` varchar(35) DEFAULT NULL,
  `OPINION` text,
  `OPINION_TIME` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `os_entryids`;
CREATE TABLE `os_entryids` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `os_group`;
CREATE TABLE `os_group` (
  `GROUPNAME` varchar(20) NOT NULL,
  PRIMARY KEY (`GROUPNAME`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `os_historystep`;
CREATE TABLE `os_historystep` (
  `ID` bigint(20) NOT NULL,
  `ENTRY_ID` bigint(20) DEFAULT NULL,
  `STEP_ID` int(11) DEFAULT NULL,
  `ACTION_ID` int(11) DEFAULT NULL,
  `OWNER` varchar(4000) DEFAULT NULL,
  `START_DATE` datetime DEFAULT NULL,
  `FINISH_DATE` datetime DEFAULT NULL,
  `DUE_DATE` datetime DEFAULT NULL,
  `STATUS` varchar(40) DEFAULT NULL,
  `CALLER` varchar(35) DEFAULT NULL,
  `OPINION` text,
  PRIMARY KEY (`ID`),
  KEY `ENTRY_ID` (`ENTRY_ID`),
  KEY `OWNER` (`OWNER`(255)),
  KEY `CALLER` (`CALLER`),
  CONSTRAINT `os_historystep_ibfk_1` FOREIGN KEY (`ENTRY_ID`) REFERENCES `os_wfentry` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `os_historystep_prev`;
CREATE TABLE `os_historystep_prev` (
  `ID` bigint(20) NOT NULL,
  `PREVIOUS_ID` bigint(20) NOT NULL,
  PRIMARY KEY (`ID`,`PREVIOUS_ID`),
  KEY `ID` (`ID`),
  KEY `PREVIOUS_ID` (`PREVIOUS_ID`),
  CONSTRAINT `os_historystep_prev_ibfk_1` FOREIGN KEY (`ID`) REFERENCES `os_historystep` (`ID`),
  CONSTRAINT `os_historystep_prev_ibfk_2` FOREIGN KEY (`PREVIOUS_ID`) REFERENCES `os_historystep` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `os_membership`;
CREATE TABLE `os_membership` (
  `USERNAME` varchar(20) NOT NULL,
  `GROUPNAME` varchar(20) NOT NULL,
  PRIMARY KEY (`USERNAME`,`GROUPNAME`),
  KEY `USERNAME` (`USERNAME`),
  KEY `GROUPNAME` (`GROUPNAME`),
  CONSTRAINT `os_membership_ibfk_1` FOREIGN KEY (`USERNAME`) REFERENCES `os_user` (`USERNAME`),
  CONSTRAINT `os_membership_ibfk_2` FOREIGN KEY (`GROUPNAME`) REFERENCES `os_group` (`GROUPNAME`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `os_propertyentry`;
CREATE TABLE `os_propertyentry` (
  `GLOBAL_KEY` varchar(250) NOT NULL,
  `ITEM_KEY` varchar(250) NOT NULL,
  `ITEM_TYPE` tinyint(4) DEFAULT NULL,
  `STRING_VALUE` varchar(255) DEFAULT NULL,
  `DATE_VALUE` datetime DEFAULT NULL,
  `DATA_VALUE` blob,
  `FLOAT_VALUE` float DEFAULT NULL,
  `NUMBER_VALUE` bigint(10) DEFAULT NULL,
  PRIMARY KEY (`GLOBAL_KEY`,`ITEM_KEY`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `os_stepids`;
CREATE TABLE `os_stepids` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `os_user`;
CREATE TABLE `os_user` (
  `USERNAME` varchar(100) NOT NULL,
  `PASSWORDHASH` mediumtext,
  PRIMARY KEY (`USERNAME`),
  KEY `USERNAME` (`USERNAME`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `os_wfentry`;
CREATE TABLE `os_wfentry` (
  `ID` bigint(20) NOT NULL,
  `NAME` varchar(60) DEFAULT NULL,
  `STATE` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------20150209 xuekun 添加数据表 保存流程数据 包含表单数据和附件数据------------------
-- Table structure for `ess_form_appendix`
-- ----------------------------
DROP TABLE IF EXISTS `ess_form_appendix`;
CREATE TABLE `ess_form_appendix` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fileName` varchar(256) DEFAULT NULL COMMENT '附件名称',
  `fileSize` int(10) DEFAULT NULL COMMENT '附件大小',
  `dataId` varchar(1000) DEFAULT NULL COMMENT '关联数据id',
  `wf_id` bigint(15) DEFAULT NULL COMMENT '流程id',
  `type` varchar(10) DEFAULT NULL COMMENT '数据类型  data:数据附件，file:文件附件，opinion:意见附件',
  `wf_step_id` int(10) DEFAULT NULL COMMENT '步骤id',
  `userName` varchar(50) DEFAULT NULL COMMENT '用户名',
  `applyRight` varchar(500) DEFAULT NULL COMMENT '暂时不知何用',
  `overRight` varchar(4000) DEFAULT NULL COMMENT '暂时不知何用',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- ----------end xuekun 20150209------

INSERT INTO fyplatformdb.platformservice ( serviceId, serviceName, interfaceName, url, enableState, token, appId, instanceId, reason ) VALUES ('esdocument_service', 'documentTransfer', 'cn.flying.rest.service.IDocumentTransferService', 'http://127.0.0.1:8080/essoadocument/rest/documentTransfer', '1', 'wwwwww', '4', '0', null);
-- ----------end xuekun 20150209------
INSERT INTO `ess_menu` VALUES ('86', '8', '日志管理', null, 'ESLog', 'index', null, '6');

DROP TABLE IF EXISTS `ess_regulation`;
CREATE TABLE `ess_regulation` (
  `id` bigint(32) NOT NULL AUTO_INCREMENT COMMENT '逻辑主键',
  `no` varchar(50) DEFAULT NULL,
  `chineseName` varchar(100) DEFAULT NULL COMMENT '中文名称',
  `englishName` varchar(100) DEFAULT NULL COMMENT '英文名称',
  `publishTime` varchar(30) DEFAULT NULL COMMENT '此规定的发布时间',
  `filePath` varchar(256) DEFAULT NULL COMMENT '关联文件的相对路径',
  `fileName` varchar(100) DEFAULT NULL COMMENT '上传的显示名称',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `ess_standarddocument`;
CREATE TABLE `ess_standarddocument` (
  `id` bigint(32) NOT NULL AUTO_INCREMENT COMMENT '逻辑主键',
  `no` varchar(50) DEFAULT NULL COMMENT '编号',
  `chineseName` varchar(100) DEFAULT NULL COMMENT '中文名称',
  `description` varchar(200) DEFAULT NULL COMMENT '文件描述',
  `filePath` varchar(256) DEFAULT NULL COMMENT '标准文件的相对路径',
  `fileName` varchar(100) DEFAULT NULL COMMENT '上传的文件名',
  `regulation_id` bigint(32) DEFAULT NULL COMMENT '所属规定的对应id号',
  `regulation_name` varchar(100) DEFAULT NULL COMMENT '关联规范的中文名',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

ALTER TABLE ess_filechange_order add column part_code VARCHAR(20) DEFAULT NULL  COMMENT '单位部门代码'; 
-- ----------------------------
-- Table structure for ess_document_bespeak
-- ----------------------------
DROP TABLE IF EXISTS `ess_document_bespeak`;
CREATE TABLE `ess_document_bespeak` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号',
  `documentTitle` varchar(40) DEFAULT NULL COMMENT '文件名',
  `documentCode` varchar(40) DEFAULT NULL COMMENT '文件编码',
  `status` varchar(10) DEFAULT NULL COMMENT '状态',
  `borrowNum` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;


INSERT INTO `ess_menu` VALUES ('64', '6', '索引库管理', '', 'ESLucene', 'index', '', '4');
INSERT INTO `fyplatformdb`.`platformservice` ( `serviceId`, `serviceName`, `interfaceName`, `url`, `enableState`, `token`, `appId`, `instanceId`, `reason`) VALUES ( 'esdocument_service', 'lucene', 'cn.flying.rest.service.ILuceneService', 'http://127.0.0.1:8080/essoadocument/rest/lucene', '1', 'wwwwww', '4', '0', '');


update ess_menu set controller = 'ESDocumentBorrowing' where id = 62

-- gengqianfeng 20150304 添加流程相关表 ------------
DROP TABLE IF EXISTS `ess_transferform_opinion`;
CREATE TABLE `ess_transferform_opinion` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(50) DEFAULT NULL,
  `content` varchar(4000) DEFAULT NULL,
  `wf_id` int(10) NOT NULL,
  `wf_step_id` int(10) NOT NULL,
  `time` varchar(80) DEFAULT NULL,
  `parentid` int(10) DEFAULT NULL,
  `forwarduserid` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='流程审批意见表';

DROP TABLE IF EXISTS `ess_transferform_user_forward`;
CREATE TABLE `ess_transferform_user_forward` (
  `user_id` int(10) DEFAULT NULL,
  `forward_id` int(10) DEFAULT NULL,
  `forward_user_id` bigint(19) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for ess_transfernotice
-- ----------------------------
DROP TABLE IF EXISTS `ess_transfernotice`;
CREATE TABLE `ess_transfernotice` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `wf_id` int(10) DEFAULT NULL COMMENT '流程id',
  `form_id` int(10) DEFAULT NULL COMMENT '表单id',
  `user_id` int(10) DEFAULT NULL COMMENT '用户id',
  `action_id` int(10) DEFAULT NULL COMMENT '动作id',
  `status` varchar(10) DEFAULT NULL COMMENT '状态',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COMMENT='流程知会表';

ALTER TABLE ess_filesend add column matrix text DEFAULT NULL  COMMENT '流程矩阵json串'; 

INSERT INTO `ess_menu` VALUES ('37', '3', '文件流转', null, 'ESDocumentTransfer', 'index', null, '7');

DROP TABLE IF EXISTS `ess_opinion_appendix_relation`;
CREATE TABLE `ess_opinion_appendix_relation` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `appendix_id` int(11) DEFAULT NULL COMMENT '附件id',
  `opinion_id` int(11) DEFAULT NULL COMMENT '意见id',
  PRIMARY KEY (`id`),
  KEY `FK_APPENDIX` (`appendix_id`),
  KEY `FK_OPINION` (`opinion_id`),
  CONSTRAINT `FK_APPENDIX` FOREIGN KEY (`appendix_id`) REFERENCES `ess_form_appendix` (`id`),
  CONSTRAINT `FK_OPINION` FOREIGN KEY (`opinion_id`) REFERENCES `ess_transferform_opinion` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='附件意见关联表';

-- ----------------------------
-- Table structure for ess_index_nodes
-- ----------------------------
DROP TABLE IF EXISTS `ess_index_nodes`;
CREATE TABLE `ess_index_nodes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nodeHost` varchar(20) NOT NULL,
  `nodeAddress` varchar(100) NOT NULL,
  `struId` varchar(5) NOT NULL,
  `moduleType` int(2) NOT NULL,
  `moduleArray` varchar(100) NOT NULL,
  `activeStatus` int(2) DEFAULT '0',
  `searchedOrder` int(3) DEFAULT NULL,
  `createTime` varchar(20) DEFAULT NULL,
  `updateTime` varchar(20) DEFAULT NULL,
  `treeNodeId` int(10) DEFAULT NULL,
  `childStruId` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_mainSite` (`struId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for ess_appconfig
-- ----------------------------
DROP TABLE IF EXISTS `ess_appconfig`;
CREATE TABLE `ess_appconfig` (
  `ID` int(20) NOT NULL AUTO_INCREMENT,
  `TITLE` varchar(128) DEFAULT NULL,
  `APPCONFIGKEY` varchar(128) DEFAULT NULL,
  `APPCONFIGVALUE` varchar(512) DEFAULT NULL,
  `DESCRIPTION` varchar(128) DEFAULT NULL,
  `VALUETYPE` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
INSERT INTO `ess_appconfig` VALUES ('1', '全文索引库根路径', 'FULLINDEX_LOCALTEXTPATH', 'd:/fullindex/db', '全文索引库存储的本地根路径', 'APP_DIRECTORY');

-- ------2015/03/06------------
ALTER TABLE ess_document add column `transferstatus` varchar(50) DEFAULT NULL;

INSERT INTO `fyplatformdb`.`platformservice` ( `serviceId`, `serviceName`, `interfaceName`, `url`, `enableState`, `token`, `appId`, `instanceId`, `reason`) VALUES ( 'esdocument_service', 'fulltextsearch', 'cn.flying.rest.service.IFullTextSearchService', 'http://127.0.0.1:8080/essoadocument/rest/fulltextsearch', '1', 'wwwwww', '4', '0', null);

-- gengqianfeng 20150309 添加接收人字段---------
ALTER TABLE ess_filereceive add column receiveId int(11) DEFAULT NULL COMMENT '接收人id'; 
ALTER TABLE ess_filechange_order add column receiveId int(11) DEFAULT NULL COMMENT '接收人id';

-- xiewenda ----20150309-------
CREATE TABLE `ess_deskapps` (
  `ID` int(10) NOT NULL AUTO_INCREMENT,
  `userId` varchar(20) NOT NULL,
  `menuId` varchar(100) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

-- gengqianfeng 20150310 修改字段类型备注---------
ALTER TABLE ess_transferform_user MODIFY column `end_time` varchar(20) DEFAULT NULL COMMENT '结束时间';
ALTER TABLE ess_transferform_user MODIFY column `wf_status` varchar(100) DEFAULT NULL COMMENT '状态（null、待发，not null、已发）';
ALTER TABLE ess_form_appendix MODIFY column `type` varchar(10) DEFAULT NULL COMMENT '数据类型  data:数据附件，file:文件附件，opinion:意见附件';

ALTER TABLE ess_file modify column fileVersion varchar(50) DEFAULT NULL  COMMENT '文件版本';

-- ---------------修改文件元数据的字段类型-------xuekun start----------------
ALTER TABLE `ess_document_metadata`
MODIFY COLUMN `length`  int(11) NULL DEFAULT NULL COMMENT '元数据长度' AFTER `type`,
MODIFY COLUMN `defaultValue`  varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '元数据默认值' AFTER `length`,
MODIFY COLUMN `dotLength`  int(11) NULL DEFAULT NULL AFTER `isSystem`;
-- --------------------------------------xuekun end -------------------

-- gengqianfeng 20150318 修改菜单标题----------
update ess_menu set name='参建单位部门' where controller='ESParticipatory';
update ess_menu set name='设计变更清单' where controller='ESChangeOrders';

-- gengqianfeng 20150318 修改参建单位表代码字段类型长度
ALTER TABLE ess_participatory MODIFY COLUMN `code` varchar(50) DEFAULT NULL COMMENT '代码';
ALTER TABLE ess_participatory MODIFY COLUMN `user_id` varchar(255) DEFAULT NULL COMMENT '文控人员id，多个以英文逗号分隔';
-- --------------------------------------xuekun end -------------------
-- --------------------------------------删除是否挂接和挂接数的字段 -------------------------------
delete  from ess_document_metadata where  code in ('Attachments','documentFlag');
-- --------------------添加项目代码字段--xuekun 20150318--start--------------------
alter table ess_document add column projectCode varchar(20) COMMENT '项目代码';

INSERT INTO `esdocument`.`ess_document_metadata` (`name`, `code`, `type`, `length`, `defaultValue`, `stageId`, `isSystem`, `dotLength`, `isNull`, `isEdit`, `metaDataId`, `esidentifier`) VALUES ( '项目代码', 'projectCode', 'TEXT', '20', 'ZTHC01', NULL, '0', '0', '1', '1', NULL, NULL);
-- ----------------------添加项目代码----end--------------------------------------
-- gengqianfeng 20150326 修改文件分发记录文件字段存储长度--------
ALTER TABLE ess_filesend MODIFY COLUMN `file_id` varchar(512) DEFAULT NULL COMMENT '文件id，多个以英文逗号分隔';
ALTER TABLE ess_filereceive MODIFY COLUMN `file_id` varchar(512) DEFAULT NULL COMMENT '文件id，多个以英文逗号分隔';
ALTER TABLE ess_filechange_order MODIFY COLUMN `file_id` varchar(512) DEFAULT NULL COMMENT '文件id，多个以英文逗号分隔';

ALTER TABLE ess_filesend MODIFY COLUMN `no` varchar(30) DEFAULT NULL COMMENT '编号';
ALTER TABLE ess_filesend ADD COLUMN `fileflow_name` varchar(50) DEFAULT NULL COMMENT '流程名称';

-- ------xiewenda 20150326---------------------
alter TABLE ess_document  MODIFY stageCode VARCHAR(200);
alter TABLE ess_document  MODIFY deviceCode VARCHAR(50);
alter TABLE ess_document  MODIFY participatoryCode VARCHAR(50);
update ess_document_metadata set length = 200 where code='stageCode';
update ess_document_metadata set length = 50 where code='deviceCode';
update ess_document_metadata set length = 50 where code='participatoryCode';

-- rongying 20150327 添加目录检查服务
INSERT INTO `fyplatformdb`.`platformservice` ( `serviceId`, `serviceName`, `interfaceName`, `url`, `enableState`, `token`, `appId`, `instanceId`, `reason`) VALUES ( 'esdocument_service', 'catalogcheck', 'cn.flying.rest.service.ICatalogCheckService', 'http://127.0.0.1:8080/essoadocument/rest/catalogcheck', '1', 'wwwwww', '4', '0', null);

-- ------xiewenda 20150327------将表中具有userId varchar类型的字段 修改为长度50---------------
DROP PROCEDURE IF EXISTS `modify_userId`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `modify_userId`()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE a VARCHAR(200);
    DECLARE rs CURSOR FOR 
    select `TABLE_NAME` from information_schema.`COLUMNS` where TABLE_SCHEMA ='esdocument' and `COLUMN_NAME`='userId' and `DATA_TYPE`='varchar';
		DECLARE   CONTINUE  HANDLER  FOR  SQLSTATE  '02000'   SET  done  =   1 ; 	
	open rs;		
    REPEAT
        FETCH rs INTO a;
        SET @s = CONCAT('
        ALTER TABLE ',a,'
        modify userId varchar(50)');
    PREPARE stmt FROM @s;
    EXECUTE stmt;
    UNTIL done END REPEAT;
    CLOSE rs;
END;;
DELIMITER ;

-- gengqianfeng 20150330 修改菜单名称--------
update ess_menu set name = '设计变更单' where name='设计变更清单';

-- rongying 20150331 修改元数据名称--------
update ess_document_metadata set name = '类型代码' where name='分类编码';

-- rongying 20150401 修改字段长度---------------------
alter TABLE ess_borrowing_form MODIFY email VARCHAR(50);

-- rongying 20150402 ess_borrrowing_detail添加字段值---------------------
alter TABLE ess_borrrowing_detail add column `itemName` varchar(40) DEFAULT NULL COMMENT '项目名称';
alter TABLE ess_borrrowing_detail add column `stageCode` varchar(40) DEFAULT NULL COMMENT '收集范围代码';
alter TABLE ess_borrrowing_detail add column `deviceCode` varchar(40) DEFAULT NULL COMMENT '装置号';
alter TABLE ess_borrrowing_detail add column `participatoryCode` varchar(40) DEFAULT NULL COMMENT '拟定部门代码';
alter TABLE ess_borrrowing_detail add column `engineeringCode` varchar(40) DEFAULT NULL COMMENT '专业代码';
alter TABLE ess_borrrowing_detail add column `title` varchar(200) DEFAULT NULL COMMENT '文件标题';
alter TABLE ess_borrrowing_detail add column `docNo` varchar(200) DEFAULT NULL COMMENT '文件编码';
alter TABLE ess_borrrowing_detail add column `docId` int(11) DEFAULT NULL COMMENT '选择的文件id';

-- rongying 20150403 ess_document添加字段值---------------------
alter TABLE ess_document add column `borrowStatus` varchar(10) DEFAULT NULL COMMENT '借阅状态';

-- lujixiang 20150403 为 选择文件、装置、拟定部门、类型代码、专业代码  添加中文字段  --------
ALTER TABLE ess_document add column stageName varchar(110) NOT NULL COMMENT '收集范围名称'; -- 长度最大100 
ALTER TABLE ess_document add column deviceName varchar(30) NOT NULL COMMENT '装置分类名称'; -- 长度最大25
ALTER TABLE ess_document add column participatoryName varchar(30) NOT NULL COMMENT '参建单位部门名称'; -- 长度最大25
ALTER TABLE ess_document add column documentTypeName varchar(30) NOT NULL COMMENT '文件类型名称'; -- 长度最大25
ALTER TABLE ess_document add column engineeringName varchar(30) NOT NULL COMMENT '文件专业名称'; -- 长度最大25
ALTER TABLE ess_document add column stageId int NOT NULL COMMENT 'stageID外键'; --

-- lujixiang 20150403 为 选择文件、装置、拟定部门、类型代码、专业代码的中文字段添加元数据 ----
INSERT INTO `esdocument`.`ess_document_metadata` (`name`, `code`, `type`, `length`, `defaultValue`, `stageId`, `isSystem`, `dotLength`, `isNull`, `isEdit`, `metaDataId`, `esidentifier`) 
										VALUES ( '收集范围名称', 'stageName', 'TEXT', 200, '', NULL, '0', '0', '1', '1', NULL, NULL);
INSERT INTO `esdocument`.`ess_document_metadata` (`name`, `code`, `type`, `length`, `defaultValue`, `stageId`, `isSystem`, `dotLength`, `isNull`, `isEdit`, `metaDataId`, `esidentifier`) 
										VALUES ( '装置分类名称', 'deviceName', 'TEXT', 50, '', NULL, '0', '0', '1', '1', NULL, NULL);
INSERT INTO `esdocument`.`ess_document_metadata` (`name`, `code`, `type`, `length`, `defaultValue`, `stageId`, `isSystem`, `dotLength`, `isNull`, `isEdit`, `metaDataId`, `esidentifier`) 
										VALUES ( '参建单位部门名称', 'participatoryName', 'TEXT', 50, '', NULL, '0', '0', '1', '1', NULL, NULL);
INSERT INTO `esdocument`.`ess_document_metadata` (`name`, `code`, `type`, `length`, `defaultValue`, `stageId`, `isSystem`, `dotLength`, `isNull`, `isEdit`, `metaDataId`, `esidentifier`) 
										VALUES ( '文件类型名称', 'documentTypeName', 'TEXT', 50, '', NULL, '0', '0', '1', '1', NULL, NULL);
INSERT INTO `esdocument`.`ess_document_metadata` (`name`, `code`, `type`, `length`, `defaultValue`, `stageId`, `isSystem`, `dotLength`, `isNull`, `isEdit`, `metaDataId`, `esidentifier`) 
										VALUES ( '文件专业名称', 'engineeringName', 'TEXT', 50, '', NULL, '0', '0', '1', '1', NULL, NULL);
INSERT INTO `esdocument`.`ess_document_metadata` (`name`, `code`, `type`, `length`, `defaultValue`, `stageId`, `isSystem`, `dotLength`, `isNull`, `isEdit`, `metaDataId`, `esidentifier`) 
										VALUES ( 'stageId', 'stageId', 'NUMBER', 11, '', NULL, '0', '0', '1', '1', NULL, NULL);

-- lujixiang 20150407 ,关联字段索引
CREATE INDEX index_id_seq ON ess_document_stage (id_seq);
CREATE INDEX index_code ON ess_document_stage(code);
CREATE INDEX index_stageCode ON ess_document(stageCode);
CREATE INDEX index_participatoryCode ON ess_document(participatoryCode);
-- 筛选字段建立索引
CREATE INDEX index_itemName ON ess_document(itemName); -- 项目名称
CREATE INDEX index_stageName ON ess_document(stageName); -- 收集范围
CREATE INDEX index_deviceName ON ess_document(deviceName); -- 装置名称
CREATE INDEX index_participatoryName ON ess_document(participatoryName); -- 部门
CREATE INDEX index_title ON ess_document(title); -- 文件标题
CREATE INDEX index_person ON ess_document(person); -- 拟定人
CREATE INDEX index_date ON ess_document(date); -- 拟定日期

-- rongying 20150408 ess_document_bespeak添加字段值---------------------
alter TABLE ess_document_bespeak change `documentTitle` `title` varchar(200) DEFAULT NULL COMMENT '文件标题';
alter TABLE ess_document_bespeak add column `docId` int(11) DEFAULT NULL COMMENT '选择的文件id';
alter TABLE ess_document_bespeak add column `docNo` varchar(200) DEFAULT NULL COMMENT '文件编码';
alter TABLE ess_document_bespeak add column `itemName` varchar(40) DEFAULT NULL COMMENT '项目名称';
alter TABLE ess_document_bespeak add column `stageName` varchar(40) DEFAULT NULL COMMENT '收集范围代码';
alter TABLE ess_document_bespeak add column `deviceName` varchar(40) DEFAULT NULL COMMENT '装置号';
alter TABLE ess_document_bespeak add column `participatoryName` varchar(40) DEFAULT NULL COMMENT '拟定部门代码';
alter TABLE ess_document_bespeak add column `engineeringCode` varchar(40) DEFAULT NULL COMMENT '专业代码';

-- rongying 20150409 ess_document_bespeak添加字段值---------------------
alter TABLE ess_document_bespeak add column `userId` int(11) DEFAULT NULL COMMENT '操作人id';

-- rongying 20150410 ess_document_bespeak添加字段值---------------------
alter TABLE ess_borrowing_form add column `readerId` varchar(50) DEFAULT NULL COMMENT '借阅人标识';

-- begin rongying 20150413
-- ----------------------------
-- Table structure for ess_discuss_img
-- ----------------------------
DROP TABLE IF EXISTS `ess_discuss_img`;
CREATE TABLE `ess_discuss_img` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `msgId` int(11) DEFAULT NULL,
  `img_list` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `img_view` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for ess_discuss_msg
-- ----------------------------
DROP TABLE IF EXISTS `ess_discuss_msg`;
CREATE TABLE `ess_discuss_msg` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `authorId` varchar(50) DEFAULT NULL,
  `authorName` varchar(100) DEFAULT NULL,
  `msg` text,
  `replyCount` varchar(10) DEFAULT '0',
  `is_del` varchar(2) DEFAULT '1' COMMENT '1表示未删除0表示删除',
  `createTime` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for ess_discuss_reply
-- ----------------------------
DROP TABLE IF EXISTS `ess_discuss_reply`;
CREATE TABLE `ess_discuss_reply` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `msgId` int(11) DEFAULT NULL,
  `replyContent` text COLLATE utf8_unicode_ci COMMENT '回复的内容',
  `replyerId` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `replyerName` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `replyTime` varchar(25) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `fyplatformdb`.`platformservice` ( `serviceId`, `serviceName`, `interfaceName`, `url`, `enableState`, `token`, `appId`, `instanceId`, `reason`) VALUES ( 'esdocument_service', 'discuss', 'cn.flying.rest.service.IDiscussService', 'http://127.0.0.1:8080/essoadocument/rest/discuss', '1', 'wwwwww', '4', '0', '');

CREATE TABLE `ess_part_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `partId` int(11) DEFAULT NULL COMMENT '参建单位部门id',
  `userId` int(11) DEFAULT NULL COMMENT '用户id',
  `office` char(1) DEFAULT NULL COMMENT '职位（1、领导，2、高级工程师，3、文控人员，4、普通员工）',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----20150415 xiewenda---存储过程修改的ess_document表中新增字段数据的对应加入------
DROP PROCEDURE IF EXISTS `modify_document`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `modify_document`()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE stageId INT(11);
		DECLARE stageCode VARCHAR(50);
		DECLARE stageName VARCHAR(50);
		DECLARE rs CURSOR FOR select id,code,name from ess_document_stage where isnode=0;
		DECLARE rs1 CURSOR FOR select name, deviceNo from ess_device;
		DECLARE rs2 CURSOR FOR select name,code from ess_participatory;
		DECLARE rs3 CURSOR FOR select typeName,typeNo from ess_document_type;
		DECLARE rs4 CURSOR FOR select typeName,typeNo from ess_engineering;
		DECLARE CONTINUE HANDLER FOR NOT FOUND  SET  done  =   1 ; 	
	open rs;		
    REPEAT
        FETCH rs INTO stageId,stageCode,stageName;
        SET @s = CONCAT('
        update ess_document set stageId =',stageId,' ,stageName ="',stageName,'" where stageCode = "',stageCode,'"');
    PREPARE stmt FROM @s;
    EXECUTE stmt;
    UNTIL done END REPEAT;
  CLOSE rs;
  SET  done  =  0;
	open rs1;		
    REPEAT
        FETCH rs1 INTO stageName,stageCode;
        SET @s = CONCAT('update ess_document set deviceName = "',stageName,'" where deviceCode="',stageCode,'";');
    PREPARE stmt FROM @s;
    EXECUTE stmt;
    UNTIL done END REPEAT;
  CLOSE rs1;
  SET  done  =  0;
	open rs2;		
    REPEAT
        FETCH rs2 INTO stageName,stageCode;
        SET @s = CONCAT('update ess_document set participatoryName = "',stageName,'" where participatoryCode="',stageCode,'";');
    PREPARE stmt FROM @s;
    EXECUTE stmt;
    UNTIL done END REPEAT;
  CLOSE rs2;
  SET  done  =  0;
	open rs3;		
    REPEAT
        FETCH rs3 INTO stageName,stageCode;
        SET @s = CONCAT('update ess_document set documentTypeName = "',stageName,'" where documentCode="',stageCode,'";');
    PREPARE stmt FROM @s;
    EXECUTE stmt;
    UNTIL done END REPEAT;
  CLOSE rs3;
  SET  done  =  0; 
	open rs4;		
    REPEAT
        FETCH rs4 INTO stageName,stageCode;
        SET @s = CONCAT('update ess_document set engineeringName = "',stageName,'" where engineeringCode="',stageCode,'";');
    PREPARE stmt FROM @s;
    EXECUTE stmt;
    UNTIL done END REPEAT;
  CLOSE rs4;
END;;
DELIMITER ;

-- rongying 20150416 ess_document_bespeak添加字段值---------------------
alter TABLE ess_document_bespeak MODIFY COLUMN `userId` varchar(50) DEFAULT NULL COMMENT '操作人id';
alter TABLE ess_document_bespeak add column `readerId` varchar(50) DEFAULT NULL COMMENT '借阅人id';

-- gengqianfeng 20150420
alter TABLE ess_transferaction add column `process_time` int(11) DEFAULT '0' COMMENT '处理时间（单位小时）';
alter TABLE ess_part_user MODIFY column `office` char(1) DEFAULT NULL COMMENT '职位（1、领导，2、副领导，3、文控人员，4、普通员工）';
-- xiewenda 20150423---------
alter TABLE ess_document_type MODIFY column `typeName` varchar(200) DEFAULT NULL COMMENT '文件类型名称';
alter TABLE ess_document_type MODIFY column `typeNo` varchar(200) DEFAULT NULL COMMENT '文件类型代码';
alter TABLE ess_engineering MODIFY column `typeName` varchar(200) DEFAULT NULL COMMENT '文件专业名称';
alter TABLE ess_engineering MODIFY column `typeNo` varchar(200) DEFAULT NULL COMMENT '文件专业代码';

-- rongying 20150424 ess_rule_docno添加字段值---------------------
alter TABLE ess_rule_docno add column `serialNum` int(11) DEFAULT 0 COMMENT '流水号';

-- xiewenda 20150429 存储过程修改所有元数据字段建立的date类型的字段  修改为varchar(10)
DROP PROCEDURE IF EXISTS `modify_esp_date`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `modify_esp_date`()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE tablename VARCHAR(200);
	DECLARE columnname VARCHAR(200);
    DECLARE rs CURSOR FOR 
		select `TABLE_NAME`,`COLUMN_NAME` from information_schema.`COLUMNS` where TABLE_SCHEMA ='esdocument'  and `DATA_TYPE`='date' and (`TABLE_NAME` like 'esp_%' or `TABLE_NAME`='ess_document');
	DECLARE   CONTINUE  HANDLER  FOR  SQLSTATE  '02000'   SET  done  =   1 ; 	
	open rs;		
    REPEAT
        FETCH rs INTO tablename,columnname;
        SET @s = CONCAT('
        ALTER TABLE ',tablename,'
        modify ',columnname,' varchar(10) comment "存储过程修改字段" ');
    PREPARE stmt FROM @s;
    EXECUTE stmt;
    UNTIL done END REPEAT;
    CLOSE rs;
END;;
DELIMITER ;

-- xiewenda 20150430 修改文件收集系统字段 项目名称默认值
update ess_document_metadata set defaultValue = '中天合创鄂尔多斯煤炭深加工示范项目' where `code` ='itemName';
update ess_document_metadata set isNull = 1 where `code` ='itemName';

-- xiewenda 20150505 修改设计变更单表添加pId字段
alter table ess_filechange_order add column pId int(11) comment '流程类型树节点id';

-- ================二次测试修改节点20150511===================

-- xiewenda 20150512 修改平台消息表 字段
alter table  fyplatformdb.ess_message modify COLUMN delstatus varchar(50) COMMENT '消息状态';

-- gengqianfeng 20150520 流程字段修改
alter table ess_collaborativemanage add column createtime varchar(20) DEFAULT NULL COMMENT '发放时间';
alter table ess_collaborativemanage add column `emailOrMessage` char(1) DEFAULT '0' COMMENT '是否发送过邮件或消息，0、未发送，1、已发送';

-- rongying 20150520 ess_document_bespeak添加字段值---------------------
alter TABLE ess_document_bespeak add column `documentTypeName` varchar(200) DEFAULT NULL COMMENT '文件类型名称';
alter TABLE ess_document_bespeak add column `engineeringName` varchar(200) DEFAULT NULL COMMENT '文件专业名称';

-- xiewenda 20150512 修改平台消息表 字段
alter table  ess_filereceive MODIFY COLUMN reply_content varchar(150) COMMENT '接收回复';

-- rongying 20150528 修改表字段长度
alter table  ess_transferflow MODIFY COLUMN business_relation varchar(200) COMMENT '关联业务';
alter table  ess_borrrowing_detail MODIFY COLUMN documentCode varchar(40) COMMENT '文件类型代码';
alter table  ess_borrrowing_detail MODIFY COLUMN stageCode varchar(200) COMMENT '收集范围代码';
alter table  ess_borrrowing_detail MODIFY COLUMN deviceCode varchar(50) COMMENT '装置号';
alter table  ess_borrrowing_detail MODIFY COLUMN participatoryCode varchar(50) COMMENT '拟定部门代码';
alter table  ess_borrrowing_detail MODIFY COLUMN itemName varchar(200) COMMENT '项目名称';

-- xiewenda 20150602 修改初始化元数据名称
update ess_document_metadata set `name`='收集范围代码' where `code` = 'stageCode';
update ess_document_metadata set `name`='装置分类代码' where `code` = 'deviceCode';
update ess_document_metadata set `name`='拟定部门代码' where `code` = 'participatoryCode';
update ess_document_metadata set `name`='文件类型代码' where `code` = 'documentCode';
update ess_document_metadata set `name`='文件专业代码' where `code` = 'engineeringCode';
update ess_document_metadata set `name`='拟定部门名称' where `code` = 'participatoryName';

-- rongying 20150630 修改表字段长度
alter table  ess_borrowing_form MODIFY COLUMN borrowPerson varchar(100) COMMENT '借阅人姓名';
alter table  ess_borrowing_form MODIFY COLUMN unit varchar(50) COMMENT '单位';
alter table  ess_borrowing_form MODIFY COLUMN regPerson varchar(50) COMMENT '登记人标识';
alter table  ess_borrowing_form MODIFY COLUMN remark varchar(512) COMMENT '借阅单备注';
alter table  ess_borrrowing_detail MODIFY COLUMN remark varchar(512) COMMENT '借阅明细备注';

-- gengqianfeng 20150604 修改添加表
CREATE TABLE `ess_statistic_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `statistic_id` bigint(32) DEFAULT NULL COMMENT '关联的统计规则的id',
  `tree_id` int(11) DEFAULT NULL COMMENT '节点id',
  `groups` varchar(256) DEFAULT NULL COMMENT '分组列表，以，分割',
  `havings` varchar(256) DEFAULT NULL COMMENT '分组条件',
  `wheres` varchar(256) DEFAULT NULL COMMENT '筛选条件',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


alter table ess_statistic add column statisticType char(1) DEFAULT '0' COMMENT '统计类型（0、数据节点统计，1、分组统计）';

-- xiewenda 修改角色字段信息-----
alter table  ess_role MODIFY COLUMN roleRemark varchar(256) COMMENT '角色备注';
alter table  ess_report MODIFY COLUMN UPLODAER varchar(50) COMMENT '添加人';