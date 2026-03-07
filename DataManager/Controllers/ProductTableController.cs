using DataManager.Auth;
using DataManager.Product;
using DataManager.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DataManager.Controllers;

[Route("api/products/{productId}/tables")] [ApiController] [AuthFilter]
public class ProductDataTableController(IProductDataTableStore productDataTableStore,
                                        IProductDataColumnStore productDataColumnStore,
                                        IProductStore productStore,
                                        IProductDataSetStore productDataSetStore,
                                        ITrinoStore trinoStore) : ControllerBase {
  [HttpGet] public async Task<List<ProductDataTable>> ListProductDataTables(string productId) {
    var dataSets = productDataSetStore.List(productId);
    if (dataSets?.Count == 0) return [];

    var dataTables = productDataTableStore.List(productId)
        .ToDictionary(x => x.Name, x => x);

    var connection = GetDataConnection(productId);

    var tables = new List<ProductDataTable>();
    foreach(var dataSet in dataSets) {
      var trackedDataSet = await trinoStore.GetDataSet(dataSet.Name, connection);
      foreach(var tableName in trackedDataSet.Tables) {
        var table = new ProductDataTable(
          Name: tableName,
          DisplayName: dataTables.GetValueOrDefault(tableName)?.DisplayName,
          SemanticName: dataTables.GetValueOrDefault(tableName)?.SemanticName,
          Desc: dataTables.GetValueOrDefault(tableName)?.Desc
        );
        tables.Add(table);
      }
    }

    return tables;
  }

  [HttpPatch] public List<ProductDataTable> UpdateProductDataTables(string productId, ProductDataTablePatchRequest request) {
    return productDataTableStore.BatchUpdate(productId, request.Tables);
  }

  [HttpGet("{tableName}")] public async Task<List<ProductDataColumn>> ListProductDataColumns(string productId, string tableName) {
    var connection = GetDataConnection(productId);

    var trinoColumns = await trinoStore.ListDataColumns(tableName, connection);
    if (trinoColumns?.Count == 0) return [];

    var savedColumns = productDataColumnStore.List(productId, tableName)
        .ToDictionary(x => x.Name, x => x);

    return [..trinoColumns.Select(c => new ProductDataColumn(
      Name: c.Name,
      DisplayName: savedColumns.GetValueOrDefault(c.Name)?.DisplayName,
      SemanticName: savedColumns.GetValueOrDefault(c.Name)?.SemanticName,
      Type: c.Type,
      Desc: c.Desc
    ))];
  }

  [HttpPatch("{tableName}")] public List<ProductDataColumn> UpdateProductDataColumns(string productId, string tableName, ProductDataColumnPatchRequest request) {
    return productDataColumnStore.BatchUpdate(productId, tableName, request.Columns);
  }

  private DataConnection GetDataConnection(string productId) {
    var connection = productStore.GetDataConnection(productId);
    if (string.IsNullOrWhiteSpace(connection.SqlDialect)
        || string.IsNullOrWhiteSpace(connection.Endpoint)
        || string.IsNullOrWhiteSpace(connection.ClientId)
        || string.IsNullOrWhiteSpace(connection.ClientSecret)) {
      throw new Exception($"Cannot access to {connection.Endpoint} with '{connection.ClientId}'");
    }

    return connection;
  }
}
