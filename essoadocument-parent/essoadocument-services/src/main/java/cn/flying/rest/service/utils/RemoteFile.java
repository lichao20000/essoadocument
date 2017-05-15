package cn.flying.rest.service.utils;

import java.util.ArrayList;
import java.util.List;

/**
 * 远程文件对象,在一个RemoteFile对象中，只能有一个协议及一个host(服务器).
 * <p>
 * fullname---> [protocol] :// [hostAlias] / [remoteFile].<br>
 * <p>
 * 实例： FTP://srvalias1/data/tif/2000/0001.tif.<br>
 * <p>
 * FTP://srvalias1/data/tif/2000/0001.tif;a.jpg;b.doc.<br>
 * <p>
 * FTP://srvalias1/data/tif/2000/0001.tif;a.jpg;b.doc;aa<1-10>.tif.<br>
 * <p>
 * FTP://srvalias1/data/tif/2000/a<1-10>.tif.<br>
 * <p>
 * FTP://srvalias1/data/tif/2000/a<001-010>.tif.<br>
 * <p>
 * FTP://srvalias1/data/tif/2000/<1-10>.tif.<br>
 * <p>
 * FTP://srvalias1/data/tif/2000/<01-10>.tif.<br>
 * <p>
 * 增加SAPERION系统(ESECM协议)的支持.<br>
 * <p>
 * 模式：<ESECM>:// <HOSTALIALS> / <DDCNAME> : <XHDOC> / <FILENAME>.<br>
 * <p>
 * 实例：ESECM://SAPERION/esoaisfiles:8B11B3CFA3A041420F0001000000D400000000000000/
 * 1-2000-0033-0004DSCN4144.JPG.<br>
 * 
 * @author yang 2007-02-13
 * @version 3.0.6
 */
public class RemoteFile extends ArrayList<RemoteFile.Item> {
	private static final long serialVersionUID = -9176357053309271982L;
	/**
	 * 协议.
	 */
	private String protocol = null;
	/**
	 * 服务器别名.
	 */
	private String hostAlias = null;
	/**
	 * 远程文件.
	 */
	private String remoteFile = null;
	// 增加SAPERION系统文件的属性 modify by yang 2009-09-26
	/**
	 * 定义名.
	 */
	private String DDCName = null; // Definition Name
	/**
	 * 文档唯一ID.
	 */
	private String XHDOC = null; // 文档唯一ID
	/**
	 * 文档名称.
	 */
	private String sDocName = null; // 文档名称
	// modify by yang 2009-09-26
	/**
	 * "://"
	 */
	private String str = "://";

	/**
	 * 无参的构造方法.
	 */
	public RemoteFile() {
	}

	/**
	 * 构造方法，初始化远程文件对象.
	 * 
	 * @param fullname
	 *            "ftp://host1/data/tif/2000/<0001-0010>.tif";
	 */
	public RemoteFile(String fullname) {
		if (fullname == null || fullname.equals(""))
			return;
		if (!fullname.contains("/"))
			return;
		boolean hastype = fullname.contains(str); // 是否存在协议类型
		String type = null; // 协议类型
		String hostalias = null; // 服务器别名

		if (!hastype) {
			if (!fullname.startsWith("/"))
				fullname = "/" + fullname;
			type = "FTP";
			this.setRemoteFile(fullname);
		} else {
			type = getProtocol(fullname);
			if (type == null || "".equals(type))
				return;
			hostalias = getHostAlias(fullname);
			if (hostalias == null || "".equals(hostalias))
				return;
			this.setRemoteFile(getRemoteFile(fullname));
		}
		this.setProtocol(type);
		this.setHostAlias(hostalias);
		// 增加SAPERION系统文件的属性 modify by yang 2009-09-26
		if (type.equals(TYPE.ESECM.name())) {
			this.setDDCName(this.getPath(fullname));
			this.setXHDOC(this.getPath(fullname));
			this.setSDocName(fullname);
		}
		// end 2009-09-26
		String[] str = null;
		String header = null;
		if (fullname.contains(";")) {
			str = fullname.split(";");
			header = this.getPath(str[0]);
			for (String s : str) {
				if (s.contains("<") && s.contains(">")) {
					List<String> ls = getNameList(s);
					for (String ss : ls) {
						this.add(hostalias, header, ss, this.getSuffix(s), type);
					}
				} else {
					this.add(hostalias, header, this.getName(s),
							this.getSuffix(s), type);
				}
			}
		} else {
			if (fullname.contains("<") && fullname.contains(">")) {
				List<String> ls = getNameList(this.getName(fullname));
				for (String ss : ls) {
					this.add(hostalias, this.getPath(fullname), ss,
							this.getSuffix(fullname), type);
				}
			} else {
				this.add(hostalias, this.getPath(fullname),
						this.getName(fullname), this.getSuffix(fullname), type);
			}
		}
	}

