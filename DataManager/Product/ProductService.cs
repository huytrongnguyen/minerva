using DataManager.Infrastructure;
using DataManager.Shared;

namespace DataManager.Product;

public class ProductService(IProductStore productStore, IProductEventStore productEventStore, ITrinoStore trinoStore) : IDataService<ProductInfo>(productStore) {
  public ProductInfo Get(string productId) => productStore.Get(productId);
  public ProductInfo Update(string productId, ProductInfoPatchRequest request) => productStore.Update(productId, request);
  public Task<DataConnectionStat> TestConnection(string productId, DataConnection connection) => trinoStore.TestConnection(connection);
  public IEnumerable<ProductEvent> ListEvents(string productId) => productEventStore.List(productId);
  public async Task<IEnumerable<TrackedEvent>> ListTrackedEvents(string productId) {
    var connection = productStore.GetDataConnection(productId);
    if (string.IsNullOrWhiteSpace(connection.SqlDialect)
        || string.IsNullOrWhiteSpace(connection.Endpoint)
        || string.IsNullOrWhiteSpace(connection.ClientId)
        || string.IsNullOrWhiteSpace(connection.ClientSecret)) {
      return [];
    }

    var stat = await trinoStore.TestConnection(connection);
    return stat.Tables.Select(tableName => new TrackedEvent(EventName: tableName, SemanticName: ""));
  }
  public Task<List<Dictionary<string, object>>> ExecuteQuery(string productId, string connectionId) => null;

  public List<NavItem> GetNavigator(string productId) {
    var navigator = new List<NavItem> {
      new(
        NavId: "dashboard",
        NavName: "Dashboard",
        NavIcon: null,
        NavPath: null,
        Children: [
          new(
            NavId: "smart-view",
            NavName: "Smart View",
            NavIcon: null,
            NavPath: null,
            Children: [
              new(
                NavId: "overview",
                NavName: "Overview",
                NavIcon: null,
                NavPath: $"/products/{productId}/smart-view/overview",
                Children: null
              )
            ]
          )
        ]
      ),
      new(
        NavId: "management",
        NavName: "Management",
        NavIcon: null,
        NavPath: null,
        Children: [
          new(
            NavId: "events",
            NavName: "Events",
            NavIcon: null,
            NavPath: $"/products/{productId}/events",
            Children: null
          ),
          new(
            NavId: "settings",
            NavName: "Settings",
            NavIcon: null,
            NavPath: $"/products/{productId}/settings",
            Children: null
          )
        ]
      )
    };
    return navigator;
  }


}

public interface IProductStore : IDataStore<ProductInfo> {
  ProductInfo Get(string productId);
  ProductInfo Update(string productId, ProductInfoPatchRequest request);
  DataConnection GetDataConnection(string productId);
}

public interface IProductEventStore : IDataStore<ProductEvent> {
  IEnumerable<ProductEvent> List(string productId);
}