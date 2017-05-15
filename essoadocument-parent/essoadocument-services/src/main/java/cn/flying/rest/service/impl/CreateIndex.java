package cn.flying.rest.service.impl;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.CountDownLatch;

import javax.annotation.Resource;
import javax.persistence.UniqueConstraint;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.TieredMergePolicy;
import org.apache.lucene.index.IndexWriterConfig.OpenMode;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.store.SimpleFSDirectory;
import org.apache.lucene.util.Version;
import org.springframework.stereotype.Component;
import org.wltea.analyzer.lucene.IKAnalyzer;

import cn.flying.rest.file.IMainFileServer;
import cn.flying.rest.service.IDocumentsCollectionService;
import cn.flying.rest.service.ILuceneService;
import cn.flying.rest.service.utils.Pair;
import cn.flying.rest.service.utils.StaticUtil;
import edu.emory.mathcs.backport.java.util.Arrays;
@Component
public class CreateIndex {
	//private static CreateIndex createIndex = null;

	public static final String item_text_prefix = "t_";// 分词字段名前缀
	public static final String item_metadata_prefix = "m_";// 元数据字段名前缀
	public static final String T_label = item_text_prefix + "label";// 元数据合并信息
	public static final String T_content = item_text_prefix + "content";// 文件索引
	public static final String T_FJ_content = item_text_prefix + "FJcontent";// 文件索引
	public static final String T_CLD_content = item_text_prefix + "CLDcontent";// 文件索引
	public static final String DOCUMENTFLAG ="s_documentflag";//xiaoxiong 20140805 是否存在电子文件标示
	public static final String STRUCTURETYPE ="s_structureType";//xiaoxiong 20140930 添加结构类型标示 innerFile/file
	
	private float itemBoost = 1.5F;
	private String ocrDir;
	private String SWFToolsDir;
	private ILuceneService ilucuneservice;
	@Resource
	public void setilucuneservice(ILuceneService ilucuneservice) {
		this.ilucuneservice = ilucuneservice;
	}

	private IMainFileServer iMainFileServer;
	/** 分词器 **/
	private Analyzer analyzer = null;
	/** 最大合并文档数 **/
	//private static int bufferDocs;
	/** RAM缓冲区大小 **/
	//private static double bufferRamSize;// 单位：MB
	private int maxMergeAtOnce = 30;// during "normal" merging
	private int maxMergeAtOnceExplicit = 50;// during forceMerge or
											// forceMergeDeletes
	private double segmentsPerTier = 20D;
	
	private IDocumentsCollectionService documentsCollectionService;
	
	@Resource
	public void setDocumentsCollectionService(
			IDocumentsCollectionService documentsCollectionService) {
		this.documentsCollectionService = documentsCollectionService;
	}


	/** 单例模式 **/
	/*public static CreateIndex getInstance() {
		if (createIndex == null) {
			synchronized (CreateIndex.class) {
				if (createIndex == null) {
					createIndex = new CreateIndex();
				}
			}
		}
		return createIndex;
	}*/

	

	/**
	 * 创建一个节点的全文索引库
	 * 
	 * @param instanceId
	 *            应用实例ID
	 * @param nodeId
	 *            节点ID
	 * @param id_structure
	 *            第一级结构ID
	 * @param childStruId
	 *            子结构ID，当存在子结构时，否则为""
	 * @param isFile
	 *            标示是否为案卷卷内结构层次
	 * @param iLuceneDao
	 *            连接底层接口
	 * @param structureWS
	 *            结构接口
	 * @param businessEditWS
	 * @param iMainFileServer
	 */
	public boolean createOneNodeIndex(String instanceId, String nodeId,
			String id_structure, IMainFileServer iMainFileServer,CountDownLatch latchcount) {
		String indexPath = StaticUtil.fullIndexPath + "/" + instanceId + "/"
				+ nodeId;
		if(this.iMainFileServer==null)this.iMainFileServer = iMainFileServer ;
		IndexWriter indexWriter = null;
		try {
			indexWriter = this.createIndexWriter(indexPath);
			boolean f = createOneStructureIndex(indexWriter,  nodeId,
					id_structure, null, false);
			if(f){
				indexWriter.commit();
				latchcount.countDown();
				System.out.println("成功索引库：" + indexPath);
				System.out.println(StaticUtil.fullIndexPath);
			}else{
				return false;
			}
		} catch (IOException e) {
			e.printStackTrace();
			try {
				// 回滚
				indexWriter.rollback();
			} catch (IOException e1) {
				e1.printStackTrace();
			}
			return false;
		} finally {
			try {
				if (null != indexWriter) {
					indexWriter.close();
					indexWriter = null;
				}
			} catch (Exception ex) {
				System.out.println("创建索引库失败:" + indexPath);
				return false;
			}
		}

		return true;

	}