	/**
	 * 构造方法，初始化远程文件对象.
	 * 
	 * @author niuhe 20130618
	 * @param fullname
	 *            远程文件路径 ftp://host1/data/tif/2000/<0001-0010>.tif
	 * @param isOnlyOneFile
	 *            是否只存在一个文件，如果fullname仅代表一个文件时，改参数为true；否则为false。 <br>
	 *            为防止特殊字符造成的错误，该参数为true时，不再对fullname进行split()操作。
	 */
	public RemoteFile(String fullname, boolean isOnlyOneFile) {
		RemoteFile remoteFile = new RemoteFile();
		if (fullname == null || fullname.equals(""))
			return;
		if (!fullname.contains("/"))
			return;
		boolean hastype = fullname.contains(str); // 是否存在协议类型
		String type = null; // 协议类型
		String hostalias = null; // 服务器别名

		if (!hastype) {
			if (!fullname.startsWith("/"))
				fullname = "/" + fullname;
			type = "FTP";
			remoteFile.setRemoteFile(fullname);
		} else {
			type = getProtocol(fullname);
			if (type == null || "".equals(type))
				return;
			hostalias = getHostAlias(fullname);
			if (hostalias == null || "".equals(hostalias))
				return;
			remoteFile.setRemoteFile(getRemoteFile(fullname));
		}
		remoteFile.setProtocol(type);
		remoteFile.setHostAlias(hostalias);
		if (type.equals(TYPE.ESECM.name())) {
			remoteFile.setDDCName(this.getPath(fullname));
			remoteFile.setXHDOC(this.getPath(fullname));
			remoteFile.setSDocName(fullname);
		}

		if (isOnlyOneFile) {
			this.add(hostalias, this.getPath(fullname), this.getName(fullname),
					this.getSuffix(fullname), type);
		} else {
			String[] str = null;
			String header = null;

			if (fullname.contains(";")) {
				str = fullname.split(";");
				header = this.getPath(str[0]);
				for (String s : str) {
					if (s.contains("<") && s.contains(">")) {
						List<String> ls = getNameList(s);
						for (String ss : ls) {
							this.add(hostalias, header, ss, this.getSuffix(s),
									type);
						}
					} else {
						this.add(hostalias, header, this.getName(s),
								this.getSuffix(s), type);
					}
				}
			} else {
				if (fullname.contains("<") && fullname.contains(">")) {
					List<String> ls = getNameList(this.getName(fullname));
					for (String ss : ls) {
						this.add(hostalias, this.getPath(fullname), ss,
								this.getSuffix(fullname), type);
					}
				} else {
					this.add(hostalias, this.getPath(fullname),
							this.getName(fullname), this.getSuffix(fullname),
							type);
				}
			}
		}
	}

	/**
	 * 获取除去协议及服务器别名的远程路径及文件部分[remoteFile]可用于电子文件的显示等.
	 * 
	 * @return String 返回远程文件.
	 */
	public String getRemoteFile() {
		return remoteFile;
	}

	/**
	 * 设置远程文件.
	 * 
	 * @param remoteFile
	 *            远程文件.
	 */
	public void setRemoteFile(String remoteFile) {
		this.remoteFile = remoteFile;
	}

