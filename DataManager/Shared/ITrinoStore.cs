namespace DataManager.Shared;

public interface ITrinoStore {
  Task<List<TrackedDataSet>> ListDataSets(DataConnection connection);
  Task<TrackedDataSet> GetDataSet(string dataSetName, DataConnection connection);
  Task<List<TrackedDataColumn>> ListDataColumns(string tableName, DataConnection connection);
  Task<List<Dictionary<string, object>>> ExecuteQueryAsync(DataConnection connection, string sql);
}