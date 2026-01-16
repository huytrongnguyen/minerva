namespace DataManager.Shared;

public static class StringUtils {
  public static bool IsEmpty(this string str) => str == null || str.Trim() == "";
  public static bool IsNotEmpty(this string str) => !IsEmpty(str);
  public static string DefaultIfEmpty(this string str, string defaultStr) => IsEmpty(str) ? defaultStr : str;

  public static int ParseInt(this string str, int defaultValue = 0) => double.TryParse(str, out double value) ? Convert.ToInt32(value) : defaultValue;
}