	/**
	 * 设置协议.
	 * 
	 * @param protocol
	 *            协议.
	 */
	public void setProtocol(String protocol) {
		this.protocol = protocol;
	}

	/**
	 * 设置服务器别名.
	 * 
	 * @param host
	 *            服务器别名.
	 */
	public void setHostAlias(String host) {
		this.hostAlias = host;
	}

	/**
	 * 获取协议类型.
	 * 
	 * @return String 返回协议类型.
	 */
	public String getProtocol() {
		return this.protocol;
	}

	/**
	 * 获取服务器别名
	 * 
	 * @return String 返回服务器别名.
	 */
	public String getHostAlias() {
		return this.hostAlias;
	}

	/* 新增SAPERION系统属性的get、set方法* 2009-09-26 */
	/**
	 * 获得定义名.
	 * 
	 * @return String 返回定义名.
	 */
	public String getDDCName() {
		return DDCName;
	}

	/**
	 * 设置定义名.
	 * 
	 * @param ddcname
	 *            定义名.
	 */
	public void setDDCName(String ddcname) {
		if (ddcname.startsWith("/"))
			ddcname = ddcname.substring(1);
		if (ddcname.contains(":")) {
			DDCName = ddcname.substring(0, ddcname.indexOf(":"));
		} else {
			DDCName = ddcname;
		}
	}

	/**
	 * 获得文档唯一id.
	 * 
	 * @return String 返回文档唯一id.
	 */
	public String getXHDOC() {
		return XHDOC;
	}

	/**
	 * 设置文档唯一id.
	 * 
	 * @param xhdoc
	 *            文档唯一id.
	 */
	public void setXHDOC(String xhdoc) {
		if (xhdoc.contains(":")) {
			XHDOC = xhdoc.substring(xhdoc.indexOf(":") + 1);
		} else {
			XHDOC = xhdoc;
		}

	}

	/**
	 * 获得文档名称.
	 * 
	 * @return String 返回文档名称.
	 */
	public String getSDocName() {
		return sDocName;
	}

	/**
	 * 设置文档名称.
	 * 
	 * @param docName
	 *            文档名称.
	 */
	public void setSDocName(String docName) {
		if (docName.contains("/")) {
			sDocName = docName.substring(docName.lastIndexOf("/") + 1);
		} else {
			sDocName = docName;
		}
	}

	/* 新增SAPERION系统属性的get、set方法 2009-09-26 end */

	/**
	 * 新建远程文件条目.
	 * 
	 * @param path
	 *            全路径.
	 * @param name
	 *            文件名.
	 * @param suffix
	 *            后缀.
	 * @param type
	 *            传输协议.
	 * @return Item 返回远程文件条目.
	 */
	public Item newItem(String path, String name, String suffix, TYPE type) {
		return newItem(null, path, name, suffix, type);
	}

	/**
	 * 新建远程文件条目.
	 * 
	 * @param host
	 *            服务器别名.
	 * @param path
	 *            全路径.
	 * @param name
	 *            文件名.
	 * @param suffix
	 *            后缀.
	 * @param type
	 *            传输协议.
	 * @return Item 返回远程文件条目.
	 */
	public Item newItem(String host, String path, String name, String suffix,
			TYPE type) {
		return new Item(host, path, name, suffix, type);
	}

	/**
	 * 新建远程文件条目.
	 * 
	 * @param path
	 *            全路径.
	 * @param name
	 *            文件名.
	 * @param suffix
	 *            后缀.
	 * @param type
	 *            传输协议.
	 * @return Item 返回远程文件条目.
	 */
	public Item newItem(String path, String name, String suffix, String type) {
		return newItem(null, path, name, suffix, type);
	}

