package cn.flying.rest.service.workflow;

import java.io.File;
import java.io.Serializable;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Properties;

import org.jdom.Document;
import org.jdom.Element;
import org.jdom.input.SAXBuilder;

import com.opensymphony.workflow.FactoryException;
import com.opensymphony.workflow.loader.WorkflowDescriptor;
import com.opensymphony.workflow.loader.WorkflowLoader;
import com.opensymphony.workflow.loader.XMLWorkflowFactory;

/**
 * @author xiaoxiong 20140604 
 * 实现自己的工作流工厂
 */
public class MySpringWorkflowFactory extends XMLWorkflowFactory{

	private static final long serialVersionUID = 1L;
	
	private String resource;
	
	/**
	 *  此为是否在启动系统自动发布流程
	 *  开发时：此值需要设置为false；此时每次重启都会自动发布流程
	 *  真实运行环境：此值需要设置为true；此时重启时，不会发布流程 
	 */
	private String release;

	public void setReload(String reload){
	  this.reload = Boolean.valueOf(reload).booleanValue();
	}

	public void setResource(String resource) {
	  this.resource = resource;
	}
	
	public void setRelease(String release) {
		this.release = release;
	}
	
	public String getRelease() {
		return this.release;
	}
	
	public void init() {
	  try {
	    Properties props = new Properties();
	    props.setProperty("reload", getReload());
	    props.setProperty("resource", getResource());
	    super.init(props);
	    this.initDone();
	  } catch (FactoryException e) {
	    throw new RuntimeException(e);
	  }
	}
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	@Override
	public void initDone() throws FactoryException {
	    this.reload = getProperties().getProperty("reload", "false").equals("true");
	    String name = getProperties().getProperty("resource", "workflows.xml");
	    String classPath = getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
	    int pos = classPath.indexOf("WEB-INF");
	    String appPath = classPath.substring(0, pos);
	    String b = null;
	    File file1 = new File(b, appPath + name);
	    SAXBuilder saxBuilder = new SAXBuilder();
	    try
	    {
	      Document doc1 = saxBuilder.build(file1);
	      Element rootE = doc1.getRootElement();
	      String basedir = getBaseDir(rootE);
	      List child = rootE.getChildren();
	      this.workflows = new HashMap();
	      for (int i = 0; i < child.size(); i++) {
	        Element e = (Element)child.get(i);
	        WorkflowConfig config = new WorkflowConfig(basedir, e.getAttributeValue("type"), e.getAttributeValue("location"));
	        this.workflows.put(e.getAttribute("name").getValue(), config);
	      }
	    }
	    catch (Exception e) {
	      e.printStackTrace();
	    }
	}
	
	protected String getBaseDir(Element root){
	    String basedir = root.getAttributeValue("basedir");
	    if(basedir == null){
	    	return null ;
	    }
	    if (basedir.length() == 0){
	      return null;
	    }

	    if (new File(basedir).isAbsolute()){
	      return basedir;
	    }
	    return new File(System.getProperty("user.dir"), basedir).getAbsolutePath();
	}

	private String getReload() {
	  return String.valueOf(this.reload);
	}

	private String getResource() {
	  return this.resource;
	}
	
	static class WorkflowConfig implements Serializable { 
		private static final long serialVersionUID = 4939957922893602958L;
	    String location;
	    String type;
	    URL url;
	    WorkflowDescriptor descriptor;
	    long lastModified;
	
	    @SuppressWarnings("deprecation")
		public WorkflowConfig(String basedir, String type, String location) { if ("URL".equals(type))
	        try {
	          this.url = new URL(location);
	
	          File file = new File(this.url.getFile());
	
	          if (file.exists())
	            this.lastModified = file.lastModified();
	        }
	        catch (Exception ex) {
	        }
	      else if ("file".equals(type))
	        try {
	        	File file = new File(basedir, location);
	            this.url = file.toURL();
	            this.lastModified = file.lastModified();
	        }
	        catch (Exception ex) {
	        }
	      else this.url = Thread.currentThread().getContextClassLoader().getResource(location);
	
	      this.type = type;
	      this.location = location;
	    }
    }
	
	public WorkflowDescriptor getWorkflow(String name, boolean validate) throws FactoryException {
	    WorkflowConfig c = (WorkflowConfig)this.workflows.get(name);

	    if (c == null) {
	      throw new FactoryException("Unknown workflow name \"" + name + '"');
	    }

	    if (c.descriptor != null) {
	      if (this.reload) {
	        File file = new File(c.url.getFile());

	        if ((file.exists()) && (file.lastModified() > c.lastModified)) {
	          c.lastModified = file.lastModified();
	          loadWorkflow(c, validate);
	        }
	      }
	    }
	    else loadWorkflow(c, validate);

	    c.descriptor.setName(name);

	    return c.descriptor;
	}
	
	private void loadWorkflow(WorkflowConfig c, boolean validate) throws FactoryException {
	    try {
	      c.descriptor = WorkflowLoader.load(c.url, validate);
	    } catch (Exception e) {
	      throw new FactoryException("Error in workflow descriptor: " + c.url, e);
	    }
	  }
}
