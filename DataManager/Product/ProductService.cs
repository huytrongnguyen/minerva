using DataManager.Shared;

namespace DataManager.Product;

public class ProductService(IProductStore productStore) : IDataService<ProductInfo>(productStore) {
  public ProductInfo Get(string productId) => productStore.Get(productId);

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
        NavId: "settings",
        NavName: "Settings",
        NavIcon: null,
        NavPath: $"/products/{productId}/settings",
        Children: null
      )
    };
    return navigator;
  }
}

public interface IProductStore : IDataStore<ProductInfo> {
  ProductInfo Get(string productId);
}