using DataManager.Shared;

namespace DataManager.Product;

public record ProductDataColumn(
  string Name,
  string? DisplayName,
  string? SemanticName,
  string Type,
  string Desc
);

public record ProductDataColumnPatchRequest(List<ProductDataColumn> Columns);

public interface IProductDataColumnStore : IDataStore<ProductDataColumn> {
  List<ProductDataColumn> List(string productId, string tableName);
  List<ProductDataColumn> BatchUpdate(string productId, string tableName, List<ProductDataColumn> columns);
}
