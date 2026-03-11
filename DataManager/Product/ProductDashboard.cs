using DataManager.Shared;

namespace DataManager.Product;

public record ProductDashboard(
  string ProductId,
  long DashboardId,
  string? Name,
  bool? IsFolder,
  int? DashboardOrder,
  long? ParentId,
  List<ReportDefinition>? Reports
);

public interface IProductDashboardStore : IDataStore<ProductDashboard> {
  List<ProductDashboard> List(string productId);
  ProductDashboard Get(string productId, long dashboardId);
  ProductDashboard Update(string productId, long dashboardId, ProductDashboard request);
}
