package cn.flying.rest.service.workflow;

import com.opensymphony.workflow.StoreException;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Map;

/**
 * @author Christopher Farnham Created on Feb 27, 2004
 */
public class MySQLWorkflowStore extends JDBCWorkflowStore {

  protected String entrySequenceIncrement = null;
  protected String entrySequenceRetrieve = null;
  protected String stepSequenceIncrement = null;
  protected String stepSequenceRetrieve = null;

  @SuppressWarnings("rawtypes")
  public void init(Map props) throws StoreException {
    super.init(props);
    stepSequenceIncrement = (String) props.get("step.sequence.increment");
    stepSequenceRetrieve = (String) props.get("step.sequence.retrieve");
    entrySequenceIncrement = (String) props.get("entry.sequence.increment");
    entrySequenceRetrieve = (String) props.get("entry.sequence.retrieve");
  }

  protected long getNextEntrySequence(Connection c) throws SQLException {
    PreparedStatement stmt = null;
    ResultSet rset = null;

    try {
      stmt = c.prepareStatement(entrySequenceIncrement);
      stmt.executeUpdate();
      rset = stmt.executeQuery(entrySequenceRetrieve);

      rset.next();

      long id = rset.getLong(1);

      return id;
    } finally {
      cleanup(null, stmt, rset);
    }
  }

  protected long getNextStepSequence(Connection c) throws SQLException {
    PreparedStatement stmt = null;
    ResultSet rset = null;

    try {
      stmt = c.prepareStatement(stepSequenceIncrement);
      stmt.executeUpdate();
      rset = stmt.executeQuery(stepSequenceRetrieve);

      rset.next();

      long id = rset.getLong(1);

      return id;
    } finally {
      cleanup(null, stmt, rset);
    }
  }
}
