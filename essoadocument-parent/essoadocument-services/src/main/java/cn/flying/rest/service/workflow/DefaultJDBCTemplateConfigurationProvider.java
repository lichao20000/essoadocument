package cn.flying.rest.service.workflow;



import javax.sql.DataSource;

/**
 * @@author <a href="mailto:cucuchen520@yahoo.com.cn">Chris Chen</a>
 */
public class DefaultJDBCTemplateConfigurationProvider implements JDBCTemplateConfigurationProvider {


    private JDBCTemplatePropertySetDAO propertySetDAO;
    private DataSource dataSource;

    public JDBCTemplatePropertySetDAO getPropertySetDAO() {
        if (this.propertySetDAO == null) {
            JDBCTemplatePropertySetDAOImpl dao = new JDBCTemplatePropertySetDAOImpl();
            dao.setDataSource(dataSource);
            this.propertySetDAO = dao;
        }

        return this.propertySetDAO;
    }

    public void setPropertySetDAO(JDBCTemplatePropertySetDAO propertySetDAO) {
        this.propertySetDAO = propertySetDAO;
    }

    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
    }
}
