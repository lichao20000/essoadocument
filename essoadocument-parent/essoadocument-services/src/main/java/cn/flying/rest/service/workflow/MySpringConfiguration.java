package cn.flying.rest.service.workflow;

import com.opensymphony.workflow.config.Configuration ;
import com.opensymphony.workflow.FactoryException;
import com.opensymphony.workflow.StoreException;
import com.opensymphony.workflow.loader.WorkflowDescriptor;
import com.opensymphony.workflow.loader.WorkflowFactory;
import com.opensymphony.workflow.spi.WorkflowStore;
import com.opensymphony.workflow.util.DefaultVariableResolver;
import com.opensymphony.workflow.util.VariableResolver;
import java.net.URL;
import java.util.Map;

/**
 * @author xiaoxiong 20140604
 * 实现自己的工作流配置读取
 */
public class MySpringConfiguration implements Configuration {
	
	private VariableResolver variableResolver = new DefaultVariableResolver();
	private WorkflowFactory factory;
	private WorkflowStore store;

	public void setFactory(WorkflowFactory factory)
	{
	  this.factory = factory;
	}
	
	public WorkflowFactory getFactory()
	{
		return this.factory ;
	}

	public boolean isInitialized() {
	  return false;
	}

	public boolean isModifiable(String name) {
	  return this.factory.isModifiable(name);
	}

	public String getPersistence() {
	  return null;
	}

	public Map<?, ?> getPersistenceArgs() {
	  return null;
	}

	public void setStore(WorkflowStore store) {
	  this.store = store;
	}

	public void setVariableResolver(VariableResolver variableResolver) {
	  this.variableResolver = variableResolver;
	}

	public VariableResolver getVariableResolver() {
	  return this.variableResolver;
	}

	public WorkflowDescriptor getWorkflow(String name) throws FactoryException {
	  WorkflowDescriptor workflow = this.factory.getWorkflow(name);

	  if (workflow == null) {
	    throw new FactoryException("Unknown workflow name");
	  }

	  return workflow;
	}

	public String[] getWorkflowNames() throws FactoryException {
	  return this.factory.getWorkflowNames();
	}

	public WorkflowStore getWorkflowStore() throws StoreException {
	  return this.store;
	}

	/**
	 * 工作流重新发布重要实现方法
	 * @throws FactoryException
	 */
	public void reload() throws FactoryException {
		this.factory.initDone();
	}

	public boolean removeWorkflow(String workflow) throws FactoryException {
	  return this.factory.removeWorkflow(workflow);
	}

	public boolean saveWorkflow(String name, WorkflowDescriptor descriptor, boolean replace) throws FactoryException {
	  return this.factory.saveWorkflow(name, descriptor, replace);
	}

	@Override
	public void load(URL arg0) throws FactoryException {
		
	}
}
