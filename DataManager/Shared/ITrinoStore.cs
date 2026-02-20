namespace DataManager.Shared;

public interface ITrinoStore {
  Task<DataConnectionStat> TestConnection(DataConnection connection);
  Task<List<Dictionary<string, object>>> ExecuteQueryAsync(DataConnection connection, string sql);
}