using DataManager.Shared;

namespace DataManager.Product;

public class ProductAdapter(IProductStore productStore) {
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
}