	/**
	 * 新建远程文件条目.
	 * 
	 * @param host
	 *            服务器别名.
	 * @param path
	 *            全路径.
	 * @param name
	 *            文件名.
	 * @param suffix
	 *            后缀.
	 * @param type
	 *            传输协议.
	 * @return Item 返回远程文件条目.
	 */
	public Item newItem(String host, String path, String name, String suffix,
			String type) {
		if (type == null)
			type = "";
		type = type.trim().toUpperCase();
		if ("RTSP".equals(type)) {
			return new Item(host, path, name, suffix, TYPE.RTSP);
		} else if ("HTTP".equals(type)) {
			return new Item(host, path, name, suffix, TYPE.HTTP);
		} else if ("ESECM".equals(type)) {
			return new Item(host, path, name, suffix, TYPE.ESECM);
		} else if ("WEBDAV".equals(type)) {
			return new Item(host, path, name, suffix, TYPE.WEBDAV);
		} else {
			return new Item(host, name, suffix, TYPE.FTP);
		}
	}

	/**
	 * 添加远程文件条目.
	 * 
	 * @param path
	 *            全路径.
	 * @param name
	 *            文件名.
	 * @param suffix
	 *            后缀.
	 * @param type
	 *            传输协议.
	 */
	public void add(String path, String name, String suffix, TYPE type) {
		this.add(new Item(path, name, suffix, type));
	}

	/**
	 * 添加远程文件条目.
	 * 
	 * @param path
	 *            全路径.
	 * @param name
	 *            文件名.
	 * @param suffix
	 *            后缀.
	 * @param type
	 *            传输协议.
	 */
	public void add(String path, String name, String suffix, String type) {
		this.add(new Item(path, name, suffix, type));
	}

	/**
	 * 添加远程文件条目.
	 * 
	 * @param host
	 *            服务器别名.
	 * @param path
	 *            全路径.
	 * @param name
	 *            文件名.
	 * @param suffix
	 *            后缀.
	 * @param type
	 *            传输协议.
	 */
	public void add(String host, String path, String name, String suffix,
			String type) {
		this.add(new Item(host, path, name, suffix, type));
	}

	/**
	 * 添加远程文件条目.
	 * 
	 * @param host
	 *            服务器别名.
	 * @param path
	 *            全路径.
	 * @param name
	 *            文件名.
	 * @param suffix
	 *            后缀.
	 * @param type
	 *            传输协议.
	 */
	public void add(String host, String path, String name, String suffix,
			TYPE type) {
		this.add(new Item(host, path, name, suffix, type));
	}

	/**
	 * 获得远程文件.
	 * 
	 * @param fullname
	 *            远程文件.
	 * @return String 返回远程文件.
	 */
	private String getRemoteFile(String fullname) {
		int pos = fullname.indexOf("/", fullname.indexOf(str) + str.length());
		return fullname.substring(pos);
	}

	/* 2007-03-19 add */
	/**
	 * 获得服务器别名.
	 * 
	 * @param fullname
	 *            服务器别名.
	 * @return String 返回服务器别名.
	 */
	private String getHostAlias(String fullname) {
		int pos = fullname.indexOf(str);
		String protocol = this.getProtocol(fullname);
		String s = fullname.substring(pos + str.length(),
				fullname.indexOf("/", pos + str.length()));
		//
		if (s == null || s.equals(""))
			return "localhost";
		return s;
	}

	/* 2007-03-19 add */
	/**
	 * 获得传输协议.
	 * 
	 * @param fullname
	 *            协议名.
	 * @return String 返回传输协议.
	 */
	private String getProtocol(String fullname) {
		String s = fullname.substring(0, fullname.indexOf(str));
		if (s == null || s.equals(""))
			return "FTP";
		return s;
	}

	// 输入/data/tif/2000/0001.tif 获取路径 /data/tif/2000
	/**
	 * 获得全路径.
	 * 
	 * @param fullname
	 *            /data/tif/2000/0001.tif
	 * @return /data/tif/2000
	 */
	private String getPath(String fullname) {
		if (fullname.indexOf("/") < 0)
			return fullname;
		if (!fullname.contains(str)) {
			if (fullname.endsWith("/"))
				return fullname.substring(0, fullname.lastIndexOf("/"));
			return fullname.substring(0, fullname.lastIndexOf("/"));
		} else {
			int ipos = fullname.indexOf(str) + str.length();

			return fullname.substring(fullname.indexOf("/", ipos),
					fullname.lastIndexOf("/"));

			// huangheng 20070917 确保取到正确的地址,确保不报异常 start
			// String tempPath =
			// fullname.substring(fullname.indexOf("/",ipos),fullname.lastIndexOf("/"));
			// if (tempPath.indexOf("/") == tempPath.lastIndexOf("/")){
			// return
			// fullname.substring(fullname.indexOf("/",ipos),fullname.length())
			// ;
			// }
			// return tempPath ;
		}
		// huangheng 20070917 确保取到正确的地址,确保不报异常 end
	}

