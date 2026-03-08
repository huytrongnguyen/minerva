using DataManager.Auth;
using DataManager.Product;
using DataManager.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DataManager.Controllers;

[Route("api/products")] [ApiController] [AuthFilter]
public class ProductController(ProductService productService) : ControllerBase {
  [HttpGet] public List<ProductInfo> List()
      => productService.List();

  [HttpPost] public ProductInfo Create(string productId)
      => productService.Get(productId);

  [HttpGet("{productId}")] public ProductInfo Get(string productId)
      => productService.Get(productId);

  [HttpPatch("{productId}")] public ProductInfo Update(string productId, ProductInfoPatchRequest request)
      => productService.Update(productId, request);

  [HttpGet("{productId}/datasets")] public List<ProductDataSet> ListProductDataSets(string productId)
      => productService.ListProductDataSets(productId);

  [HttpPatch("{productId}/datasets")] public List<ProductDataSet> UpdateProductDataSets(string productId, ProductDataSetUpdateRequest request)
      => productService.UpdateProductDataSets(productId, request);

  [HttpGet("{productId}/tables")] public Task<List<ProductDataTable>> ListProductDataTables(string productId)
      => productService.ListProductDataTables(productId);

  [HttpPatch("{productId}/tables")] public List<ProductDataTable> UpdateProductDataTables(string productId, ProductDataTablePatchRequest request)
      => productService.UpdateProductDataTables(productId, request);

  [HttpGet("{productId}/tables/{tableName}")] public Task<List<ProductDataColumn>> ListProductDataColumns(string productId, string tableName)
      => productService.ListProductDataColumns(productId, tableName);

  [HttpPatch("{productId}/tables/{tableName}")] public List<ProductDataColumn> UpdateProductDataColumns(string productId, string tableName, ProductDataColumnPatchRequest request)
      => productService.UpdateProductDataColumns(productId, tableName, request);

  [HttpGet("{productId}/dashboard/{dashboardId}")] public DashboardDefinition GetDashboardLayout(string productId, string dashboardId)
      => productService.GetDashboardDefinition(dashboardId);

  [HttpPost("{productId}/reports/execute")] public Task<ReportResult> ExecuteReport(string productId, ProductReportExecutePostRequest request)
      => productService.ExecuteReport(productId, request);

  [HttpGet("{productId}/connection")] public DataConnection GetConnection(string productId)
      => productService.GetDataConnection(productId);

  [HttpPost("{productId}/connection/datasets")] public Task<List<TrackedDataSet>> ListConnectionDataSets(string productId, DataConnection connection)
      => productService.ListConnectionDataSets(connection);

  [HttpPost("{productId}/connection/datasets/{dataSetName}")] public Task<TrackedDataSet> GetConnectionDataSet(string productId, string dataSetName, DataConnection connection)
      => productService.GetConnectionDataSet(dataSetName, connection);


  [HttpGet("{productId}/navigator")] public List<NavItem> GetNavigator(string productId)
      => productService.GetNavigator(productId);
}