	/**
	 * 创建IndexWriter
	 * 
	 * @param instanceId
	 * @param nodeId
	 * @param id_structure
	 * @param indexPath2
	 * @return
	 * @throws IOException
	 */
	private IndexWriter createIndexWriter(String indexPath) throws IOException {
		FSDirectory dir = null;
		File dirFile = new File(indexPath);
		if (!dirFile.exists())
			dirFile.mkdirs();
		dir = new SimpleFSDirectory(dirFile);
		IndexWriterConfig iwConfig = new IndexWriterConfig(Version.LUCENE_44,
				getAnalyzerInstance());
		/** 无则创建否则追加，CREATE覆盖模式； APPEND追加模式 **/
		iwConfig.setOpenMode(OpenMode.CREATE_OR_APPEND);
		TieredMergePolicy mergePolicy = new TieredMergePolicy();
		mergePolicy.setMaxMergeAtOnce(maxMergeAtOnce);// 默认10
		mergePolicy.setMaxMergeAtOnceExplicit(maxMergeAtOnceExplicit);// 默认30
		mergePolicy.setSegmentsPerTier(segmentsPerTier);// 默认10D
		iwConfig.setMergePolicy(mergePolicy);
		iwConfig.setMaxBufferedDeleteTerms(20);
		/** 最大合并文档数 **/
		iwConfig.setMaxBufferedDocs(50000);// 50000
		/** RAM缓冲区大小 **/
		iwConfig.setRAMBufferSizeMB(526);// 256
		IndexWriter indexWriter = new IndexWriter(dir, iwConfig);
		return indexWriter;
	}

	/***
	 * 获取IK分词器
	 * 
	 * @return
	 */
	private Analyzer getAnalyzerInstance() {
		if (analyzer == null) {
			analyzer = new IKAnalyzer();
		}
		return analyzer;
	}
	
	@SuppressWarnings("unchecked")
	private boolean createOneStructureIndex(IndexWriter indexWriter,
			 String nodeId, String structureId,
			String childStruId, boolean isFile) {
		String essclass = structureId;
		HashMap<String, String> cidToMetadataMap = (HashMap<String, String>) ilucuneservice.getHasMetaDataTags(Long.parseLong(nodeId));
		if (cidToMetadataMap==null || cidToMetadataMap.isEmpty()) {
			/** 字段都没有设置元数据时，直接返回 **/
			//System.out.println(nodeId + "结构下没有一个字段设置了元数据，无法进行全文索引创建。");
			//return false;
		}
		List<String> queryCols = Arrays.asList(cidToMetadataMap.keySet()
				.toArray());
		/** 用来存储结构的是否有resource **/
		HashMap<Long, Boolean> resourceMap = new HashMap<Long, Boolean>();
		/** 分批获取数据 每次1000条 **/
		int startNo = 0;
		int limit = 1000;
		int tempCount = 0;
		Pair<List<HashMap<String, String>>, HashMap<String, String>> pair = null;
		List<HashMap<String, String>> pkgDataMapList = null;
		HashMap<String, String> fileDocumentflagMap = null;
		do {
			tempCount = 0;
			/** 得到path下面的一部分pkg **/
			pair = this.searchAllEspnDataMap(nodeId, structureId, childStruId,
					queryCols, cidToMetadataMap, startNo, limit, isFile);
			pkgDataMapList = pair.left;
			fileDocumentflagMap = pair.right;
			if (pkgDataMapList.isEmpty()) {
				break;
			}
			/** 索引库创建 ***/
			if (!pkgDataMapList.isEmpty()) {
				tempCount = this.createIndexTask(indexWriter, pkgDataMapList,
						resourceMap, isFile, fileDocumentflagMap, essclass);
			}
			startNo += 1000;
			if (tempCount == 1000) {
				if (startNo % 10000 == 0)
					System.out.println(nodeId + "_" + structureId + "==已经创建:"
							+ startNo + "条！");
			}
		} while (tempCount == 1000);
		System.out.println(nodeId + "_" + structureId + "==成功创建完成，共创建:"
				+ (startNo + tempCount) + "条！");
		return true;
	}