	// 输入/data/tif/2000/0001.tif 获取路径 0001
	/**
	 * 获得文件名.
	 * 
	 * @param fullname
	 *            /data/tif/2000/0001.tif.
	 * @return String 返回文件名0001.
	 */
	private String getName(String fullname) {
		if (fullname.indexOf(".") < 0)
			return fullname.substring(fullname.lastIndexOf("/") + 1);
		return fullname.substring(fullname.lastIndexOf("/") + 1,
				fullname.lastIndexOf("."));
	}

	// 输入/data/tif/2000/0001.tif 获取路径 tif
	/**
	 * 获得后缀名.
	 * 
	 * @param fullname
	 *            /data/tif/2000/0001.tif.
	 * @return String 返回后缀名tif.
	 */
	private String getSuffix(String fullname) {
		if (fullname.indexOf(".") < 0)
			return null;
		return fullname.substring(fullname.lastIndexOf(".") + 1);
	}

	//
	// 输入a<1-10>.tif 返回名称列表
	/**
	 * 获得文件名列表.
	 * 
	 * @param name
	 *            文件名a<1-10>.tif.
	 * @return List<String> 返回文件名列表.
	 */
	private List<String> getNameList(String name) {
		if (!name.contains("<"))
			return null;
		if (!name.contains(">"))
			return null;
		if (!name.contains("-"))
			return null;
		List<String> ls = new ArrayList<String>();
		String header = name.substring(0, name.indexOf("<"));
		String range = name.substring(name.indexOf("<") + 1, name.indexOf(">"));
		String first = range.substring(0, range.indexOf("-"));
		String last = range.substring(range.indexOf("-") + 1);
		boolean b = true; // 是否补零
		int length = first.length();
		if (length != last.length())
			b = false;
		for (int i = Integer.parseInt(first); i <= Integer.parseInt(last); i++) {
			if (b) {
				ls.add(header + get0Str(i, length));
			} else {
				ls.add(header + i);
			}
		}
		return ls;
	}

	/**
	 * 在数字之前补零，返回字符串.
	 * 
	 * @param num
	 *            数字.
	 * @param length
	 *            长度.
	 * @return String 返回补零的数字.
	 */
	private String get0Str(int num, int length) {
		int len = (num + "").length();
		if (len >= length)
			return num + "";
		String ret = "";
		for (int i = 1; i <= length - len; i++) {
			ret += "0";
		}
		return ret + num;
	}

	/**
	 * 远程文件对象条目.
	 */
	public class Item {
		/**
		 * "://".
		 */
		public String str = "://";
		/**
		 * 文件传输协议类型.
		 */
		public TYPE protocol = TYPE.FTP; // 文件传输协议类型
		/**
		 * 服务器别名.
		 */
		public String hostAlias = null; // 服务器别名
		/**
		 * 全路径.
		 */
		public String path = null; // 全路径
		/**
		 * 文件名.
		 */
		public String name = null; // 文件名
		/**
		 * 后缀.
		 */
		public String suffix = null; // 后缀
		/**
		 * 虚拟路径.
		 */
		public String virtualDir = null; // 虚拟路径
		/**
		 * 相对路径.
		 */
		public String relativeDir = null; // 相对路径
		// add by yang 2009-09-26 SAPERION内容管理系统协议
		/**
		 * SAPERION系统中的表名definition.
		 */
		public String DDCName = null; // SAPERION系统中的表名definition
		/**
		 * SAPERION系统中文档的唯一标识.
		 */
		public String XHDOC = null; // SAPERION系统中文档的唯一标识
		// 2009-09-26 end
		/**
		 * 值.
		 */
		public int value = 0;

