namespace DataManager.Product;

public partial class ProductService {
  public List<ProductDataSet> ListProductDataSets(string productId)
      => productDataSetStore.List(productId);

  public List<ProductDataSet> UpdateProductDataSets(string productId, ProductDataSetUpdateRequest request)
      => productDataSetStore.BatchUpdate(productId, request.DataSets);

  public async Task<List<ProductDataTable>> ListProductDataTables(string productId) {
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

  public List<ProductDataTable> UpdateProductDataTables(string productId, ProductDataTablePatchRequest request)
      => productDataTableStore.BatchUpdate(productId, request.Tables);

  public async Task<List<ProductDataColumn>> ListProductDataColumns(string productId, string tableName) {
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

  public List<ProductDataColumn> UpdateProductDataColumns(string productId, string tableName, ProductDataColumnPatchRequest request)
      => productDataColumnStore.BatchUpdate(productId, tableName, request.Columns);
}