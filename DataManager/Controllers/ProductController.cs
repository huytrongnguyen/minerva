using DataManager.Auth;
using DataManager.Product;
using Microsoft.AspNetCore.Mvc;

namespace DataManager.Controllers;

[Route("api/products")] [ApiController] [AuthFilter] public class ProductController(ProductService productService) : ControllerBase {
  [HttpGet] public IEnumerable<ProductInfo> List() => productService.List();
  [HttpGet("{productId}")] public ProductInfo Get(string productId) => productService.Get(productId);

  [HttpGet("{productId}/navigator")] public object GetNavigator(string productId) => productService.GetNavigator(productId);
}