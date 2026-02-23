using DataManager.Auth;
using DataManager.Product;
using DataManager.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DataManager.Controllers;

[Route("api/products")] [ApiController] [AuthFilter] public class ProductController(ProductService productService) : ControllerBase {
  [HttpGet] public IEnumerable<ProductInfo> List() => productService.List();
  [HttpPost] public ProductInfo Create(string productId) => productService.Get(productId);
  [HttpGet("{productId}")] public ProductInfo Get(string productId) => productService.Get(productId);
  [HttpPatch("{productId}")] public ProductInfo Update(string productId, ProductInfoPatchRequest request) => productService.Update(productId, request);
  [HttpPatch("{productId}/tables")] public Task<IEnumerable<object>> UpdateProductDataTables(string productId, ProductDataSetPatchRequest request) => productService.UpdateProductDataTables(productId, request);


  [HttpPost("{productId}/connections/datasets")] public Task<List<TrackedDataSet>> ListConnectionDataSets(string productId, DataConnection connection) => productService.ListDataSets(connection);
  [HttpPost("{productId}/connections/datasets/{dataSetName}")] public Task<TrackedDataSet> GetConnectionDataSet(string productId, string dataSetName, DataConnection connection) => productService.GetConnectionDataSet(dataSetName, connection);
  // [HttpGet("{productId}/events")] public IEnumerable<ProductEvent> ListEvents(string productId) => productService.ListEvents(productId);
  // [HttpGet("{productId}/tracked-events")] public Task<IEnumerable<TrackedEvent>> ListTrackedEvents(string productId) => productService.ListTrackedEvents(productId);
  [HttpPost("{productId}/connections/execute")] public Task<List<Dictionary<string, object>>> ExecuteQuery(string productId, string connectionId) => productService.ExecuteQuery(productId, connectionId);

  [HttpGet("{productId}/navigator")] public List<NavItem> GetNavigator(string productId) => productService.GetNavigator(productId);
}
