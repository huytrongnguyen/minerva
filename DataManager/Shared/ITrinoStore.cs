using System.Data;

namespace DataManager.Shared;

public interface ITrinoStore {
  Task<object> TestConnection(DataConnection connection);
  Task<object> ExecuteQueryAsync(DataConnection connection, string sql);
}