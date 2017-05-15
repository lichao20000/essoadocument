package cn.flying.rest.service.utils;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.config.PropertyPlaceholderConfigurer;

/**
 * 获取spring上下文配置文件信息
 * @author zhanglei 20130403
 *
 */
public class PropertyConfigurer extends PropertyPlaceholderConfigurer {
	private static Map<String, String> ctxPropertiesMap = new HashMap<String, String>();

	@Override
	protected void processProperties(ConfigurableListableBeanFactory beanFactory, Properties props) throws BeansException {
		super.processProperties(beanFactory, props);
		for (Object key : props.keySet()) {
			String keyStr = key.toString();
			String value = props.getProperty(keyStr);
			ctxPropertiesMap.put(keyStr, value);
		}
	}

	public static String getContextProperty(String name) {
		return ctxPropertiesMap.get(name);
	}
	
	public static Set<String> getPropertyKeySet() {
		return ctxPropertiesMap.keySet();
	}
	
}
