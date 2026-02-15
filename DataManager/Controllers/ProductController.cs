using DataManager.Auth;
using DataManager.Product;
using DataManager.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DataManager.Controllers;

[Route("api/products")] [ApiController] [AuthFilter] public class ProductController(ProductService productService) : ControllerBase {
  [HttpGet] public IEnumerable<ProductInfo> List() => productService.List();
  [HttpGet("{productId}")] public ProductInfo Get(string productId) => productService.Get(productId);
  [HttpGet("{productId}/navigator")] public List<NavItem> GetNavigator(string productId) => productService.GetNavigator(productId);
  [HttpPost("{productId}/connections/test")] public Task<object> TestConnection(string productId, DataConnection connection) => productService.TestConnection(productId, connection);
}