	/***
	 * 创建1000条以内的局部索引库，是创建索引库的最小单位
	 * 
	 * @param indexWriter
	 * @param pkgDataMapList
	 * @param resourceMap
	 * @param isFile
	 * @param fileDocumentflagMap
	 * @param essclass
	 * @return
	 */
	public int createIndexTask(IndexWriter indexWriter,
			List<HashMap<String, String>> pkgDataMapList,
			HashMap<Long, Boolean> resourceMap, boolean isFile,
			HashMap<String, String> fileDocumentflagMap, String essclass) {
		int count = 0;
		try {
			for (HashMap<String, String> dm : pkgDataMapList) {
				indexWriter.addDocument(buildOneDocument(dm, isFile,
						fileDocumentflagMap, essclass));
				count++;
			}
		} catch (IOException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return count;
	}

	/***
	 * 将一条数据组装成lucene的保存单位Document
	 * 
	 * @param dataMap
	 * @param isFile
	 * @param fileDocumentflagMap
	 * @param essclass
	 * @return
	 * @throws Exception
	 */
	private Document buildOneDocument(HashMap<String, String> dataMap,
			boolean isFile, HashMap<String, String> fileDocumentflagMap,
			String essclass) throws Exception {
		// Store.YES 保存 可以查询 可以打印内容
		// Store.NO 不保存 可以查询 不可打印内容 由于不保存内容所以节省空间
		// StringField默认不分词，TextField默认分词
		Document doc = new Document();
		Iterator<Entry<String, String>> iter = dataMap.entrySet().iterator();
		String itemPrefix = null;
		String itemLable = null;

		itemPrefix = item_metadata_prefix;
		itemLable = T_label;

		StringBuilder labelBuilder = new StringBuilder();
		String value = null;
		Entry<String, String> entry = null;
		while (iter.hasNext()) {
			entry = iter.next();
			/** 各元数据字段的分词字段 用于数据授权 **/
			value = entry.getValue() == null ? "" : entry.getValue();
			doc.add(new TextField(itemPrefix + entry.getKey(), value,
					Field.Store.YES));
			labelBuilder.append(value).append(" ");
		}
		if (labelBuilder.length() > 0) {
			TextField labelField = new TextField(itemLable,
					labelBuilder.toString(), Field.Store.YES);
			labelField.setBoost(itemBoost);
			doc.add(labelField);
		}
		/** lujixiang 20150413   注释(SOA档案著录电子原文索引)  **/
		/**
		if ("1".equals(dataMap.get("DOCUMENTFLAG"))) {
			Map<String, String> filedsVals = this.getTextValForFile(dataMap
					.get("ESPATH"));
			if (filedsVals != null) {
				if (filedsVals.get("ZW") != null
						&& !"".equals(filedsVals.get("ZW"))) {
					Field contentField = new TextField(T_content,
							filedsVals.get("ZW"), Field.Store.YES);
					contentField.setBoost(itemBoost);
					doc.add(contentField);
				}
				if (filedsVals.get("FJ") != null
						&& !"".equals(filedsVals.get("FJ"))) {
					Field contentFJField = new TextField(T_FJ_content,
							filedsVals.get("FJ"), Field.Store.YES);
					contentFJField.setBoost(itemBoost);
					doc.add(contentFJField);
				}
				if (filedsVals.get("CLD") != null
						&& !"".equals(filedsVals.get("CLD"))) {
					Field contentCLDField = new TextField(T_CLD_content,
							filedsVals.get("CLD"), Field.Store.YES);
					contentCLDField.setBoost(itemBoost);
					doc.add(contentCLDField);
				}
			}
			doc.add(new StringField(DOCUMENTFLAG, "1", Field.Store.YES));
		} else {
			doc.add(new StringField(DOCUMENTFLAG, "0", Field.Store.YES));
		}
		
		
		doc.add(new StringField(STRUCTURETYPE, "innerFile", Field.Store.NO));
		**/
		
		/** lujixiang 20150413   文件收集电子原文索引,区分不同电子文件   ***/
		
		int attachMentCount = (null == dataMap.get("Attachments") ? 0 : Integer.parseInt(dataMap.get("Attachments"))) ;
		if (0 < attachMentCount) {
			
			String elecText = "" ;
			Long dataId = Long.parseLong(dataMap.get("id"));
			int i = 0;
			
			Map<String, String> attachMentMap = this.getTextValForFile(dataId);
			for (String title : attachMentMap.keySet()) {
				
				Field titleField = new TextField(T_content+"_title_"+i,	title, Field.Store.YES);
				titleField.setBoost(itemBoost);
				
				Field contentField = new TextField(T_content+"_"+i,	attachMentMap.get(title), Field.Store.YES);
				contentField.setBoost(itemBoost);
				
				doc.add(titleField);
				doc.add(contentField);
				i++;
				elecText += attachMentMap.get(title) ;
			}
			
			/** 电子文件所有文本内容，用于检索  **/
			Field textField = new TextField(T_content, elecText, Field.Store.YES);
			textField.setBoost(itemBoost);
			doc.add(textField);
			
		}
		
		
		/*doc.add(new StringField("struPath", dataMap.get("STRUPATH"),
				Field.Store.NO));
		doc.add(new StringField("treeNodeId", dataMap.get("TREENODEID"),
				Field.Store.NO));*/
		
		return doc;
	}

	/***
	 * 获取一条数据的原文ORC字符串集合
	 * 
	 * @param path
	 * @return
	 */
	@Deprecated 
	public Map<String, String> getTextValForFile(String path) {
		List<Map<String, String>> fieldLst = null;//this.businessEditWS.getAllFields(path);
		if (fieldLst == null || fieldLst.isEmpty()) {
			return null;
		}
		Map<String, Object> paraMap = new HashMap<String, Object>();
		if (ocrDir == null)
			ocrDir = null;//iLuceneDao.getAppConfigValue("OCRDir");
		if (SWFToolsDir == null)
			SWFToolsDir = null;//iLuceneDao.getAppConfigValue("SWFToolsDir");
		boolean hasOcrDir = false;
		if (!"".equals(ocrDir)) {
			hasOcrDir = true;
			if (!ocrDir.endsWith("/")) {
				ocrDir += "/";
			}
		}
		paraMap.get("fieldLst");
		List<String> fieldIdZWLst = new ArrayList<String>();// 正文
		List<String> fieldIdFJLst = new ArrayList<String>();// 附件
		List<String> fieldIdCLDLst = new ArrayList<String>();// 处理单
		HashMap<String, List<String>> ocrList = new HashMap<String, List<String>>();
		/*for (Map<String, String> map : fieldLst) {
			if ("正文".equals(map.get("ESFILETYPE"))) {
				if (isOCRDealedFile(map.get("ESTITLE"))) {
					if (hasOcrDir) {
						if (null == ocrList.get("zw"))
							ocrList.put("zw", new ArrayList<String>());
						ocrList.get("zw").add(ocrDir + map.get("ESTITLE"));
					}
				} else {
					fieldIdZWLst.add(map.get("ESFILEID"));
				}
			} else if ("附件".equals(map.get("ESFILETYPE"))) {
				if (isOCRDealedFile(map.get("ESTITLE"))) {
					if (hasOcrDir) {
						if (null == ocrList.get("fj"))
							ocrList.put("fj", new ArrayList<String>());
						ocrList.get("fj").add(ocrDir + map.get("ESTITLE"));
					}
				} else {
					fieldIdFJLst.add(map.get("ESFILEID"));
				}
			} else if ("处理单".equals(map.get("ESFILETYPE"))) {
				if (isOCRDealedFile(map.get("ESTITLE"))) {
					if (hasOcrDir) {
						if (null == ocrList.get("cld"))
							ocrList.put("cld", new ArrayList<String>());
						ocrList.get("cld").add(ocrDir + map.get("ESTITLE"));
					}
				} else {
					fieldIdCLDLst.add(map.get("ESFILEID"));
				}
			}
		}*/
		Map<String, String> rtnMap = new HashMap<String, String>();
		if (fieldIdZWLst.size() > 0) {
			paraMap.put("fieldLst", fieldIdZWLst);
			String rtnZWStr = this.iMainFileServer.getTextValForFile(paraMap);
			if (null != ocrList.get("zw")) {
				rtnZWStr += getOcrText(SWFToolsDir, ocrList.get("zw"));
			}
			rtnMap.put("ZW", rtnZWStr);
		} else if (null != ocrList.get("zw")) {
			String text = getOcrText(SWFToolsDir, ocrList.get("zw"));
			if (text.length() > 0)
				rtnMap.put("ZW", text);
		}
		if (fieldIdFJLst.size() > 0) {
			paraMap.put("fieldLst", fieldIdFJLst);
			String rtnFJStr = this.iMainFileServer.getTextValForFile(paraMap);
			if (null != ocrList.get("fj")) {
				rtnFJStr += getOcrText(SWFToolsDir, ocrList.get("fj"));
			}
			rtnMap.put("FJ", rtnFJStr);
		} else if (null != ocrList.get("fj")) {
			String text = getOcrText(SWFToolsDir, ocrList.get("fj"));
			if (text.length() > 0)
				rtnMap.put("FJ", text);
		}
		if (fieldIdCLDLst.size() > 0) {
			paraMap.put("fieldLst", fieldIdCLDLst);
			String rtnCLDStr = this.iMainFileServer.getTextValForFile(paraMap);
			if (null != ocrList.get("cld")) {
				rtnCLDStr += getOcrText(SWFToolsDir, ocrList.get("fj"));
			}
			rtnMap.put("CLD", rtnCLDStr);
		} else if (null != ocrList.get("cld")) {
			String text = getOcrText(SWFToolsDir, ocrList.get("cld"));
			if (text.length() > 0)
				rtnMap.put("CLD", text);
		}
		return rtnMap;
	}

	/**
	 * xiaoxiong 21040822 读取ORC对应文件数据
	 * 
	 * @param SWFToolsDir
	 * @param fields
	 * @return
	 */
	private String getOcrText(String SWFToolsDir, List<String> fields) {
		StringBuffer sb = new StringBuffer(1000);
		for (String item : fields) {
			item = item.substring(0, item.lastIndexOf(".") + 1) + "txt";
			System.out.println(item);
			File file = new File(item);
			if (!file.exists()) {
				item = item.substring(0, item.lastIndexOf(".") + 1) + "pdf";
				System.out.println(item);
				file = new File(item);
				if (!file.exists()) {
					continue;
				} else {
					sb.append(readerPdfFile(SWFToolsDir, item));
				}
			} else {
				sb.append(readerTxtFile(item));
			}
		}
		return sb.toString();
	}

	/**
	 * xiaoxiong 21040822 解析pdf文件 支持双层pdf的解析
	 * 
	 * @param filePath
	 *            文件路径
	 * @return
	 */
	private String readerPdfFile(String SWFToolsDir, String filePath) {
		String result = "";
		String pdfTxtFile = filePath.substring(0, filePath.length() - 4)
				+ ".txt";
		try {
			String success = "";//XpdftoText(SWFToolsDir, filePath, pdfTxtFile);
			if (!success.trim().equals(""))
				return "";
			// 读取提取生成的txt文件
			File txtFile = new File(pdfTxtFile);
			if (txtFile.exists() && txtFile.length() > 0) {
				result = null;//readerTxtFile(pdfTxtFile);
			}
			txtFile.delete();
			txtFile = null;
			return result;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "";
	}

	public Pair<List<HashMap<String, String>>, HashMap<String, String>> searchAllEspnDataMap(
			String nodeId, String id_structure, String childStruId,
			List<String> queryCols, HashMap<String, String> cidToMetadataMap,
			int startNo, int limit, boolean isFile) {
		List<HashMap<String, String>> datas = new ArrayList<HashMap<String, String>>();
		datas = ilucuneservice.searchAllEspnDataMap(nodeId, id_structure, childStruId, queryCols, cidToMetadataMap, startNo, limit, isFile);
		Pair<List<HashMap<String, String>>, HashMap<String, String>> pair = new Pair<List<HashMap<String, String>>, HashMap<String, String>>();
		pair.left = datas;
		HashMap<String, String> map = new HashMap<String, String>();
		StringBuffer ids =new StringBuffer(1000);
		for (HashMap<String, String> hashMap : datas) {
			ids.append(hashMap.get("id")+",");
		}
		if(ids.length()>0){
			ids.deleteCharAt(ids.length() - 1);
		}
		String[] str = ids.toString().split(",");
		for (String s : str) {
			map.put(s, String.valueOf(1));
		}
		pair.right = map;
		return pair;
	}
	
	/**
	 * lujixiang 20150413   获取电子原文文本内容集合
	 * 
	 * 为了区别不同电子文件和查询电子文件题名，格式如下{
	 * 《XXX标题》
	 * 	...XXX正文...
	 * }
	 * @param dataId: 收文收集id
	 * @return
	 */
	public Map<String, String> getTextValForFile(Long dataId){
		
		// 电子文件详情
		List<Map<String, Object>> fieldList = this.documentsCollectionService.getFileInfoById(dataId);
		// 返回结果：电子文件文本集合
		Map<String, String> result = new HashMap<String, String>();
		
		for (Map<String, Object> map : fieldList ) {
			
			String fileId = (String)map.get("esfileid");
			String title = (String)map.get("estitle");
			
			/** 是否图片文件  **/
			if (isOCRFile(title)) {
				
				/** 需要经过OCR原文转换  **/
				
			}
			else{
				
				List<String> fieldIdZWLst = new ArrayList<String>();//正文
				fieldIdZWLst.add(fileId);
				Map<String,Object> paraMap = new HashMap<String, Object>();
				paraMap.put("fieldLst", fieldIdZWLst);
				result.put(title, "《" + title + "》<br>" + this.iMainFileServer.getTextValForFile(paraMap));
			}
		}
		
		return result;
		
	}
	
	
	/**
	   * lujixiang 20150413    判断是否为图片文件
	   * @param filePath
	   * @return
	   */
	  private boolean isOCRFile(String filePath){
	      boolean isOCRDealedFile = false;
	      String tempFilePath = new String(filePath).toLowerCase() ;
	      if(tempFilePath.endsWith("jpg")){
	          isOCRDealedFile = true;
	      }else if(tempFilePath.endsWith("jpeg")){
	          isOCRDealedFile = true;
	      }else if(tempFilePath.endsWith("png")){
	          isOCRDealedFile = true;
	      }else if(tempFilePath.endsWith("bmp")){
	          isOCRDealedFile = true;
	      }else if(tempFilePath.endsWith("tiff") || tempFilePath.endsWith("tif")){
	          isOCRDealedFile = true;
	      }
	      return isOCRDealedFile;
	  }
	  
	  /**
	   * xiaoxiong 21040822
	   * 此方法将txt文本的内容全部转换成String
	   * @param FileName
	   * @param charset
	   * @return
	   * @throws IOException
	   */
	  private static String readerTxtFile(String FileName)  {   
	      /** 方法内部根据txt文档的编码来进行解析，不再通过传入的编码进行解析，避免不同编码的TXT文件解析后是乱码**/
	      BufferedReader reader = null ;
	       try{
	           /** 通过字节流获取文本文件的编码 **/
	           InputStream inputStream = new FileInputStream(FileName);  
	              byte[] head = new byte[3];  
	              inputStream.read(head);    
	              String code = "";  
	                  code = "gb2312";  
	              if (head[0] == -1 && head[1] == -2 )  
	                  code = "UTF-16";  
	              if (head[0] == -2 && head[1] == -1 )  
	                  code = "Unicode";  
	              if(head[0]==-17 && head[1]==-69 && head[2] ==-65)  
	                  code = "UTF-8";  
	              if (((head[0] == -28) && (head[1] == -72) && (head[2] == -70)) || ((head[0] == -27) && (head[1] == -123) && (head[2] == -77))){  
	                  code = "UTF-8";  
	              }
	          if (null!= inputStream){
	              inputStream.close() ;
	           }
	          /** 获取文本文件内容 **/
	          reader = new BufferedReader(new InputStreamReader(   
	                  new FileInputStream(FileName), code));   
	          String line = new String();   
	          StringBuffer temp = new StringBuffer();   
	          while ((line = reader.readLine()) != null) {   
	              temp.append( line);   
	          }   
	          return temp.toString();   
	      } catch(Exception ex){
	          return "" ;
	      } finally {
	          try {
	               if (null!= reader){
	                   reader.close();
	               }
	          } catch (IOException e) {
	              e.printStackTrace();
	          }
	      }
	}
	  

}
