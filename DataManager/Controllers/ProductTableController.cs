using DataManager.Auth;
using DataManager.Product;
using DataManager.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DataManager.Controllers;

[Route("api/products/{productId}/tables")] [ApiController] [AuthFilter]
public class ProductDataTableController(IProductDataTableStore productDataTableStore,
                                        IProductStore productStore,
                                        ITrinoStore trinoStore) : ControllerBase {
  [HttpGet] public List<ProductDataTable> ListProductDataTables(string productId) => productDataTableStore.List(productId);

  [HttpPatch] public List<ProductDataTable> UpdateProductDataTables(string productId, ProductDataTablePatchRequest request) => productDataTableStore.BatchUpdate(productId, request.Tables);

  [HttpPatch("import")] public async Task<List<ProductDataTable>> ImportProductDataTables(string productId, ProductDataSetPatchRequest request) {
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
          Desc: null
        );
        tables.Add(table);
      }
    }

    return productDataTableStore.BatchUpdate(productId, tables);
  }

  [HttpGet("{tableName}")] public async Task<List<ProductDataColumn>> ListProductDataColumns(string productId, string tableName) {
    var connection = productStore.GetDataConnection(productId);
    if (string.IsNullOrWhiteSpace(connection.SqlDialect)
        || string.IsNullOrWhiteSpace(connection.Endpoint)
        || string.IsNullOrWhiteSpace(connection.ClientId)
        || string.IsNullOrWhiteSpace(connection.ClientSecret)) {
      return null;
    }

    var columns = await trinoStore.ListDataColumns(tableName, connection);
    if (columns?.Count == 0) return null;

    return [..columns.Select(ToProductDataColumn)];
  }

  private static ProductDataColumn ToProductDataColumn(TrackedDataColumn column) {
    return new ProductDataColumn(
      Name: column.Name,
      DisplayName: null,
      SemanticName: null,
      Type: column.Type,
      Desc: column.Desc
    );
  }
}