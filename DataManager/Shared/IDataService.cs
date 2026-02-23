namespace DataManager.Shared;

public abstract class IDataService<T>(IDataStore<T> dataStore) {
  public List<T> List() => dataStore.List();
}

public interface IDataStore<T> {
  List<T> List();
}

public record NavItem(string NavId, string NavName, string NavIcon, string NavPath, List<NavItem> Children);

public record DataConnection(string SqlDialect, string Endpoint, string ClientId, string ClientSecret);
public record TrackedDataSet(string Name, List<string> Tables);
public record TrackedDataColumn(string Name, string Type, string Desc);