		/**
		 * 构造方法，初始化远程文件对象条目.
		 * 
		 * @param path
		 *            全路径.
		 * @param name
		 *            文件名.
		 * @param suffix
		 *            后缀.
		 */
		public Item(String path, String name, String suffix) {
			setPath(path);
			setName(name);
			setSuffix(suffix);
			setType(TYPE.FTP);// 默认为FTP协议
			setVirtualDir(path);
			setRelativeDir(path);
		}

		/**
		 * 构造方法,初始化远程文件对象条目.
		 * 
		 * @param path
		 *            全路径.
		 * @param name
		 *            文件名.
		 * @param suffix
		 *            后缀.
		 * @param type
		 *            传输协议类型.
		 */
		public Item(String path, String name, String suffix, String type) {
			setPath(path);
			setName(name);
			setSuffix(suffix);
			setVirtualDir(path);
			if (type.toUpperCase().equals("FTP")) {
				setType(TYPE.FTP);
			} else if (type.toUpperCase().equals("HTTP")) {
				setType(TYPE.HTTP);
			} else if (type.toUpperCase().equals("WEBDAV")) {
				setType(TYPE.WEBDAV);
			} else if (type.toUpperCase().equals("ESECM")) {
				// add by yang 2009-09-19 SAPERION内容管理系统协议
				setType(TYPE.ESECM);
				this.setDDCName(path);
				this.setXHDOC(path);
			} else {
				setType(TYPE.RTSP);
			}
			setRelativeDir(path);
		}

		/**
		 * 构造方法,初始化远程文件对象条目.
		 * 
		 * @param path
		 *            全路径.
		 * @param name
		 *            文件名.
		 * @param suffix
		 *            后缀.
		 * @param type
		 *            传输协议类型.
		 */
		public Item(String path, String name, String suffix, TYPE type) {
			setPath(path);
			setName(name);
			setSuffix(suffix);
			setType(type);
			setVirtualDir(path);
			setRelativeDir(path);
			// add by yang 2009-09-26 SAPERION内容管理系统协议
			if (type.name().toUpperCase().equals("ESECM")) {
				this.setDDCName(path);
				this.setXHDOC(path);
			}
		}

		/**
		 * 构造方法,初始化远程文件对象条目.
		 * 
		 * @param host
		 *            服务器别名.
		 * @param path
		 *            全路径.
		 * @param name
		 *            文件名.
		 * @param suffix
		 *            后缀.
		 * @param type
		 *            传输协议类型.
		 */
		public Item(String host, String path, String name, String suffix,
				TYPE type) {
			setHostAlias(host);
			setPath(path);
			setName(name);
			setSuffix(suffix);
			setType(type);
			setVirtualDir(path);
			setRelativeDir(path);
			// add by yang 2009-09-26 SAPERION内容管理系统协议
			if (type.name().toUpperCase().equals("ESECM")) {
				this.setDDCName(path);
				this.setXHDOC(path);
			}
		}

		/**
		 * 构造方法,初始化远程文件对象条目.
		 * 
		 * @param host
		 *            服务器别名.
		 * @param path
		 *            全路径.
		 * @param name
		 *            文件名.
		 * @param suffix
		 *            后缀.
		 * @param type
		 *            传输协议类型.
		 */
		public Item(String host, String path, String name, String suffix,
				String type) {
			setHostAlias(host);
			setPath(path);
			setName(name);
			setSuffix(suffix);
			setVirtualDir(path);
			if (type.toUpperCase().equals("RTSP")) {
				setType(TYPE.RTSP);
			} else if (type.toUpperCase().equals("HTTP")) {
				setType(TYPE.HTTP);
			} else if (type.toUpperCase().equals("FTP")) {
				setType(TYPE.FTP);
			} else if (type.toUpperCase().equals("WEBDAV")) {
				setType(TYPE.WEBDAV);
			} else if (type.toUpperCase().equals("ESECM")) {
				// add by yang 2009-09-19 SAPERION内容管理系统协议
				setType(TYPE.ESECM);
				this.setDDCName(path);
				this.setXHDOC(path);
			} else if (type.toUpperCase().equals("RTMP")) {// liuqiang 20100917
															// 增加对RTMP协议的支持
				setType(TYPE.RTMP);
			} else { // liukaiyuan 20080519 cm协议
				setType(TYPE.DB2CM);
			}
			setRelativeDir(path);
		}

