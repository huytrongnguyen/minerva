namespace Shared;

public static class StringUtils {
  public static int ParseInt(this string str, int defaultValue = 0) => double.TryParse(str, out double value) ? Convert.ToInt32(value) : defaultValue;
}