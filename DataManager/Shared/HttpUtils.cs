namespace DataManager.Shared;

public static class HttpUtils {
  public static string GetAuthToken(this HttpRequest request) => request.Headers["auth_token"].FirstOrDefault();
}