		/**
		 * 设置服务器别名.
		 * 
		 * @param hostAlias
		 *            服务器别名.
		 */
		public void setHostAlias(String hostAlias) {
			this.hostAlias = hostAlias;
		}

		/**
		 * 设置全路径.
		 * 
		 * @param path
		 *            全路径.
		 */
		public void setPath(String path) {
			this.path = path;
		}

		/**
		 * 设置文件名.
		 * 
		 * @param name
		 *            文件名.
		 */
		public void setName(String name) {
			this.name = name;
		}

		/**
		 * 设置后缀名.
		 * 
		 * @param suffix
		 *            后缀名.
		 */
		public void setSuffix(String suffix) {
			this.suffix = suffix;
		}

		/**
		 * 设置协议类型.
		 * 
		 * @param type
		 *            协议类型.
		 */
		public void setType(TYPE type) {
			this.protocol = type;
			this.value = type.value();
		}

		/* 新增SAPERION系统属性的get、set方法* 2009-09-26 */
		/**
		 * 获得SAPERION系统中的表名definition.
		 * 
		 * @return String 返回SAPERION系统中的表名definition.
		 */
		public String getDDCName() {
			return DDCName;
		}

		/**
		 * 设置SAPERION系统中的表名definition
		 * 
		 * @param ddcname
		 *            SAPERION系统中的表名definition
		 */
		public void setDDCName(String ddcname) {
			if (ddcname.contains(":")) {
				DDCName = ddcname.substring(0, ddcname.indexOf(":"));
			} else {
				DDCName = ddcname;
			}
		}

		/**
		 * 获得SAPERION系统中文档的唯一标识.
		 * 
		 * @return String 返回SAPERION系统中文档的唯一标识.
		 */
		public String getXHDOC() {
			return XHDOC;
		}

		/**
		 * 设置SAPERION系统中文档的唯一标识.
		 * 
		 * @param xhdoc
		 *            SAPERION系统中文档的唯一标识.
		 */
		public void setXHDOC(String xhdoc) {
			if (xhdoc.contains(":")) {
				XHDOC = xhdoc.substring(xhdoc.indexOf(":") + 1);
			} else {
				XHDOC = xhdoc;
			}

		}

		/**
		 * 设置虚拟路径.
		 * 
		 * @param path
		 *            虚拟路径.
		 */
		public void setVirtualDir(String path) {
			int pos = path.indexOf("/", 1);
			this.virtualDir = path
					.substring(0, pos == -1 ? path.length() : pos);
		}

		/**
		 * 设置相对路径.
		 * 
		 * @param path
		 *            相等路径.
		 */
		public void setRelativeDir(String path) {
			int pos = path.indexOf("/", 1);
			this.relativeDir = path.substring(pos == -1 ? path.length() : pos);
		}

		/**
		 * 获得全路径.
		 * 
		 * @return String /data/tif/2000/0001.tif
		 */
		public String getFullName() {
			return this.path + "/" + this.name + "." + this.suffix;
		}

		/* 新增SAPERION系统属性的get、set方法* 2009-09-26 */
		/**
		 * 获得文件名.
		 * 
		 * @return String 返回文件名.
		 */
		public String getFileName() {
			return this.name + "." + this.suffix;
		}

		// 获取 /data/tif/2000/0001.txt
		/**
		 * 获得后缀名相同的文件.
		 * 
		 * @return String 返回后缀名相同的文件.
		 */
		public String getSameSuffixFile(String suffix) {
			return this.path + "/" + this.name + "." + suffix;
		}

