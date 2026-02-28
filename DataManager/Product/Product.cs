using DataManager.Shared;

namespace DataManager.Product;

public interface IProductStore : IDataStore<ProductInfo> {
  ProductInfo Get(string productId);
  ProductInfo Update(string productId, ProductInfoPatchRequest request);
  DataConnection GetDataConnection(string productId);
}

public record ProductInfo(
  string ProductId,
  DateOnly? StartDate,
  string ProductName,
  string DataOwner,
  string DataProducer,
  string SqlDialect,
  DateTime CreatedAt,
  DateTime? UpdatedAt
);

public record ProductInfoPatchRequest(
  string? ProductName,
  string? DataOwner,
  string? DataProducer,
  string? SqlDialect,
  string? Endpoint,
  string? ClientId,
  string? ClientSecret
);
