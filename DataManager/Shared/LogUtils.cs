namespace DataManager.Shared;

public static class LogUtils {
  public static void Console(this ILogger logger, string msg) => logger.LogInformation("{Message}", msg);
  public static void Warning(this ILogger logger, string msg) => logger.LogWarning("{Message}", msg);
  public static void Error(this ILogger logger, string msg) => logger.LogError("{Message}", msg);
}