		public boolean equals(RemoteFile.Item item2) {
			if (item2 == this)
				return true;
			if (item2 == null)
				return false;
			if (protocol == null)
				return false;
			if (this.path == item2.path && this.name == item2.name
					&& this.suffix == item2.suffix && value == item2.value)
				return true;
			if (path == null)
				return false;
			if (name == null)
				return false;
			if (!this.path.equals(item2.path))
				return false;
			if (!this.name.equals(item2.name))
				return false;
			if (!this.suffix.equals(item2.suffix))
				return false;
			return protocol.equals(item2.protocol);
		}

		public String toString() {
			// return
			// this.protocol+this.str+this.hostAlias+this.path+"/"+this.name+"."+this.suffix;//liuqiang
			// 20101220 如果没有后缀(扩展名的话会变成xx.null),故此处做处理。
			if (null != this.suffix) {
				return this.protocol + this.str + this.hostAlias + this.path
						+ "/" + this.name + "." + this.suffix;
			} else {
				return this.protocol + this.str + this.hostAlias + this.path
						+ "/" + this.name;
			}
		}
	}

	/**
	 * 传输协议类型.
	 */
	public static enum TYPE {
		/**
		 * FTP协议.
		 */
		FTP {
			public int value() {
				return 0;
			}
		},
		/**
		 * HTTP协议.
		 */
		HTTP {
			public int value() {
				return 1;
			}
		},
		/**
		 * RTSP协议.
		 */
		RTSP {
			public int value() {
				return 2;
			}
		},
		/**
		 * cm协议
		 */
		DB2CM { // liukaiyuan 20080519 cm协议
			public int value() {
				return 3;
			}
		},
		/**
		 * saperion协议
		 */
		ESECM { // YANG 20090909 saperion协议
			public int value() {
				return 4;
			}
		},
		/**
		 * RTMP协议.
		 */
		RTMP { // add by mayingcai 20100202 RTMP协议
			public int value() {
				return 5;
			}
		},
		/**
		 * WEBDAV协议.
		 */
		WEBDAV { // add by wuxing 20100412 WEBDAV协议
			public int value() {
				return 6;
			}
		},
		LOCAL { // zhengfang 20120712 add LOCAL协议
			public int value() {
				return 7;
			}
		};
		/**
		 * 获得协议类型值.
		 * 
		 * @return int
		 *         返回0=FTP协议/1=HTTP协议/2=RTSP协议/3=cm协议/4=saperion协议/5=RTMP协议/6
		 *         =WEBDAV协议.
		 */
		abstract int value();
	}

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		/*
		 * data/tif/2000/0001.tif /data/tif/2000/0001.tif;a.jpg;b.doc
		 * /data/tif/2000/0001.tif;a.jpg;b.doc;aa<1-10>.tif
		 * /data/tif/2000/a<1-10>.tif /data/tif/2000/a<001-010>.tif
		 * /data/tif/2000/<1-10>.tif /data/tif/2000/<01-10>.tif
		 */
		String s = "ftp://host1/data/tif/2000/<0001-0010>.tif";
		RemoteFile op = new RemoteFile(s);
		System.out.println(op.toString());
		System.out.println(op.equals(op.clone()));
		for (RemoteFile.Item item : op) {
			System.out.print(item.toString());
			System.out.println("--" + item.hostAlias + "--" + item.path + "--"
					+ item.virtualDir + "--" + item.relativeDir + "--"
					+ item.name);

		}

		String a = "ftp://fan/data/aa.txt";
		RemoteFile aa = new RemoteFile(a);
		System.out.println(aa.getHostAlias() + "==" + aa.get(0).name
				+ aa.get(0).suffix);

		// ESECM
		System.out.println("----------------ESECM------------------");
		s = "ESECM://SAPERION/esoaisfiles:8B11B3CFA3A041420F0001000000D400000000000000/1-2000-0033-0004DSCN4144.JPG";
		RemoteFile ecm = new RemoteFile(s);
		System.out.println(ecm.toString());
		System.out.println(ecm.equals(ecm.clone()));
		System.out.println(ecm.getRemoteFile());
		System.out.println("hostAlias = " + ecm.getHostAlias());
		System.out.println("DDCName = " + ecm.getXHDOC());
		System.out.println("sDocName = " + ecm.getSDocName());
	}

}
