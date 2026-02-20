using DataManager.Shared;

namespace DataManager.Product;

public class ProductService(IProductStore productStore, ITrinoStore trinoStore) : IDataService<ProductInfo>(productStore) {
  public ProductInfo Get(string productId) => productStore.Get(productId);
  public ProductInfo Update(string productId, ProductInfoPatchRequest request) => productStore.Update(productId, request);
  public Task<DataConnectionStat> TestConnection(string productId, DataConnection connection) => trinoStore.TestConnection(connection);
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
}