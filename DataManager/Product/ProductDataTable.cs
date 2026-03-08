using DataManager.Shared;

namespace DataManager.Product;

public record ProductDataTable(
  string Name,
  string? DisplayName,
  string? SemanticName,
  string? Desc
);

public record ProductDataTablePatchRequest(List<ProductDataTable> Tables);

public interface IProductDataTableStore : IDataStore<ProductDataTable> {
  List<ProductDataTable> List(string productId);
  List<ProductDataTable> BatchUpdate(string productId, List<ProductDataTable> tables);
}
