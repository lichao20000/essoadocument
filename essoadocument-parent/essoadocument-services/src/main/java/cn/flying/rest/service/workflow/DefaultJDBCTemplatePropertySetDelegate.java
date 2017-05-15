package cn.flying.rest.service.workflow;

import java.util.HashMap;
import java.util.Map;

import javax.sql.DataSource;

import com.opensymphony.module.propertyset.PropertySet;
import com.opensymphony.module.propertyset.PropertySetManager;
import com.opensymphony.workflow.util.PropertySetDelegate;

public class DefaultJDBCTemplatePropertySetDelegate implements
    PropertySetDelegate {

  private DataSource dataSource;

  public DefaultJDBCTemplatePropertySetDelegate() {
    super();
  }

  @SuppressWarnings("unchecked")
  public PropertySet getPropertySet(long entryId) {
    @SuppressWarnings("rawtypes")
    Map args = new HashMap(1);
    args.put("globalKey", "" + entryId);
    DefaultJDBCTemplateConfigurationProvider configurationProvider = new DefaultJDBCTemplateConfigurationProvider();
    configurationProvider.setDataSource(getDataSource());
    args.put("configurationProvider", configurationProvider);
    return PropertySetManager.getInstance("jdbcTemplate", args);
  }

  private DataSource getDataSource() {
    return dataSource;
  }

  public void setDataSource(DataSource dataSource) {
    this.dataSource = dataSource;
  }
}
