using DataManager.Shared;

namespace DataManager.Product;

public class ProductService(IProductStore productStore,
                            IProductDataTableStore productDataTableStore,
                            ITrinoStore trinoStore) : IDataService<ProductInfo>(productStore) {
  public ProductInfo Get(string productId) => productStore.Get(productId);
  public ProductInfo Update(string productId, ProductInfoPatchRequest request) => productStore.Update(productId, request);
  public Task<List<TrackedDataSet>> ListDataSets(DataConnection connection) => trinoStore.ListDataSets(connection);
  public Task<TrackedDataSet> GetConnectionDataSet(string dataSetName, DataConnection connection) => trinoStore.GetDataSet(dataSetName, connection);
  public async Task<IEnumerable<object>> UpdateProductDataTables(string productId, ProductDataSetPatchRequest request) {
    var connection = productStore.GetDataConnection(productId);
    if (string.IsNullOrWhiteSpace(connection.SqlDialect)
        || string.IsNullOrWhiteSpace(connection.Endpoint)
        || string.IsNullOrWhiteSpace(connection.ClientId)
        || string.IsNullOrWhiteSpace(connection.ClientSecret)) {
      return null;
    }

    var tables = new List<ProductDataTable>();
    foreach(var dataSet in request.DataSets) {
      foreach(var tableName in dataSet.Tables) {
        var columns = await trinoStore.ListDataColumns(tableName, connection);
        if (columns.Count == 0) continue;

        var table = new ProductDataTable(
          DataSetName: dataSet.Name,
          Name: tableName,
          DisplayName: null,
          SemanticName: null,
          Desc: null,
          Columns: [..columns.Select(x => new ProductDataColumn(
            Name: x.Name,
            DisplayName: null,
            SemanticName: null,
            Type: x.Type,
            Desc: x.Desc
          ))]
        );
        tables.Add(table);
      }
    }

    return productDataTableStore.BatchUpdate(productId, tables);
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

public interface IProductDataTableStore : IDataStore<ProductDataTable> {
  List<ProductDataTable> List(string productId);
  List<ProductDataTable> BatchUpdate(string productId, List<ProductDataTable> tables);
}
