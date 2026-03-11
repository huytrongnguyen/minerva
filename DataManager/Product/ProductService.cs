using DataManager.Shared;

namespace DataManager.Product;

public partial class ProductService(IProductStore productStore,
                                    IProductDataSetStore productDataSetStore,
                                    IProductDataTableStore productDataTableStore,
                                    IProductDataColumnStore productDataColumnStore,
                                    IProductDashboardStore productDashboardStore,
                                    ITrinoStore trinoStore,
                                    ILogger<ProductService> logger) {
  public List<ProductInfo> List() => productStore.List();

  public ProductInfo Create(string productId) => productStore.Get(productId);

  public ProductInfo Get(string productId) => productStore.Get(productId);

  public ProductInfo Update(string productId, ProductInfoPatchRequest request) =>
    productStore.Update(productId, request);

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

  public Task<List<TrackedDataSet>> ListConnectionDataSets(DataConnection connection) =>
    trinoStore.ListDataSets(connection);

  public Task<TrackedDataSet> GetConnectionDataSet(string dataSetName, DataConnection connection) =>
    trinoStore.GetDataSet(dataSetName, connection);

  public List<NavItem> ListDashboards(string productId) {
    var dashboards = productDashboardStore.List(productId);
    var byParent = dashboards.GroupBy(x => x.ParentId ?? 0).ToDictionary(g => g.Key, g => g.ToList());
    return BuildNavItems(productId, 0, byParent);
  }

  private static List<NavItem> BuildNavItems(string productId, long parentId, Dictionary<long, List<ProductDashboard>> byParent) {
    if (!byParent.TryGetValue(parentId, out var children)) return [];
    return [..children.Select(d => new NavItem(
      NavId: d.DashboardId.ToString(),
      NavName: d.Name,
      NavIcon: null,
      NavPath: (d.IsFolder ?? false) ? null : $"/products/{productId}/dashboard/{d.DashboardId}",
      Children: (d.IsFolder ?? false) ? BuildNavItems(productId, d.DashboardId, byParent) : null
    ))];
  }
}
