using DataManager.Shared;

namespace DataManager.Auth;

public class AuthMiddleware(RequestDelegate next) {

  public async Task Invoke(HttpContext context, AuthService authService) {
    var token = context.Request.GetAuthToken();

    if (token != null) {
      try {
        // attach user to context on successful jwt validation
        var authUser = authService.GetAuthUser(token);
        context.Items["User"] = authUser;
      } catch {
        // do nothing if jwt validation fails
        // user is not attached to context so request won't have access to secure routes
      }
    }

    await next(context);
  }
}