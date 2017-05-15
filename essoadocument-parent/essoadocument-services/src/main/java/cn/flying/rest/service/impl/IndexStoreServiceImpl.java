package cn.flying.rest.service.impl;

import java.util.Map;
import java.util.Set;

import javax.ws.rs.Path;

import org.springframework.stereotype.Component;

import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.service.IndexStoreService;

@Path("indexstore")
@Component
public class IndexStoreServiceImpl extends BasePlatformService implements  IndexStoreService{

	@Override
	public Map<String, Object> queryIndexByDoc(Map<String, Object> param) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String setupIndex(Map<String, Object> param) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String runIndexTask(Set<String> executeSet) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String commitIndexChange() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String debugExecutor() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String deleteIndex(String module, Map<String, String> param) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean closeIndexStore(String id, String nodeId) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean optimizeIndexStore(String id, String nodeId) {
		// TODO Auto-generated method stub
		return false;
	}

}
