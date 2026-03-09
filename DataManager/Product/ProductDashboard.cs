using DataManager.Shared;

namespace DataManager.Product;

public record ProductDashboard(
  long DashboardId,
  string ProductId,
  string DashboardName,
  bool IsFolder,
  int DashboardOrder,
  long? ParentId
);

public interface IProductDashboardStore : IDataStore<ProductDashboard> {
  List<ProductDashboard> List(string productId);
}
