namespace DataManager.Shared;

public abstract class IDataService<T>(IDataStore<T> dataStore) {
  public IEnumerable<T> List() => dataStore.List();
}

public interface IDataStore<T> {
  IEnumerable<T> List();
}

public record NavItem(string NavId, string NavName, string NavIcon, string NavPath, List<NavItem> Children);

public record DataConnection(string SqlDialect, string Endpoint, string ClientId, string ClientSecret);
public record DataConnectionStat(List<string> Catalogs, List<string> Schemas, List<string> Tables);
