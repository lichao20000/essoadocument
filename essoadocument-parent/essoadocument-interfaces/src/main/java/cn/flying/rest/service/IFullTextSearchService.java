package cn.flying.rest.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;

import cn.flying.rest.service.utils.MediaTypeEx;

public abstract interface IFullTextSearchService extends ICommonService {

	@GET
	@Path("getTypes")
	@Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	public List<HashMap<String, String>> getTypes();

	@POST
	@Path("search/{pageNum}/{pageSize}")
	@Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	@Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	public HashMap<String, Object> search(@PathParam("pageNum") Long pageNum,
			@PathParam("pageSize") Long pageSize, Map<String, Object> param);
}
