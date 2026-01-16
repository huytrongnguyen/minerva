namespace DataManager.Shared;

public class TimeUtils {
  private const int ExchangeTime = 60; // 1 secs (real) = 60 secs (ingame)
  private static readonly long SystemStartTime = new DateTimeOffset(2006, 2, 14, 0, 0, 0, TimeSpan.Zero).ToUnixTimeMilliseconds();
  
  public static long GetTime() => DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

  public static  DateTimeOffset SystemTime {
    get {
      var second = (GetTime() - SystemStartTime) / 1000 * ExchangeTime;
      var minute = second / 60; second %= 60;
      var hour = minute / 60; minute %= 60;
      var day = hour / 24; hour %= 24;
      var month = day / 28; day = day % 28 + 1;
      var year = month / 12 + 723; month = month % 12 + 1;

      return new DateTimeOffset((int)year, (int)month, (int)day, (int)hour, (int)minute, (int)second, TimeSpan.Zero);
    }
  }
}