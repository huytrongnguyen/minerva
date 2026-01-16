using Microsoft.AspNetCore.Mvc;
using DataManager.Shared;
using DataManager.Auth;

namespace DataManager.Controllers;

[Route("api/auth")] [ApiController] public class AuthController(AuthService authService) : ControllerBase {
  [HttpGet("verify")] public ActionResult<object> VerifyAuthUser(string code) {
    var authUser = authService.VerifyAuthUser(code);
    if (authUser == null || authUser.Username.IsEmpty()) {
      return StatusCode(StatusCodes.Status401Unauthorized, new { message = UnauthorizedMessage });
    }

    return Ok(authUser);
  }

  [HttpGet("user")] [AuthFilter] public ActionResult<object> GetAuthUser() {
    var token = Request.GetAuthToken();
    var authUser = authService.GetAuthUser(token);
    if (authUser == null || authUser.Username.IsEmpty()) {
      return StatusCode(StatusCodes.Status401Unauthorized, new { message = UnauthorizedMessage });
    }

    return Ok(authUser);
  }

  private const string UnauthorizedMessage = "Unauthorized";
}