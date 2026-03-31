using Microsoft.AspNetCore.Mvc;

namespace DataManager.Controllers;

[Route("api/users")] [ApiController] public class UserController() : ControllerBase {
  [HttpGet("me")] public Dictionary<string, object> GetUserInfo(string token) {
    return new() {
      { "access_token", token },
      { "data", new Dictionary<string, object>() {
        { "username", "test" },
        { "name", "Test" }
      } }
    };
  }
}