using DataManager.Shared;

namespace DataManager.Product;

public partial class ProductService(IProductStore productStore,
                                    IProductDataSetStore productDataSetStore,
                                    IProductDataTableStore productDataTableStore,
                                    IProductDataColumnStore productDataColumnStore,
                                    ITrinoStore trinoStore, ILogger<ProductService> logger) {
  public List<ProductInfo> List()
      => productStore.List();

  public ProductInfo Create(string productId)
      => productStore.Get(productId);

  public ProductInfo Get(string productId)
      => productStore.Get(productId);

  public ProductInfo Update(string productId, ProductInfoPatchRequest request)
      => productStore.Update(productId, request);

  public DataConnection GetDataConnection(string productId) {
    var connection = productStore.GetDataConnection(productId);
    if (string.IsNullOrWhiteSpace(connection.SqlDialect)
        || string.IsNullOrWhiteSpace(connection.Endpoint)
        || string.IsNullOrWhiteSpace(connection.ClientId)
        || string.IsNullOrWhiteSpace(connection.ClientSecret)) {
      throw new Exception($"Cannot access to {connection.Endpoint} with '{connection.ClientId}'");
    }

    return connection;
  }

  public Task<List<TrackedDataSet>> ListConnectionDataSets(DataConnection connection)
      => trinoStore.ListDataSets(connection);

  public Task<TrackedDataSet> GetConnectionDataSet(string dataSetName, DataConnection connection)
      => trinoStore.GetDataSet(dataSetName, connection);

  public List<NavItem> GetNavigator(string productId) {
    return [
      new(
        NavId: "dashboard",
        NavName: "Dashboard",
        NavIcon: null,
        NavPath: null,
        Children: [
          new(
            NavId: "complete-view",
            NavName: "Complete View",
            NavIcon: null,
            NavPath: $"/products/{productId}/dashboard/complete-view",
            Children: null
          ),
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
                NavPath: $"/products/{productId}/dashboard/smart-view:overview",
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
    ];
  }
}
