using DataManager.Shared;

namespace DataManager.Product;

public interface IProductDataSetStore : IDataStore<ProductDataSet> {
  List<ProductDataSet> List(string productId);
  List<ProductDataSet> BatchUpdate(string productId, List<string> dataSetNames);
}

public record ProductDataSet(string Name);

public interface IProductDataTableStore : IDataStore<ProductDataTable> {
  List<ProductDataTable> List(string productId);
  List<ProductDataTable> BatchUpdate(string productId, List<ProductDataTable> tables);
}

public record ProductDataTable(
  string Name,
  string? DisplayName,
  string? SemanticName,
  string? Desc
);

public record ProductDataTablePatchRequest(List<ProductDataTable> Tables);

public record ProductDataSetPatchRequest(List<ProductDataSetPatchRequest.DataSet> DataSets) {
  public record DataSet(string Name, List<string> Tables);
};

public record ProductDataSetUpdateRequest(List<string> DataSets);

public interface IProductDataColumnStore : IDataStore<ProductDataColumn> {
  List<ProductDataColumn> List(string productId, string tableName);
  List<ProductDataColumn> BatchUpdate(string productId, string tableName, List<ProductDataColumn> columns);
}

public record ProductDataColumn(
  string Name,
  string? DisplayName,
  string? SemanticName,
  string Type,
  string Desc
);

public record ProductDataColumnPatchRequest(List<ProductDataColumn> Columns);
