using DataManager.Shared;

namespace DataManager.Product;

public interface IProductDataTableStore : IDataStore<ProductDataTable> {
  List<ProductDataTable> List(string productId);
  List<ProductDataTable> BatchUpdate(string productId, List<ProductDataTable> tables);
}

public record ProductDataTable(
  string DataSetName,
  string Name,
  string? DisplayName,
  string? SemanticName,
  string? Desc
);

public record ProductDataTablePatchRequest(List<ProductDataTable> Tables);

public record ProductDataSetPatchRequest(List<ProductDataSetPatchRequest.DataSet> DataSets) {
  public record DataSet(string Name, List<string> Tables);
};

public record ProductDataColumn(
  string Name,
  string? DisplayName,
  string? SemanticName,
  string Type,
  string Desc
);
