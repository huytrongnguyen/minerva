using Microsoft.AspNetCore.Mvc;
using DataManager.Shared;
using DataManager.Auth;

namespace DataManager.Controllers;

[Route("api/auth")] [ApiController] public class AuthController(AuthService authService, IConfiguration configuration) : ControllerBase {
  [HttpGet("verify")] public async Task<ActionResult<object>> VerifyAuthUser(string code) {
    var authUser = await authService.VerifyAuthUser(code);
    if (authUser == null || authUser.Username.IsEmpty()) {
      return StatusCode(StatusCodes.Status401Unauthorized, new { message = UnauthorizedMessage });
    }

    return Ok(authUser);
  }

  [HttpGet("verifyUrl")] public string GetVerifyUrl(string code) => configuration.GetValue<string>("OAuth:VerifyUrl").Replace("{code}", code);

  [HttpPost("verifyUser")] public ActionResult<object> VerifyUser(AuthResponse authResponse) {
    var authUser = authService.ProcessAuthResponse(authResponse);
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